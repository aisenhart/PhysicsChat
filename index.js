//external modules  
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//internal modules
const { Order } = require("./classes/Order");
const { User } = require("./classes/User");
const { Ban } = require("./classes/Ban");
const { Warning } = require("./classes/Warning");
const { Database } = require("./classes/Database");
const crypto = require('crypto');

//connect to database and setup class
const db = new Database();
db.connect();
//web server variables
const express = require('express');
const app = express();
const port = 8080;

//body-parser
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


//openai INIT 
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});  
const openai = new OpenAIApi(configuration);

app.get('/',verify,(req, res) => {
  res.sendFile(__dirname + '/public/homepage.html');
});

app.get('/beta', verify,(req, res) => {
  res.sendFile(__dirname + '/public/app/beta.html');
});


app.post('/login', (req, res) => {
  if(req.body.email.length==0){
    res.status(400).json({"error": "email cannot be empty"});
    return;
  }
  const email = req.body.email;
  console.log(email);
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
          res.cookie('authorization', accessToken, {secure: true}).send(accessToken);
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
      console.log(returnValue);
      let userCleaned = JSON.parse(JSON.stringify(returnValue));
      delete userCleaned.password;
      delete userCleaned.ip;
      const accessToken = jwt.sign(userCleaned, process.env.ACCESS_TOKEN_SECRET);


      res.cookie('authorization', accessToken, {secure: true}).json({"success":"user created"});
    }
    else{
      res.status(400).json({"error":"unknown error"});
    }
  });
  
});


app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/authorization/index.html');
});

app.get('/userinfo/:email', verify,(req, res) => {
  db.getUser(req.params.email, (user) => {

    //important!! if not logged in as requested user, return error
    if(jwt.decode(req.cookies.authorization).email != req.params.email){
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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
 

// Path: classes/User.js
function newUser(ip,email,password,fullName){
  const hashedPassword = bcrypt.hashSync(password, 10);
  let tier = 0; //free tier 
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
  u1.setFirstName(firstName);
  u1.setLastName(lastName);
  u1.setAccountCreatedAt(new Date().toISOString().slice(0, 19).replace("T", " "));
  u1.setAdsClicked(0);
  u1.setAdsWatched(0);
  u1.setBanned(JSON.stringify({banned: false, reason: "", date: ""}));
  u1.setCompletionsCount(0);
  u1.setOrders(JSON.stringify({}));
  u1.setUID(crypto.randomUUID());
  u1.setUsedTokens(0);
  u1.setWarnings(JSON.stringify({}));
  db.newUser(u1, (result) => {
  });
  return u1.getAll();
  

}

function verify(req,res,next){
  const token = req.cookies.authorization;
  if(!token) return res.status(401).json({"error":"Access Denied"});
  try{
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  }
  catch(err){
    res.status(400).json({"error":"Invalid Token"});
  }
}

  