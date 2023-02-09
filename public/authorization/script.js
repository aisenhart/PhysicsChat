$(function() {
	$(".btn").click(function() {
		$(".form-signin").toggleClass("form-signin-left");
    $(".form-signup").toggleClass("form-signup-left");
    $(".frame").toggleClass("frame-long");
    $(".signup-inactive").toggleClass("signup-active");
    $(".signin-active").toggleClass("signin-inactive");
    $(".forgot").toggleClass("forgot-left");   
    $(".premium-status-container").toggleClass("premium-status-container-left");
    $(".cover-photo").toggleClass("cover-photo-left");
    $(this).removeClass("idle").addClass("active");
	});
});

$(function () {
  $(".btn-signup").click(function () {
    $(".nav").toggleClass("nav-up");
    $(".form-signup-left").toggleClass("form-signup-down");
    $(".success").toggleClass("success-left");
    $(".frame").toggleClass("frame-short");
    let email = document.getElementsByName("email")[1].value;
    let password = document.getElementsByName("password")[1].value;
    let confirmPassword = document.getElementsByName("confirmpassword")[0].value;
    let fullName = document.getElementsByName("fullname")[0].value;
    console.log(email);
    console.log(password);

    $.ajax({
      url: "/register",
      type: "POST",
      data: {
        email: email,
        password: password,
        fullname: fullName,
        confirmpassword: confirmPassword,
      },
      //success function
      success: function (data) {
        console.log(data);
        if (data.success) {
          console.log("success");
        } else {
          console.log("error");
        }
      },

      //error function
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
      },
    });
  });
});




















$(function () {
  $("#continue").click(function () {
    window.location.href = "/";
  });
});
//i reused the go back button without renaming the classes because im lazy
$(function () {
  $(".btn-signin").click(function () {
    let email = document.getElementsByName("email")[0].value;
    let password = document.getElementsByName("password")[0].value;
    console.log(email);
    console.log(password);
    $.ajax({
      url: "/login",
      type: "POST",
      data: { email: email, password: password },
      success: function (data) {
        console.log(data.success);
        //show the success message
        $(".btn-animate").toggleClass("btn-animate-grow");
        $(".welcome").toggleClass("welcome-left");
        $(".cover-photo").toggleClass("cover-photo-down");
        $(".frame").toggleClass("frame-short");
        $(".profile-photo").toggleClass("profile-photo-down");
        $(".btn-go").toggleClass("btn-go-up");
        $(".forgot").toggleClass("forgot-fade");
        $(".forgot").toggleClass("forgot-left");   
        $(".incorrect-container-show").toggleClass(
          "incorrect-container-hidden"
        );
        $(".incorrect-container-hidden").removeClass(
          "incorrect-container-show"
        );
        console.log("success");
      },

      error: function (data) {
        //show the Incorrect Password message
        $(".incorrect-container-hidden").toggleClass(
          "incorrect-container-show"
        );
        $(".incorrect-container-show").removeClass(
          "incorrect-container-hidden"
        );
        //Make the button shake
        $(".btn-animate").addClass("btn-animate-shake");
      },
    });
  });
});
