document.getElementById("sign-out").addEventListener("click", function () {
  fetch('/sign-out', { method: 'POST', credentials: 'same-origin' })
    .then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      window.location.href = "/";
    })
});
//Uncaught SyntaxError: redeclaration of let email
//GEThttp://localhost:3000/get-user-info?email=default
//load the getuserinfo function when the page loads
let email = "default";
getUserInfo();
console.log("function loaded");
function getUserInfo() {
  $.ajax({
    url: '/get-user-info',
    type: 'GET',
    data: { email: email },
    success: function (data) {
      let firstName = data.firstName;
      let lastName = data.lastName;
      let email = data.email;
      let tier = data.tier;
      let balance = data.balance;
      let completions = data.completionsCount;
      let usedTokens = data.usedTokens;
      let verified = data.verified;
      let referralCode = data.referralCode;


      //Filling out the form with the user's information----------------------------------------------------------------------------
      console.log("test:")
      console.log(firstName + ' ' + lastName + ' ' + email + ' ' + tier + ' ' + balance + ' ' + completions + ' ' + usedTokens);
      // Assign data to HTML elements
      $('#full-name').val(firstName + ' ' + lastName);
      $('#email-address').val(email);
      if (tier == 'free') { $('#tier').val('Free'); $('#free-information-item').toggleClass('active'); }
      else if (tier == 'basic') { $('#tier').val('Basic'); $('#basic-information-item').toggleClass('active'); }
      else if (tier == 'premium') { $('#tier').val('Premium'); $('#premium-information-item').toggleClass('active'); }
      else if (tier == 'elite') { $('#tier').val('Elite'); $('#elite-information-item').toggleClass('active'); }
      else if (tier == 'admin') { $('#tier').val('Admin'); }
      //add commas to balance
      $('#user-balance').val(balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Tokens');
      $('#beta-usage').val(completions + ' Completions');
      $('#tokens-spent').val(usedTokens.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Tokens');
      $('#referral-code').val(referralCode);
      //----------------------------------------------------------------------------------------------------------------------------

      //Set Username Text-----------------------------------------------------------------------------------------------------------
      $('#username-text').text(firstName);
      // add icon to link
      $('#username-text').append('<span><i class="ti-angle-down"></i></span>');
      //----------------------------------------------------------------------------------------------------------------------------

      //Set Verify Button-----------------------------------------------------------------------------------------------------------
      if (verified == false) {
        $('#verify-button').removeClass("hidden");
        $('#email-address').css('border-color', 'red');
        $('#reset-btn').addClass('btn-disabled').parent('a').addClass('btn-disabled');
        $('#portal-btn').addClass('btn-disabled').parent('a').addClass('btn-disabled');
        



      }
      //----------------------------------------------------------------------------------------------------------------------------


    },
    error: function (data) {
      console.log("error");
      // error handling code 
      //if user is not logged in-----------------------------------------------------------------------------------------------------
      $('#sign-out').remove();
      $('#app').remove();
      $('#account').remove();
      $('#username-text').parent().removeClass('dropdown');
      $('#username-text').attr('href', '/account');
      $('#username-text').removeClass('dropdown-toggle');
      //-----------------------------------------------------------------------------------------------------------------------------
    }
  });
};

//when the user clicks the verify button, run this function
$('#verify-button').click(function () {
  const email = $('#email-address').val();


  $.ajax({
    url: '/verify-email',
    method: 'POST',
    data: { email: email },
    dataType: 'json',
    success: function(response) {
      // Handle success response
      setAlertText('success','Verification email sent to ' + email + '. Please check your email and click the link to verify your account.');
    },
    error: function(xhr, status, error) {
      // Handle error response
      setAlertText('error', 'There was an error sending the verification email.');

    }
  });
});


function copyReferralCode() {
  // Get the referral code input element
  var referralCodeInput = document.getElementById("referral-code");
  console.log("code: " + referralCodeInput);

  // Select the referral code text
  referralCodeInput.select();
  referralCodeInput.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Deselect the text
  referralCodeInput.setSelectionRange(0, 0);

  // Show a message to the user indicating the referral code has been copied
  setAlertText('referral','Referral code copied!');
}



function setAlertText(status, message) {
  const alertMessage = document.querySelector('.alert-message');
  if (status === 'success') {
    $('#alert-text').html(message);
    $('.alert-container').removeClass('hidden'); 
  } else if (status === 'error') {
    $('#alert-text').html(message);
    $('.alert-container').removeClass('hidden');
  } else if (status === 'warning') {
    $('#alert-text').html(message);
    $('.alert-container').removeClass('hidden');
  } else if (status === 'referral'){
    $('#alert-text').html(message);
    $('.alert-container').removeClass('hidden');
  }
  else {
    $('#alert-text').html('Invalid status.');
    $('.alert-container').removeClass('hidden');
  }
  setTimeout(function () {
    $('.alert-container').addClass('hidden');
  }, 5000);
}



/*


function setAlertText(status, email) {
  const alertMessage = document.querySelector('.alert-message');
  if (status === 'success') {
    $('#alert-text').html('Verification email sent to ' + email + '. Please check your email and click the link to verify your account.');
    $('.alert-container').removeClass('hidden'); 
  } else {
    $('#alert-text').html('There was an error sending the verification email.');
    $('.alert-container').removeClass('hidden');
  }
  setTimeout(function () {
    $('.alert-container').addClass('hidden');
  }, 5000);
}*/