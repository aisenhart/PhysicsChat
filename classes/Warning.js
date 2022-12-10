/* 
author : Zayd Alzein
12/2/2022
https://github.com/Zaydo123
*/
class Warning{
    #UID;
    #warningID;
    #warningDatetime;
    #warningBy;
    #warningReason;
    #warningUntil;
    #warning;
    #warningIP;
    constructor(UID,warningID,warningDatetime,warningBy,warningReason,warningUntil,warning,warningIP){
        this.#UID = UID;
        this.#warningID = warningID;
        this.#warningDatetime = warningDatetime;
        this.#warningBy = warningBy;
        this.#warningReason = warningReason;
        this.#warningUntil = warningUntil;
        this.#warning = warning;
        this.#warningIP = warningIP;
    }
    //get methods
    getUID(){
        return this.#UID;
    }
    getWarningID(){
        return this.#warningID;
    }
    getWarningDatetime(){
        return this.#warningDatetime;
    }
    getWarningBy(){
        return this.#warningBy;
    }
    getWarningReason(){
        return this.#warningReason;
    }
    getWarningUntil(){
        return this.#warningUntil;
    }
    getWarning(){
        return this.#warning;
    }
    getWarningIP(){
        return this.#warningIP;
    }
    //set methods
    setUID(UID){
        this.#UID = UID;
    }
    setWarningID(warningID){
        this.#warningID = warningID;
    }
    setWarningDatetime(warningDatetime){
        this.#warningDatetime = warningDatetime;
    }
    setWarningBy(warningBy){
        this.#warningBy = warningBy;
    }
    setWarningReason(warningReason){
        this.#warningReason = warningReason;
    }
    setWarningUntil(warningUntil){
        this.#warningUntil = warningUntil;
    }
    setWarning(warning){
        this.#warning = warning;
    }
    setWarningIP(warningIP){
        this.#warningIP = warningIP;
    }
    toJson(){
        return {
            UID: this.#UID,
            warningID: this.#warningID,
            warningDatetime: this.#warningDatetime,
            warningBy: this.#warningBy,
            warningReason: this.#warningReason,
            warningUntil: this.#warningUntil,
            warning: this.#warning,
            warningIP: this.#warningIP
        };
    }
}

module.exports = {
    Warning
};