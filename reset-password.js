const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<style type="text/css">
		body {
			margin: 0;
			padding: 0;
			font-family: Arial, sans-serif;
			font-size: 14px;
			line-height: 1.4;
			color: #333333;
			background-color: #f7f7f7;
		}

		.container {
			max-width: 600px;
			margin: 0 auto;
			padding: 20px;
			background-color: #ffffff;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		}

		h1 {
			margin: 0 0 20px;
			font-size: 24px;
			line-height: 1.2;
			color: #333333;
		}

		p {
			margin: 0 0 10px;
			font-size: 14px;
			line-height: 1.4;
			color: #333333;
		}

		a {
			color: #0275d8;
			text-decoration: none;
		}

		.btn {
			display: inline-block;
			padding: 8px 16px;
			border-radius: 4px;
			background-color: #0F4FE6;
			color: #ffffff;
			text-decoration: none;
			font-size: 14px;
			line-height: 1.4;
			cursor: pointer;
		}

		.btn:hover {
			background-color: #0F4FE6;
		}
	</style>
    </head>
<body>
	<div class="container">
		<h1>Password Reset</h1>
		<p>Hello,</p>
		<p>We received a request to reset the password associated with this email address. If you did not request a password reset, please ignore this email. If you are concerend, contact support, We are happy to help :)</p>
		<p>To reset your password, please click on the following link:</p>
		<p><a href="link-autofill" target="_blank">Reset Password</a></p>
		<p>If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
		<p>link</p>
		<p>link-autofill</p>
		<p>Thank you,</p>
		<p>The Physics Chat Team</p>
	</div>
</body>

</html>
`

async function sendReset(email, link) {
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
        subject: 'Password Reset',
        html: html.replace('link-autofill', link)
    });
}

module.exports = sendReset;
