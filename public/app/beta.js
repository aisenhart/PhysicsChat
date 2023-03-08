
function displayError(error) {
  console.log(error);
  window.alert("Error: " + error);
}

//when you click the clear button, clear the text area
document.getElementById("clear").addEventListener("click", function () {
  document.getElementById("text-area").value = "";
});






// on submit click, post text-area contents to /ai 
document.getElementById("submit").addEventListener("click", function () {
  var text = document.getElementById("text-area").value;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/ai", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ prompt: text }));
  xhr.onload = function () {
    var response = JSON.parse(xhr.responseText);
    console.log(response)
    if (response.error) {
      if (response.error === "user has used up their tokens") {
        setAlertText('tokens');
      } else if (response.error === "user does not exist") {
        setAlertText("user does not exist");
      } else if (response.error === "user is banned") {
        setAlertText("user is banned");
      } else if (response.error === "user tier does not exist") {
        setAlertText("user tier does not exist");
      } else if (response.error === "user does not have enough tokens") {
        setAlertText("user does not have enough tokens");
      } else if (response.error === "prompt is not acceptable") {
        setAlertText('prompt is not acceptable');
      } else if (response.error === "error with OpenAI API"){
        setAlertText("OpenAIError");
      }
      else {
        displayError(response.error);
      }
    } 
    else {
      document.getElementById("text-area").value = text + response.completion;
      console.log(response.completion);
    }
    const basicScroller = document.querySelector('.basic');
    basicScroller.classList.remove('spin');
    setTokenCount();
  }

});


//Loading scroller animation
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', startBasicScroller);
function startBasicScroller() {
  const basicScroller = document.querySelector('.basic');
  basicScroller.classList.add('spin');
}


//sign out button

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



//function to set the token counter (id token-count) to the number of tokens the user has left
function setTokenCount() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/token-count", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  xhr.onload = function () {
    var response = JSON.parse(xhr.responseText);
    console.log(response)
    response.tokens = response.tokens.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("token-count").innerHTML = response.tokens;
  }
}
setTokenCount();
let email = "test";
function setUsernameText() {
  $.ajax({
    url: '/get-user-info',
    type: 'GET',
    data: { email: email },
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

function setAlertText(type) {
  const alertMessage = document.querySelector('.alert-message');

  if (type === 'tokens') {
    $('#alert-text').html('You are out of tokens, please <a style="color: #fff; text-decoration: underline" href="/shop">purchase more</a> to continue using the service');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'email') {
    $('#alert-text').text('Please verify your email address to continue');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'request') {
    $('#alert-text').text('Your request cannot be processed at the moment, please try again later');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'user does not exist') {
    $('#alert-text').text('User does not exist');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'user is banned') {
    $('#alert-text').html('You have been banned, if you believe this is a mistake please <a style="color: #fff; text-decoration: underline" href="/contact">contact us</a>');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'user tier does not exist') {
    $('#alert-text').text('User tier does not exist');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'user does not have enough tokens') {
    $('#alert-text').text('You do not have enough tokens');
    $('.alert-container').removeClass('hidden');
  } else if (type === 'prompt is not acceptable') {
    $('#alert-text').html('The prompt you submitted is not acceptable and in violation of our <a style="color: #fff; text-decoration: underline" href="/tos">terms of service</a>');
    $('.alert-container').removeClass('hidden');
    setTimeout(function () {
      $('.alert-container').addClass('hidden');
      setTimeout(function () {
        $('#alert-text').text('You have been given a warning, if you continue to violate the TOS you will be banned');
        $('.alert-container').removeClass('hidden');
        setTimeout(function () {
          $('.alert-container').addClass('hidden');
        }, 5000);
      }, 500);
    }, 5000);
  }
  else if (type === 'OpenAIError') {
    $('#alert-text').text('An error occurred with OpenAI API');
    $('.alert-container').removeClass('hidden');
  } else {
    $('#alert-text').text('An error occurred');
    $('.alert-container').removeClass('hidden');
  }
  setTimeout(function () {
    $('.alert-container').addClass('hidden');
  }, 5000);
}







