//external modules  
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
//internal modules
const { Order } = require("./classes/Order");
const { User } = require("./classes/User");
const { Ban } = require("./classes/Ban");
const { Warning } = require("./classes/Warning");
const { Database } = require("./classes/Database");
const crypto = require('crypto');
const fetch = require("node-fetch");

const MODERATION_API_URL = `https://api.openai.com/v1/moderations`;

//connect to database and setup class
const db = new Database();
db.connect();
//web server variables
const app = express();
const port = 3000;

//body-parser
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


//openai INIT 
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});  
const openai = new OpenAIApi(configuration);



let starting_balance = 20.00;



/*

GET REQUESTS

*/


app.get('/',(req, res) => {
  res.sendFile(__dirname + '/public/homepage.html');
});

app.get('/admin', verify,(req, res) => {
  if(jwt.decode(req.cookies.Authorization).tier != "admin"){
    res.status(400).json({"error": "not logged in as authorized user"});
    return;
  } else{
    res.sendFile('/private/admin.html');
  }
});

app.get('/beta', verify,(req, res) => {
  res.sendFile(__dirname + '/public/app/beta.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/authorization/index.html');
});


app.get('/account', verify,(req, res) => {
  res.sendFile(__dirname + '/public/account/index.html');
});

app.get('/userinfo/:email', verify,(req, res) => {
  db.getUser(req.params.email, (user) => {

    //important!! if not logged in as requested user, return error
    if(jwt.decode(req.cookies.Authorization).email != req.params.email){
      res.status(400).json({"error": "not logged in as requested user"});
      return;
    } else{
      user = user[0];
      let userCleaned = JSON.parse(JSON.stringify(user));
      delete userCleaned.password;
      delete userCleaned.ip;
      res.json(userCleaned);
    }
  });
});




/*

POST REQUESTS

*/


app.post('/ai', verify, async (req, res) => {
  let prompt = req.body.prompt;
  let jwtToken = req.cookies.Authorization;
  let jwtUser = jwt.decode(jwtToken);
  let engine;
  //check if user is banned
   db.getUser(jwtUser.email, (user) => {
    if(!user[0]){
      res.status(400).json({"error": "user does not exist"});
      return;
    }
    
    user = user[0];
    let tier = user.tier.toLowerCase();

    if(user.balance <= 0){
      res.status(400).json({"error": "user has used up their tokens"});
      return;
    }
  
    if(user.banned.banned){
      db.expireWarnings(user.email);
      res.status(400).json({"error": "user is banned"});
      return;
    } 

    if(user.warnings.length > 0){
      db.expireWarnings(user.email);
    }

    if(tier == "free"){
      engine = "text-curie-001";
    }
    else if(tier == "pro"){
      engine = "text-davinci-003";
    } else{
      res.status(400).json({"error": "invalid tier"});
      return;
    }

    // calculate tokens
    if(calculateTokenCost(prompt) > user.balance){
      res.status(400).json({"error": "user does not have enough tokens"});
      return;
    }
  
    //make sure prompt is not agauist terms of service
    const headers = 
    {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.API_KEY}`,
    };
    const moderator = fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
      input: prompt,
      }),
    });
    moderator.then((response) => response.json()).then((data) => {
      //console.log(data);
      let results = data.results;
      let categories = [];

      //if flagged, return message and add warning to database
      for(let i = 0; i < data.results.length; i++){
        //http response-------------------
        if(results[i].flagged == true){
          res.status(400).json({"error": "prompt is not acceptable"});
          for(let i = 0; i < results.length; i++){
            if(results[i].flagged == true){
              categories.push(results[i].category);
            }
          }
          //add warning to database

          db.giveWarning(user.email, results[i].categories, (warning) => {
            //console.log(warning);
          });
          return;
        }
      }
      const response = openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 256,
        temperature: 0,
      }).catch((error) => {
        console.log(error);
        res.status(400).json({"error": "error with openai api"});
      });
      response.then((data) => {
        //console.log(data);
        let completion = data.data.choices[0].text;
        res.json({"completion": completion});
        db.decrementBalance(user.email,data.data.usage.total_tokens);
      });
   });
});
});


app.post('/login', (req, res) => {
  if(req.body.email){
    if(req.body.email.indexOf("@") == -1){
      res.status(400).json({"error":"invalid email"});
      return;
    }
    if(req.body.email == null|| req.body.email.length == 0){
      res.status(400).json({"error": "email cannot be empty"});
      return;
    }
  } else{
    res.status(400).json({"error": "email cannot be empty"});
    return;
  }
  const email = req.body.email;
  db.getUser(email, (user) => {
    if(user[0] == undefined){
      res.status(400).json({"error": "user does not exist"});
      return;
    } else{
      user = user[0];
      let userCleaned = JSON.parse(JSON.stringify(user));
      delete userCleaned.password;
      delete userCleaned.ip;
      try{
        if(bcrypt.compareSync(req.body.password, user.password)){
          const accessToken = jwt.sign(userCleaned, process.env.ACCESS_TOKEN_SECRET);
          res.cookie('Authorization', accessToken).send({"success": "logged in"});
          //res.cookie('Authorization', accessToken, {secure: true}).send(accessToken);


          //if new IP, update IP
          if(user.ip != req.ip){
            db.updateIP(email, req.ip);
          }
          if(user.warnings.length > 0 || user.banned.banned){
            db.expireWarnings(email);
          }
        } else{
          res.status(400).json({"error": "passwords do not match"});
        }
      } catch(err){
        console.log(err);
        res.status(500).send();
      }
    }
  });
});

app.post('/register', (req, res) => {
  db.getUser(req.body.email, (user) => {

    if(!req.body.email||!req.body.password||!req.body.fullname){
      res.status(400).json({"error":"missing fields"});
      return;
    }

    if(req.body.email.indexOf("@") == -1){
      res.status(400).json({"error":"invalid email"});
      return;
    }
    if(req.body.password.length < 8){
      res.status(400).json({"error":"password must be at least 8 characters"});
      return;
    }
    if(req.body.fullname.length < 3){
      res.status(400).json({"error":"full name must be at least 3 characters"});
      return;
    }

    if(user[0]!=undefined){res.status(400).json({"error":"user already exists"}); return;}
    let returnValue = newUser(req.ip,req.body.email,req.body.password,req.body.fullname);
    if(returnValue.UID!=undefined){
      //console.log(returnValue);
      let userCleaned = JSON.parse(JSON.stringify(returnValue));
      delete userCleaned.password;
      delete userCleaned.ip;
      const accessToken = jwt.sign(userCleaned, process.env.ACCESS_TOKEN_SECRET);

      res.cookie('Authorization', accessToken).send({"success": "user created"});
      //res.cookie('Authorization', accessToken, {secure: true}).json({"success":"user created"});
    }
    else{
      res.status(400).json({"error":"unknown error"});
    }
  });
  
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
 

// Path: classes/User.js
function newUser(ip,email,password,fullName){
  const hashedPassword = bcrypt.hashSync(password, 10);
  let tier = "free"; //free tier 
  //(ip,email,password,firstName,lastName,tier)
  let firstName;
  let lastName;
  if(fullName.indexOf(" ") == -1){
    firstName = fullName;
    lastName = "";
  } else{
    firstName = fullName.split(" ")[0];
    lastName = fullName.split(" ")[1];
  }
  let u1 = new User(ip,email,hashedPassword,firstName,lastName,tier);
  u1.setBalance(starting_balance);
  u1.setFirstName(firstName);
  u1.setLastName(lastName);
  u1.setAccountCreatedAt(new Date().toISOString().slice(0, 19).replace("T", " "));
  u1.setAdsClicked(0);
  u1.setAdsWatched(0);
  u1.setBanned(JSON.stringify({"banned": false, "reason": "", "date": ""}));
  u1.setCompletionsCount(0);
  u1.setOrders(JSON.stringify({"orders": []}));
  u1.setUID(crypto.randomUUID());
  u1.setUsedTokens(0);
  u1.setWarnings(JSON.stringify({"warnings": []}));
  db.newUser(u1, (result) => {
  });
  return u1.getAll();
  

}

function verify(req,res,next){
  const token = req.cookies.Authorization;
  if(!token) return res.status(401).redirect("/login");
  try{
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  }
  catch(err){
    res.status(400).json({"error":"Invalid Token"});
  }
}


function calculateTokenCost(inputString){
  //space = 1 token
  //new line = 1 token
  //character = 0.25 tokens
  let tokens = 0;
  for(let i = 0; i < inputString.length; i++){
    if(inputString[i] == " "){
      tokens++;
    } else if(inputString[i] == "\n"){
      tokens++;
    }
    else{
      tokens += 0.25;
    }
  }
  return tokens
}
