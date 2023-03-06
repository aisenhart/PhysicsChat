
function displayError(error){
    console.log(error);
    window.alert("Error: " + error);
}

//when you click the clear button, clear the text area
document.getElementById("clear").addEventListener("click", function() {
document.getElementById("text-area").value = "";
});






// on submit click, post text-area contents to /ai 
document.getElementById("submit").addEventListener("click", function() {
var text = document.getElementById("text-area").value;
var xhr = new XMLHttpRequest();
xhr.open("POST", "/ai", true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({prompt: text}));
xhr.onload = function() {
  var response = JSON.parse(xhr.responseText);
  console.log(response)
  if(response.error){
    displayError(response.error);
  } else {
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



//function to set the token counter (id token-count) to the number of tokens the user has left
function setTokenCount(){
var xhr = new XMLHttpRequest();
xhr.open("GET", "/token-count", true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();
xhr.onload = function() {
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