//external modules  
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const gptEncoder = require('gpt-3-encoder');
//internal modules
const sendReset  = require('./reset-password');
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


//import express routes from ./stripe.js
require('./stripe')(express,bodyParser,app,db,process.env.STRIPE_SECRET_KEY,process.env.STRIPE_PUBLISHABLE_KEY,process.env.DOMAIN);
const sendVerificationEmail = require('./email-verification')


//read tiers.json
let tiers = require('./tiers.json');
const e = require("express");

//read email verification routes

 
//openai INIT 
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});  
const openai = new OpenAIApi(configuration);

//let tokenizerGPT3 = new GPT3Tokenizer.GPT3Tokenizer({type: "gpt3"});
//let tokenizerCODEX = new GPT3Tokenizer.GPT3Tokenizer({type: "codex"});
//

// ------------------------------
// ------------------------------


/*

GET REQUESTS

*/


app.get('/',(req, res) => {
  res.sendFile(__dirname + '/public/homepage.html');
});

app.get('/admin', verify,(req, res) => {
  let email = jwt.decode(req.cookies.Authorization).email;
  db.getUser(email, (user) => {
    if(user[0].tier != "admin"){
      res.status(400).json({"error": "not admin"});
    } else{
      res.sendFile(__dirname+'/private/admin.html');
    }
  });
});

app.get('/beta', verify,(req, res) => {
  res.sendFile(__dirname + '/public/app/beta.html');
});

app.get('/privacy',(req, res) => {
  res.sendFile(__dirname + '/public/privacy-policy.html');
});
app.get('/tos',(req, res) => {
  res.sendFile(__dirname + '/public/tos.html');
});
app.get('/disclaimer',(req, res) => {
  res.sendFile(__dirname + '/public/disclaimer.html');
});
app.get('/cookie',(req, res) => {
  res.sendFile(__dirname + '/public/cookie-policy.html');
});
app.get('/shop',(req, res) => {
  res.sendFile(__dirname + '/public/shop.html');
  //res.send("<h3>Thanks Beta Testers</h3>Shop is currently closed. We are working on the page and do not want to take any orders at this time. Please check back later.")
});

app.get('/login', (req, res) => {
  //if already logged in, redirect to beta 
  if(req.cookies.Authorization){
    res.redirect('/beta');
    return;
  }
  res.sendFile(__dirname + '/public/authorization/login.html');
});

app.get('/sign-out', verify, (req, res) => {
  //overwrite authorization cookie to sign out
  res.send('<script>document.cookie = "Authorization= ; expires = Thu, 01 Jan 1970 00:00:00 GMT", document.location.href = "/";</script>');
});

//get users amount of tokens
app.get('/token-count', (req, res) => {
  let email = jwt.decode(req.cookies.Authorization).email;
  db.getUser(email, (user) => {
    if(user[0]){
      res.json({"tokens": user[0].balance});
      
    } else {
      res.status(400).json({"error": "user does not exist"});
    }
  });
});

app.get('/account', verify,(req, res) => {
  res.sendFile(__dirname + '/public/authorization/account.html');
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

app.get('/get-name-tier/:email',(req, res) => {
  db.getUser(req.params.email, (user) => {
      if(!user[0]){
        res.status(400).json({"error": "user does not exist"});
        return;
      }


      user = user[0];
      res.json({"firstName": user.firstName, "tier": user.tier});
  });
});
app.get('/get-user-info',(req, res) => {
  if(req.cookies.Authorization == undefined){
    res.status(400).json({"error": "not logged in"});
    return;
  }
  let email = jwt.decode(req.cookies.Authorization).email;
  db.getUser(email, (user) => {
      if(!user[0]){
        res.status(400).json({"error": "user does not exist"});
        return;
      }
      user = user[0];

      if(user.verified==0){
        user.verified = false;
      } else{
        user.verified = true;
      }

      res.json({
      "firstName": user.firstName, 
      "lastName": user.lastName, 
      "tier": user.tier, 
      "balance": user.balance, 
      "email": user.email, 
      "completionsCount": user.completionsCount,
      "usedTokens": user.usedTokens,
      "verified": user.verified,
      "tierMaxTokenRequest": tiers[user.tier]['max_tokens']
    });
  });
});
//get user email from cookie?

/*

POST REQUESTS

*/


app.post('/ai', verify, async (req, res) => {
  let prompt = req.body.prompt;
  let maxTokens = req.body.maxTokens;
  console.log(prompt)
  console.log(maxTokens);
  console.log(calculateTokenCost(prompt));

  if(!prompt||prompt.length < 1){
    res.status(400).json({"error": "prompt is empty"});
    return;
  }

  let jwtToken = req.cookies.Authorization;
  let jwtUser = jwt.decode(jwtToken);
  let engine;


   db.getUser(jwtUser.email, (user) => {
    if(!user[0]){
      res.status(400).json({"error": "user does not exist"});
      return;
    } else if (user[0].verified == 0){
      res.status(400).json({"error": "user has not verified their email"});
      return;
    }
    
    user = user[0];
    let tier = user.tier.toLowerCase();

    if(user.balance <= 0){
      res.status(400).json({"error": "user has used up their tokens"});
      return;
    }
  
    //jsonify the banned object and warnings object
    let ban = JSON.parse(user.banned);
    let warnings = JSON.parse(user.warnings);

    //if user is banned, return error
    if(ban.banned){
      res.status(400).json({"error": "user is banned"});
      return;
    }

    //if user has warnings, expire them
    if(warnings.warnings > 0){
      db.expireWarnings(user.email);
    }



    // see if tier is in tiers
      
    if(!tiers[tier]){
      res.status(400).json({"error": "user tier does not exist"});
      return;
    }

    //remember to uncomment this
    // calculate tokens
    //if(calculateTokenCost(prompt) > user.balance){
    //  res.status(400).json({"error": "user does not have enough tokens"});
    //  return;
    //}
  //
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
      
      const response = openai.createChatCompletion({
        model: tiers[tier].engine,
        messages: [{role:"user",content:prompt}],
        max_tokens: maxTokens,
        temperature: 0,
        user: user.UID
      }).catch((error) => {
        console.log(error);
        res.status(400).json({"error": "error with openai api"});
        return;
      });
      response.then((data) => {
        console.log(data.data.usage);
        let completion = data.data.choices[0].message.content;
        res.json({"completion": completion});
        if(data.data.usage.completion_tokens>0){
          db.decrementBalance(user.email,data.data.usage.total_tokens);
        }
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
          res.cookie('Authorization', accessToken,{maxAge:Date.now()+3600000,overwrite:true}).send({"success": "logged in"});
          //res.cookie('Authorization', accessToken, {secure: true}).send(accessToken);

          let ip = req.headers['X-Real-IP'] || req.connection.remoteAddress;
          //if new IP, update IP
          if(user.ip != ip){
            db.updateIP(email, ip);
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

    else if(req.body.email.indexOf("@") == -1||req.body.email.indexOf(".") == -1){
      console.log('ye');
      res.status(400).json({"error":"invalid email"});
      return;
    }

    else if(req.body.password.length < 8){
      res.status(400).json({"error":"password must be at least 8 characters"});
      return;
    }
    else if(req.body.fullname.length < 3){
      res.status(400).json({"error":"full name must be at least 3 characters"});
      return;
    }

    if(user[0]!=undefined){res.status(400).json({"error":"user already exists"}); console.log(user);return;}

    //proxy_set_header  X-Real-IP $remote_addr;

    //get ip address from header 
    let ip = req.headers['X-Real-IP'] || req.connection.remoteAddress;
    console.log('\n\n\n\n\n')
    console.log(ip);
    console.log('\n\n\n\n\n')



    let returnValue = newUser(req.ip,req.body.email,req.body.password,req.body.fullname);
    if(returnValue.UID!=undefined){
      //console.log(returnValue);
      let userCleaned = JSON.parse(JSON.stringify(returnValue));
      delete userCleaned.password;
      delete userCleaned.ip;
      const accessToken = jwt.sign(userCleaned, process.env.ACCESS_TOKEN_SECRET);

      if(!req.body.noauth){
        res.cookie('Authorization', accessToken,{maxAge:3600000,overwrite:true}).send({"success": "user created"});
      } else{
        console.log("user created")
        res.json({"success": "user created"});
      }

      //res.cookie('Authorization', accessToken, {secure: true}).json({"success":"user created"});
    }
    else{
      res.status(400).json({"error":"unknown error"});
    }
  });
  
});

app.post("/submit-contact-request", (req, res) => {
  // client : $.post("/submit-contact-request", {name: name, email: email, subject: subject, message: message}, function(data){
  let id = crypto.randomUUID();
  let email = req.body.email;
  let name = req.body.name;
  let subject = req.body.subject;
  let message = req.body.message;
  let timestamp = new Date();
  if(!email || !name || !subject || !message){
    res.status(400).json({"error": "missing fields"});
    return;
  }
  if(email.indexOf("@") == -1){
    res.status(400).json({"error": "invalid email"});
    return;
  }
  //ZAYD LOOK HERE
  res.json({"success": "message sent"});
  console.log("contact request from " + email + " with id " + id);
  console.log('details: ' + name + " " + subject + " " + message);
  db.addContactRequest(id, email, name, subject, message, timestamp);
});

app.get('/searchUser', verify, (req, res) => {
  // client email="",UID="",IP="",firstName="",lastName=""
  let email = jwt.decode(req.cookies.Authorization).email;
  db.getUser(email, (user) => {
    user = user[0];
    if(user == undefined){
      res.status(400).json({"error": "not logged in as authorized user"});
      return;
    }
    if(user.tier != "admin"){
      res.status(400).json({"error": "not logged in as authorized user"});
      return;
    } else{
      let searchParams = req.query;
      db.searchUser(searchParams, (users) => {
        res.json(users);
      });
    }
  });
});


app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/public/authorization/forgot.html');
});


app.post('/forgot-password', (req, res) => {
  console.log(req.body);
  if(req.body.email == null || req.body.email.length == 0){
    res.status(400).json({"error": "email cannot be empty"});
    return;
  }
  const email = req.body.email;
  db.getUser(email, (user) => {
    if(user[0] == undefined){
      res.status(400).json({"error": "user does not exist"});
      return;
    } 
    db.generateResetPasswordToken(email, (result) => {
      if(result == undefined){
        res.status(400).json({"error": "unknown error"});
        return; 
      } 
      sendReset(req.body.email, process.env.WEB_URL+"/reset-password?token=" + result+"&email="+email);
      res.json({"success": "email sent"});
    });
  });
});


app.get('/reset-password', (req, res) => {
  db.verifyResetPasswordToken(req.query.email,req.query.token, (user) => {
    if(user.length == 0){
      res.status(400).send('<div style="text-align:center; margin-top: 20%;"><h1>Invalid password reset token</h1> <a href="/forgot-password">Click here to reset your password</a><div>')
      return;
    }

    if(user[0].created+900000 < Date.now()){
      res.status(400).json({"error": "token expired"});
      return;
    }

    res.sendFile(__dirname + '/public/authorization/reset.html');  
  });
});

app.post('/reset-password', (req, res) => {
  console.log(req.body);
  if(req.body.password == null || req.body.password.length == 0){
    res.status(400).json({"error": "password cannot be empty"});
    return;
  }
  if(req.body.password.length < 8){
    res.status(400).json({"error": "password must be at least 8 characters"});
    return;
  }

  const email = req.body.email;
  const token = req.body.token;
  const password = req.body.password;
  
  db.verifyResetPasswordToken(email,token, (user) => {
    console.log(user)
    if(user.length == 0){
      res.status(400).json({"error": "invalid token"});
      return;
    }
    if(user[0].created+900000 < Date.now()){
      res.status(400).json({"error": "token expired"});
      return;
    }
    db.resetPassword(email, bcrypt.hashSync(password, 10), (result) => {
      if(result == undefined){
        res.status(400).json({"error": "unknown error"});
        return;
      }
      res.json({"success": "password reset"});
    });
  });
});


app.get('/verify-email', (req, res) => {
  const code = req.query.code;
  const email = req.query.email;

  if(!code || !email) return res.send("{'error':'No code or email provided'}");
  db.getEmailVerificationCode(email,code,result => {
      
      if(result.length>0){
          
        db.verifyEmailVerificationCode(email,code,result => {
            if(result){
                res.redirect('/account');
                db.deleteEmailVerificationCode(email,code,() => {});
            } else {
                res.send({'error':'Email not verified'});
            }
        });
      } else {
          res.send({'error':'Invalid code'});
      }  
  });
});


app.post('/verify-email', (req, res) => {
  const email = req.body.email;
  if(!email) return res.send("{'error':'No email provided'}");
  db.getUser(email, resultUser => {

      if(resultUser.length>0){
          if(resultUser[0].verified==1){
              res.send({'error':'Email already verified'});
          } else {
             db.getEmailVerificationCodesByEmail(email,result => {
                  if(result.length>0){
                      for(let i=0;i<result.length;i++){
                          db.deleteEmailVerificationCode(email,result[i].code,() => {});
                      }
                  }
                  sendVerificationEmail(db,resultUser[0].email);
                  res.send({'success':'Verification email sent'});
              });
          }
      } else {
          res.send({'error':'User not found'});
      }
  });
});

app.post('/get-prompt-cost',(req, res) => {
  if(req.body.prompt){
    res.json({"cost":calculateTokenCost(req.body.prompt)});
  } else{
    res.json({"cost":0});
  }
    
});



app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/public/contact.html');
});


app.get('*', function(req, res){
  res.sendFile(__dirname+'/public/404.html');
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
  u1.setBalance(tiers['free'].tokens);
  u1.setFirstName(firstName);
  u1.setLastName(lastName);
  u1.setAccountCreatedAt(Date.now());
  u1.setBanned(JSON.stringify({"banned": false, "reason": "", "date": ""}));
  u1.setCompletionsCount(0);
  u1.setOrders(JSON.stringify({"orders": []}));
  u1.setUID(crypto.randomUUID());
  u1.setUsedTokens(0);
  u1.setWarnings(JSON.stringify({"warnings": []}));
  db.newUser(u1, (result) => {
  });
  sendVerificationEmail(db,email);
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
  let encoded = gptEncoder.encode(inputString);
  return encoded.length;
}

calculateTokenCost("Hello World");


