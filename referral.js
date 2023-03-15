function trigger(db,email) {
    db.getUser(email, function(result) {
        console.log("Referral triggered for " + email);
        result = result[0];
        if(result.referredByCode) {
            console.log("Referral code found: " + result.referredByCode)
            db.getUserByReferral(result.referredByCode, function(referrer) {
                referrer = referrer[0];
                if(referrer) {
                    console.log(referrer)
                    console.log("Referrer found: " + referrer.email);
                   db.addReferral(referrer, email, function() {
                       console.log(email + " referred by " + referrer.email);
                   });
                }
            });
        }
    });
}

module.exports = {
    trigger: trigger
}
