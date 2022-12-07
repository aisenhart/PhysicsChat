$(function() {
	$(".btn").click(function() {
		$(".form-signin").toggleClass("form-signin-left");
    $(".form-signup").toggleClass("form-signup-left");
    $(".frame").toggleClass("frame-long");
    $(".signup-inactive").toggleClass("signup-active");
    $(".signin-active").toggleClass("signin-inactive");
    $(".forgot").toggleClass("forgot-left");   
    $(this).removeClass("idle").addClass("active");
	});
});

$(function() {
	$(".btn-signup").click(function() {
  $(".nav").toggleClass("nav-up");
  $(".form-signup-left").toggleClass("form-signup-down");
  $(".success").toggleClass("success-left"); 
  $(".frame").toggleClass("frame-short");
  let email = document.getElementsByName("email")[1].value;
  let password = document.getElementsByName("password")[1].value;
  let confirmPassword= document.getElementsByName("confirmpassword")[0].value;
  let fullName = document.getElementsByName("fullname")[0].value;

  console.log(email);
  console.log(password);
  $.ajax({
    url: "/register",
    type: "POST",
    data: {email: email, password: password,fullname: fullName,confirmpassword: confirmPassword},
    success: function(data){
      console.log(data);
      if(data.success){
        console.log("success");
      } else{
        console.log("error");
      }
    }
	});
	});
});

$(function() {
  $("#continue").click(function(){
    window.location.href="/";
  });
});
//i reused the go back button without renaming the classes because im lazy
$(function() {
	$(".btn-signin").click(function() {
  $(".btn-animate").toggleClass("btn-animate-grow");
  $(".welcome").toggleClass("welcome-left");
  $(".cover-photo").toggleClass("cover-photo-down");
  $(".frame").toggleClass("frame-short");
  $(".profile-photo").toggleClass("profile-photo-down");
  $(".btn-goback").toggleClass("btn-goback-up");
  $(".forgot").toggleClass("forgot-fade");
  
  let email = document.getElementsByName("email")[0].value;
  let password = document.getElementsByName("password")[0].value;
  console.log(email);
  console.log(password);
  $.ajax({
    url: "/login",
    type: "POST",
    data: {email: email, password: password},
    success: function(data){
      console.log(data);
      if(data.success){
        console.log("success");
      } else{
        console.log("error");
      }
    }
	});
	});
});