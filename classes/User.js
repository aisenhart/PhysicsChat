/* 
author : Zayd Alzein
12/2/2022
https://github.com/Zaydo123
*/

class User{
    //instance variables that will be stored in user class
    //all private
    #ip; 
    #firstName; 
    #lastName;
    #email; 
    #password; 
    #UID;
    #warnings;
    #completionsCount;
    #usedTokens;
    #tier;
    #Orders;
    #accountCreatedAt;
    #adsWatched;
    #adsClicked;
    #banned;
    #balance;

    makeid(length) {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    //base information needed to create an account
    constructor(ip,email,password,firstName,lastName,tier){
        this.UID = ""
        this.#ip = ip;
        this.#email = email;
        this.#password = password;
        this.#firstName = firstName;
        this.#lastName = lastName;
        this.#tier = tier;
        this.#balance=0;
    }

    
    //get methods
    getIp(){
        return this.#ip;
    }
    getFirstName(){
        return this.#firstName;
    }
    getLastName(){
        return this.#lastName;
    }
    getEmail(){
        return this.#email;
    }
    getPassword(){
        return this.#password;
    }
    getTier(){
        return this.#tier;
    }
    getUID(){
        return this.#UID;
    }
    getWarnings(){
        return this.#warnings;
    }
    getCompletionsCount(){
        return this.#completionsCount;
    }
    getUsedTokens(){
        return this.#usedTokens;
    }
    getOrders(){
        return this.#Orders;
    }
    getAccountCreatedAt(){
        return this.#accountCreatedAt;
    }
    getAdsWatched(){
        return this.#adsWatched;
    }
    getAdsClicked(){
        return this.#adsClicked;
    }
    getBanned(){
        return this.#banned;
    }
    getBalance(){
        return this.#balance;
    }
    //set methods
    setIp(ip){
        this.#ip = ip;
    }
    setFirstName(firstName){
        this.#firstName = firstName;
    }
    setLastName(lastName){
        this.#lastName = lastName;
    }
    setEmail(email){
        this.#email = email;
    }
    setPassword(password){
        this.#password = password;
    }
    setTier(tier){
        this.#tier = tier;
    }
    setUID(UID){
        this.#UID = UID;
    }
    setWarnings(warnings){
        this.#warnings = warnings;
    }
    setCompletionsCount(completionsCount){
        this.#completionsCount = completionsCount;
    }
    setUsedTokens(usedTokens){
        this.#usedTokens = usedTokens;
    }
    setOrders(Orders){
        this.#Orders = Orders;
    }
    setAccountCreatedAt(accountCreatedAt){
        this.#accountCreatedAt = accountCreatedAt;
    }
    setAdsWatched(adsWatched){
        this.#adsWatched = adsWatched;
    }
    setAdsClicked(adsClicked){
        this.#adsClicked = adsClicked;
    }
    setBanned(banned){
        this.#banned = banned;
    }
    getAll(){
        return ({ip:this.#ip,email:this.#email,password:this.#password,firstName:this.#firstName,lastName:this.#lastName,tier:this.#tier,UID:this.#UID,warnings:this.#warnings,completionsCount:this.#completionsCount,usedTokens:this.#usedTokens,Orders:this.#Orders,accountCreatedAt:this.#accountCreatedAt,adsWatched:this.#adsWatched,adsClicked:this.#adsClicked,banned:this.#banned});
    }
    setBalance(balance){
        this.#balance = balance;
    }

}

module.exports = {
    User
};


