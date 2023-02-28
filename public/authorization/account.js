//load the getuserinfo function when the page loads

    getUserInfo();
    console.log("function loaded");
    var email = jwt.decode(req.cookies.Authorization).email;
function getUserInfo() {
    $.ajax({
        url: '/get-user-info',
        type: 'GET',
        data: { email: email},
        success: function (data) {
            let firstName = data.firstName;
            let lastName = data.lastName;
            let email = data.email;
            let tier = data.tier;
            let balance = data.balance;
            let completions = data.completionsCount;
            let usedTokens = data.usedTokens;

            console.log("test:")
            console.log(firstName + ' ' + lastName + ' ' + email + ' ' + tier + ' ' + balance + ' ' + completions + ' ' + usedTokens);
            // Assign data to HTML elements
            $('#full-name').val(firstName + ' ' + lastName);
            $('#email-address').val(email);
            if (tier == 'free') { $('#tier').val('Free'); $('#free-information-item').toggleClass('active');} 
            else if (tier == 'basic') {$('#tier').val('Basic'); $('#basic-information-item').toggleClass('active');}
            else if (tier == 'pro') {$('#tier').val('Pro'); $('#pro-information-item').toggleClass('active');}
            //add commas to balance
            $('#user-balance').val(balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Tokens');
            $('#beta-usage').val(completions + ' Completions');
            $('#tokens-spent').val(usedTokens.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "," ) + ' Tokens');











        },
        error: function (data) {
            console.log("error");
            // error handling code 
        }
    });
};
