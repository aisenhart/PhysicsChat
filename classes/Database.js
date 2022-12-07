const mysql = require('mysql');
require('dotenv').config();

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
    newUser(user, callback) {
        this.db.query(`INSERT INTO users (ip, email, password, firstName, lastName, tier, balance, UID, warnings, completionsCount, usedTokens, orders, accountCreatedAt, adsWatched, adsClicked, banned) VALUES ('${user.getIp()}','${user.getEmail()}','${user.getPassword()}','${user.getFirstName()}','${user.getLastName()}','${user.getTier()}','${user.getBalance()}','${user.getUID()}','${user.getWarnings()}','${user.getCompletionsCount()}','${user.getUsedTokens()}','${user.getOrders()}','${user.getAccountCreatedAt()}','${user.getAdsWatched()}','${user.getAdsClicked()}','${user.getBanned()}')`, (err, result) => {
            if (err) {
                throw err;
            }
            console.log("New user created");
            callback(result);
        });
    }
    end() {
        this.db.end();
        console.log("STOPPED DATABASE");
    }
    isTokenValid(token, callback) {
        this.db.query(`SELECT * FROM users WHERE token = '${token}'`, (err, result) => {
            if (err) {
                throw err;
            }
            if(result.length > 0){
                callback(true);
            }
        });
    }
    deleteUser(email, callback) {
        this.db.query(`DELETE FROM users WHERE email = '${email}'`, (err, result) => {
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
