const mysql = require('mysql');
const { Warning } = require("./Warning");
const { Ban } = require("./Ban");
const { User } = require("./User");
const { Order } = require("./Order");
const crypto = require('crypto');

require('dotenv').config();

const WARNING_LIMIT = 3;

class Database {
    #db;
    constructor() {
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
    }
    connect() {
        this.db.connect((err) => {
            if (err) {
                throw err;
            }
            console.log('Connected to database');
        });
    }

    query(sql, callback) {
        this.db.query(sql, (err) => {
            if (err) {
                throw err;
            }
            callback();
        });
    }

    getUser(email, callback) {
        this.db.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    getUserByUID(UID, callback) {
        this.db.query(`SELECT * FROM users WHERE UID = '${UID}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    getUsersByIP(ip, callback) {
        this.db.query('SELECT * FROM users WHERE ip = ?', [ip], (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    getUsersByFirstName(firstName, callback) {
        this.db.query('SELECT * FROM users WHERE firstName = ?', [firstName], (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    getUsersByLastName(lastName, callback) {
        this.db.query('SELECT * FROM users WHERE lastName = ?', [lastName], (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    getUsersByFullName(firstName, lastName, callback) {
        this.db.query('SELECT * FROM users WHERE firstName = ? AND lastName = ?', [firstName, lastName], (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    newUser(user, callback) {
        this.db.query(`INSERT INTO users (ip, email, password, firstName, lastName, tier, balance, UID, warnings, completionsCount, usedTokens, orders, accountCreatedAt, banned) VALUES ('${user.getIp()}','${user.getEmail()}','${user.getPassword()}','${user.getFirstName()}','${user.getLastName()}','${user.getTier()}','${user.getBalance()}','${user.getUID()}','${user.getWarnings()}','${user.getCompletionsCount()}','${user.getUsedTokens()}','${user.getOrders()}','${user.getAccountCreatedAt()}','${user.getBanned()}')`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    end() {
        this.db.end();
        console.log("STOPPED DATABASE");
    }

    deleteUser(email, callback) {
        this.db.query(`DELETE FROM users WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    decrementBalance(email, amount) {
        this.getUser(email, (user) => {
            let newAmount = user[0].balance - amount;
            this.db.query(`UPDATE users SET balance = '${newAmount}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }

                this.incrementCompletionCount(email);  
                this.incrementUsedTokens(email,amount);

            }
            );
        });
    }
    setBalance(email, amount, callback) {
        this.db.query(`UPDATE users SET balance = '${amount}' WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }
    giveWarning(email, reason, callback) {
        this.expireWarnings(email);
        this.getUser(email, (user) => {

            let newList = JSON.parse(user[0].warnings);
            user = user[0];
            let message = "Please refrain from submitting content that violates our Terms of Service"
            const today = new Date();    
            const thirty_days_from_now = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            newList.warnings.push(new Warning(user.UID, crypto.randomUUID(), today, "System", reason, thirty_days_from_now, message, user.ip).toJson());
            newList = JSON.stringify(newList);
            this.db.query(`UPDATE users SET warnings = '${newList}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(result);
            }
            );

            //if warnings > WARNING_LIMIT, ban user
            if (JSON.parse(newList).warnings.length > WARNING_LIMIT) {
                this.banUser(email, "System", "Too many warnings", thirty_days_from_now, (result) => {
                    console.log("Banned user");
                });
            }
        });
    }
    //constructor(UID,bannedAt,bannedBy,reason,bannedUntil,banned,bannedIP){
    banUser(email, bannedBy, reason, expires, callback) {
        this.getUser(email, (user) => {
            user = user[0];
            const today = new Date(); 
            this.db.query(`UPDATE users SET banned = '${JSON.stringify(new Ban(user.UID, today, bannedBy, reason, expires, true, user.ip).toJson())}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(result);
            });
        });
    }
    unbanUser(email, callback) {
        this.expireWarnings(email);
        this.getUser(email, (user) => {
            user = user[0];
            this.db.query(`UPDATE users SET banned = '{"banned": false, "reason": "", "date": ""}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(result);
            });
        });
    }
    expireWarnings(email) {
        this.expireBan(email);
        this.getUser(email, (user) => {
            user = user[0];
            let newList = JSON.parse(user.warnings);
            newList.warnings.forEach((warning) => {
                if (Date.parse(warning.warningUntil)< new Date()) {
                    newList.warnings.splice(newList.warnings.indexOf(warning), 1);
                }
            });
            newList = JSON.stringify(newList);
            this.db.query(`UPDATE users SET warnings = '${newList}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
            });
        });
    }
    expireBan(email) {
        this.getUser(email, (user) => {
            user = user[0];
            let ban = JSON.parse(user.banned);
            if (Date.parse(ban.bannedUntil) < new Date()) {
                this.unbanUser(email, (result) => {
                    console.log("Unbanned user");
                });
            }
        });
    }


    updateIP(email, ip) {
        this.db.query(`UPDATE users SET ip = '${ip}' WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
        });
    }

    incrementCompletionCount(email) {
        this.getUser(email, (user) => {
            user = user[0];
            let newCount = user.completionsCount + 1;
            this.db.query(`UPDATE users SET completionsCount = '${newCount}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
            });
        });
    }

    incrementUsedTokens(email, amount) {
        this.getUser(email, (user) => {
            user = user[0];
            let newCount = user.usedTokens + amount;
            this.db.query(`UPDATE users SET usedTokens
                = '${newCount}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
            });
        });
    }
    getFirstName(email) {
        this.getUser(email, (user) => {
            user = user[0];
            return user.firstName;
        });
    }

    searchUser(searchParams, callback) {
        let email = searchParams.email;
        let UID = searchParams.UID;
        let IP = searchParams.IP;
        let firstName = searchParams.firstName;
        let lastName = searchParams.lastName;

        //IF EMAIL IS NOT EMPTY
        if(email!=""){
            this.getUser(email, (user) => {
                callback(user);
            });
        }
        //IF UID IS NOT EMPTY
        else if(UID!=""){
            this.getUserByUID(UID, (user) => {
                callback(user);
            });
        }

        //IF FIRST AND LAST NAME ARE NOT EMPTY
        else if(firstName!="" && lastName!=""){
            this.getUsersByFullName(firstName, lastName, (user) => {
                callback(user);
            });
        }

        //IF FIRSTNAME IS NOT EMPTY
        else if(firstName!=""){
            this.getUsersByFirstName(firstName, (user) => {
                callback(user);
            });
        }
        //IF LASTNAME IS NOT EMPTY
        else if(lastName!=""){
            this.getUsersByLastName(lastName, (user) => {
                callback(user);
            });
        }

        //IF IP IS NOT EMPTY
        else if(IP!=""){
            this.getUsersByIP(IP, (user) => {
                callback(user);
            });
        }
        

        //IF ALL ARE EMPTY
        else{
            callback(null);
        }
    }

    generateResetPasswordToken(email, callback) {
        this.getUser(email, (user) => {
            user = user[0];
            let token = crypto.randomUUID();
            this.db.query(`INSERT INTO passwordResetCodes (email, resetCode,created) VALUES ('${email}', '${token}', '${Date.now()}')`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(token);
            }
            );
        });
    }

    deleteResetPasswordToken(email, callback) {
        this.db.query(`DELETE FROM password-reset-codes WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    resetPassword(email, password, callback) {
        this.db.query(`UPDATE users SET password = '${password}' WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }
    verifyResetPasswordToken(email, token, callback) {
        this.db.query(`SELECT * FROM passwordResetCodes WHERE email = '${email}' AND resetCode = '${token}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    addBalance(email,amount,callback){
        this.getUser(email,(user)=>{
            user = user[0];
            let newBalance = user.balance + amount;
            this.db.query(`UPDATE users SET balance = '${newBalance}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(result);
            });
        });
    }

    appendOrder(email,order,callback){
        this.getUser(email,(user)=>{
            user = user[0];
            let newOrders = user.orders;
            //string to json
            let allOrders = JSON.parse(newOrders);
            newOrders = allOrders.orders;
            newOrders.push(order);
            this.db.query(`UPDATE users SET orders = '${JSON.stringify(allOrders)}' WHERE email = '${email}'`, (err, result) => {
                if (err) {
                    throw err;
                }
                callback(result);
            });
        });
    }

    generateEmailVerificationCode(email,callback){
        let code = crypto.randomUUID();
        this.db.query(`INSERT INTO emailVerification (email, code,created) VALUES ('${email}', '${code}', '${Date.now()}')`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(code);
        });

    }


    //see if verification code exists
    getEmailVerificationCode(email,code,callback){
        this.db.query(`SELECT * FROM emailVerification WHERE email = '${email}' AND code = '${code}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    verifyEmailVerificationCode(email,code,callback){
        this.db.query(`SELECT * FROM emailVerification WHERE email = '${email}' AND code = '${code}'`, (err, result) => {
            if (err) {
                throw err;
            }
            if(result.length>0){
                this.db.query(`UPDATE users SET verified = 1 WHERE email = '${email}'`, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    callback(result);
                });
            }
        });
    }

    
    getEmailVerificationCodesByEmail(email,callback){
        this.db.query(`SELECT * FROM emailVerification WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }

    deleteEmailVerificationCode(email,code,callback){
        this.db.query(`DELETE FROM emailVerification WHERE email = '${email}' AND code = '${code}'`, (err, result) => {
            if (err) {
                throw err;
            }    
            callback(result);
        });    
    }
    //ZAYD LOOK HERE
    addContactRequest(id, email, name, subject, message, timestamp){
        this.db.query(`INSERT INTO contact (id, email, name, subject, message, timestamp) VALUES ('${id}', '${email}', '${name}', '${subject}', '${message}', '${timestamp}')`, (err, result) => {
            if (err) {
                throw err;
            }
        });
    }

    setTier(email, tier, callback){
        this.db.query(`UPDATE users SET tier = '${tier}' WHERE email = '${email}'`, (err, result) => {
            if (err) {
                throw err;
            }
            callback(result);
        });
    }


}


module.exports = {
    Database
}

