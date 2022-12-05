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

app.get('/', authenticateToken,(req, res) => {
  res.sendFile(__dirname + '/public/homepage.html');
});

app.post('/loginform', async (req, res) => {
  console.log('RECEIVED LOGIN REQUEST');
  console.log(req.body);
  const email = req.body.email;
  user = db.getUser(email, (user) => {
    user = user[0];
    console.log(user);
    if(user == undefined){
      res.status(400).send("User not found");
    }
    try{
      if(bcrypt.compare(req.body.password, user.password)){
        console.log("PASSWORDS MATCH");
        //const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        //res.json({accessToken: accessToken});
      } else{
        res.status(400).send("Wrong password");
      }
    }
    catch(err){
      res.status(500).send()
    }
    //const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    //res.json({ accessToken: accessToken });
  });
  res.redirect('/');


});

app.post('/register', (req, res) => {
  let user = newUser(req.ip,req.body.email,req.body.password,req.body.fullname);
  if(user == undefined){
    res.status(400).send("User already exists");
  } else{
    console.log("USER CREATED");
  }
});

app.get('/stop', (req, res) => {
  res.send('Server stopped');
  db.end();
  process.exit();
});



app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/authorization/index.html');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
 

// Path: classes/User.js
function newUser(ip,email,password,fullName){
  let checkUser = db.getUser(email, (user) => {});
  if(checkUser.length > 0){
    return undefined;
  } 

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
  u1.setAuthToken();
  u1.setRefreshToken();
  u1.setAccountCreatedAt(new Date().toISOString().slice(0, 19).replace("T", " "));
  u1.setAdsClicked(0);
  u1.setAdsWatched(0);
  u1.setBanned(JSON.stringify({banned: false, reason: "", date: ""}));
  u1.setCompletionsCount(0);
  u1.setOrders(JSON.stringify({}));
  u1.setUID(u1.getAccountCreatedAt());
  u1.setUsedTokens(0);
  u1.setWarnings(JSON.stringify({}));
  db.newUser(u1, (result) => {
    //console.log(result);
  });
  return u1;
}

function authenticateToken(req,res,next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
  