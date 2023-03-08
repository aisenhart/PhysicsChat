document.getElementById("sign-out").addEventListener("click", function() {
    fetch('/sign-out', { method: 'POST', credentials: 'same-origin' })
    .then(function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      window.location.href = "/";
    })
  });
  



//load the getuserinfo function when the page loads
getUserInfo();
console.log("function loaded");
var email = "test";
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
            else if (tier == 'premium') {$('#tier').val('Premium'); $('#premium-information-item').toggleClass('active');}
            else if (tier == 'elite') {$('#tier').val('Elite'); $('#elite-information-item').toggleClass('active');}
            else if (tier == 'admin') {$('#tier').val('Admin');}
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
function setUsernameText() {
  $.ajax({
    url: '/get-user-info',
    type: 'GET',
    data: { email: email},
    success: function (data) {
      let firstName = data.firstName;
      $('#username-text').text(firstName);
      // add icon to link
      $('#username-text').append('<span><i class="ti-angle-down"></i></span>');
    },
    error: function (data) {
      console.log("error");
      // error handling code 
      $('#sign-out').remove();
      $('#app').remove();
      $('#account').remove();
      $('#username-text').parent().removeClass('dropdown');
      $('#username-text').attr('href', '/account');
      $('#username-text').removeClass('dropdown-toggle');
    }
  });
};
setUsernameText();