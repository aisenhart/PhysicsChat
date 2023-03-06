let email = "default";

function setUsernameText() {
$.ajax({
  url: '/get-user-info',
  type: 'GET',
  data: { email: email},
  success: function (data) {
      let firstName = data.firstName;
      console.log(firstName);
      $('#username-text').text(firstName);
  },
  error: function (data) {
      console.log("error");
      // error handling code 
  }
});
};
setUsernameText();

