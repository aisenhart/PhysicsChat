/* 
author : Zayd Alzein
12/2/2022
https://github.com/Zaydo123
*/

class Order{
    //instance variables that will be stored in order class
    //all private
    #UID;
    #orderID;
    #orderDatetime;
    #tokenAmount;
    #warning;
    #completed;

    constructor(UID,orderID,orderDatetime,tokenAmount,warning,completed){
        this.#UID = UID;
        this.#orderID = orderID;
        this.#orderDatetime = orderDatetime;
        this.#tokenAmount = tokenAmount;
        this.#warning = warning;
        this.#completed = completed;
    }
    //get methods
    getUID(){
        return this.#UID;
    }
    getOrderID(){
        return this.#orderID;
    }
    getOrderDatetime(){
        return this.#orderDatetime;
    }
    getTokenAmount(){
        return this.#tokenAmount;
    }
    getWarning(){
        return this.#warning;
    }
    getCompleted(){
        return this.#completed;
    }
    //set methods
    setUID(UID){
        this.#UID = UID;
    }
    setOrderID(orderID){
        this.#orderID = orderID;
    }
    setOrderDatetime(orderDatetime){
        this.#orderDatetime = orderDatetime;
    }
    setTokenAmount(tokenAmount){
        this.#tokenAmount = tokenAmount;
    }
    setWarning(warning){
        this.#warning = warning;
    }
    setCompleted(completed){
        this.#completed = completed;
    }
}
