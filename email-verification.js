const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
//read blakclisted-emails.txt
const fs = require('fs');
const blacklistedEmails = fs.readFileSync('blacklisted-emails.txt', 'utf8');
//split into array
const blacklist = blacklistedEmails.split('\n');


const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007bff; font-size: 36px; font-weight: 600; margin: 40px 0 20px 0;">Verify Your Email</h1>
        <p style="color: #4D4D4D; font-size: 18px; font-weight: 400; margin: 0 0 40px 0;">Please click the button below to verify your email address:</p>
        <a href="linkAutoFill" style="display: inline-block; padding: 16px 32px; background-color: #007bff; color: #FFFFFF; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 8px;">Verify Email</a>
    </div>
    <style type="text/css">
        /* Reset default styles */
        body, p {
            margin: 5%;
            padding: 0;
        }
    </style>
    <p style="font-size: 14px; color: #8D8D8D; margin-top: 40px; text-align: center;">This email was sent from the Physics Chat team.</p>
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
