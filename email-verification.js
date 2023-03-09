const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


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


module.exports = function(express,app,db,){



    app.get('/verify-email', (req, res) => {
        const code = req.query.code;
        const email = req.query.email;

        if(!code || !email) return res.send("{'error':'No code or email provided'}");

        db.verifyEmail(email,code,result => {
            if(result){
                res.send({'success':'Email verified'});
                db.deleteEmailVerificationCode(email,code,() => {});
            } else {
                res.send({'error':'Email not verified'});
            }
        });

    });

    async function sendVerificationEmail(email) {
    
            db.generateEmailVerificationCode(result,code => {
                if(code){
                    sendEmail(email,code);
                }
            });


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

}
