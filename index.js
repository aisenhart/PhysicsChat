//external modules  
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//internal modules
const { Order } = require("./classes/Order");
const { User } = require("./classes/User");
const { Ban } = require("./classes/Ban");
const { Warning } = require("./classes/Warning");

//web server variables
const express = require('express');
const app = express();
const port = 8080;

//body-parser
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));


//openai INIT 
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});  
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
  if(req.cookies.auth_token){
    console.log(req.cookies.auth_token);
    console.log("User is logged in");
    res.sendFile(__dirname + '/public/homepage.html');
  } else{
    res.sendFile(__dirname + '/public/homepage.html');
    
  }
});

app.post('/loginform', (req, res) => {
  console.log('RECEIVED LOGIN REQUEST');
  console.log(req.body);
    res.redirect('/');
});

app.post('/register', (req, res) => {
  console.log('RECEIVED REGISTER REQUEST');
  console.log(req.body);
  newUser(req.ip,req.body.email,req.body.password);
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/authorization/index.html');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
);  


function newUser(ip,email,password,firstName="",lastName=""){
  let tier = 0; //free tier 
  //(ip,email,password,firstName,lastName,tier)
  let u1 = new User(ip,email,password,firstName,lastName,tier);
  console.log(u1.getAll());
}


