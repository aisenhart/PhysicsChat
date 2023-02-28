const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const html = `
    <h1>Your password reset link</h1>
    <p>Click this <a href="link">link</a> to reset your password</p>

    - Physics Chat Team

`

async function sendReset(email, link) {
    nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    }).sendMail({
        from: "Physics Chat <" + process.env.EMAIL_USER + ">",
        to: email,
        subject: 'Password Reset',
        html: html.replace('link', link)
    });
}

module.exports = sendReset;
