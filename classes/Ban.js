/* 
author : Zayd Alzein
12/2/2022
https://github.com/Zaydo123
*/

class Ban{
    //instance variables that will be stored in ban class
    //all private
    #UID;
    #bannedAt;
    #bannedBy;
    #reason;
    #bannedUntil;
    #banned;
    #bannedIP;

    //base information needed to create a ban
    constructor(UID,bannedAt,bannedBy,reason,bannedUntil,banned,bannedIP){
        this.#UID = UID;
        this.#bannedAt = bannedAt;
        this.#bannedBy = bannedBy;
        this.#reason = reason;
        this.#bannedUntil = bannedUntil;
        this.#banned = banned;
        this.#bannedIP = bannedIP;
    }
    //get methods
    getUID(){
        return this.#UID;
    }
    getBannedAt(){
        return this.#bannedAt;
    }
    getBannedBy(){
        return this.#bannedBy;
    }
    getReason(){
        return this.#reason;
    }
    getBannedUntil(){
        return this.#bannedUntil;
    }
    getBanned(){
        return this.#banned;
    }
    getBannedIP(){
        return this.#bannedIP;
    }
    //set methods
    setUID(UID){
        this.#UID = UID;
    }
    setBannedAt(bannedAt){
        this.#bannedAt = bannedAt;
    }
    setBannedBy(bannedBy){
        this.#bannedBy = bannedBy;
    }
    setReason(reason){
        this.#reason = reason;
    }
    setBannedUntil(bannedUntil){
        this.#bannedUntil = bannedUntil;
    }
    setBanned(banned){
        this.#banned = banned;
    }
    setBannedIP(bannedIP){
        this.#bannedIP = bannedIP;
    }
    toJson(){
        return {
            UID: this.#UID,
            bannedAt: this.#bannedAt,
            bannedBy: this.#bannedBy,
            reason: this.#reason,
            bannedUntil: this.#bannedUntil,
            banned: this.#banned,
            bannedIP: this.#bannedIP
        }
    }
    
}

module.exports = {
    Ban
};