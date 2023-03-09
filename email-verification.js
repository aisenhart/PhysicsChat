const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
//read blakclisted-emails.txt
const fs = require('fs');
const blacklistedEmails = fs.readFileSync('blacklisted-emails.txt', 'utf8');
//split into array
const blacklist = blacklistedEmails.split('\n');


const html = `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email</p>
    <a href="linkAutoFill">Verify Email</a>
    <style type="text/css">

        h1 {
            color: #000000;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            padding: 0;
        }

        p { 
            color: #000000;
            font-size: 16px;
            font-weight: 400;
            margin: 0;
            padding: 0;
        }

        a {
            color: #000000;
            font-size: 16px;
            font-weight: 400;
            margin: 0;
            padding: 0;
        }

`;



function sendVerificationEmail(db,email) {

            if(checkDomainBlacklist(email)){
                console.log("Email domain is blacklisted")
                return;
            }

            db.generateEmailVerificationCode(email, function(code) {
                if(code){
                    sendEmail(email,code);
                }
            });

            function checkDomainBlacklist(email){
                // Check if email domain is in blacklist.txt 
                const domain = email.split('@')[1];
                if(blacklist.includes(domain)){
                    return true;
                } else {
                    return false;
                }
            }
        


            function sendEmail(email,code){
                try{
                
                    const link = process.env.WEB_URL+"/verify-email?code="+code+"&email="+email
                    nodeMailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    }).sendMail({
                        from: "Physics Chat <" + process.env.EMAIL_USER + ">",
                        to: email,
                        subject: 'Verify Your Email',
                        html: html.replace(/linkAutoFill/g, link)
                    });

                } catch (err) {
                    console.log(err);
                }   

            }
    }


module.exports = (db,email) => {
    sendVerificationEmail(db,email);
}
