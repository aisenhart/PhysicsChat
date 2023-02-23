$(function () {
  $(".btn").click(function () {
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
    let email = document.getElementsByName("email")[1].value;
    let password = document.getElementsByName("password")[1].value;
    let confirmPassword =
      document.getElementsByName("confirmpassword")[0].value;
    let fullName = document.getElementsByName("fullname")[0].value;
    console.log(email);
    console.log(password);

    if (password != confirmPassword) {
      $(".signup-incorrect-hidden").toggleClass("signup-incorrect-show");
      $(".signup-incorrect-show").removeClass("signup-incorrect-hidden");
      $(".incorrect-text").text("Passwords do not match");
    } else {
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
          $(".nav").toggleClass("nav-up");
          $(".form-signup-left").toggleClass("form-signup-down");
          $(".success").toggleClass("success-left");
          $(".frame").toggleClass("frame-short");
          console.log(data);
        },

        //error function
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("error-");
          //Set text of error message:
          $(".signup-incorrect-hidden").toggleClass("signup-incorrect-show");
          $(".signup-incorrect-show").removeClass("signup-incorrect-hidden");
          $(".incorrect-text").text(jqXHR.responseJSON.error);
          console.log(jqXHR.responseJSON.error);
          //Make the button shake
          $(".btn-signup").addClass("btn-animate-shake");
        },
      });
    }
  });
});

/*$(function () {
  $("#continue").click(function () {
    window.location.href = "/beta.html";
  });

}); */



$(function () {
  $(".btn-signin").click(function () {
    let email = document.getElementsByName("email")[0].value;
    let password = document.getElementsByName("password")[0].value;
    console.log(email);
    console.log(password);

    $.ajax({
      url: '/get-user-info',
      type: 'POST',
      data: { email: email },
      success: function (data) {
        let name = data.firstName;
        $('.welcome').text('Welcome, ' + name);
        console.log("name: " + name);
        // rest of the success function code
      },
      error: function (data) {
        // error handling code
      }
    });

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
        $(".signin-incorrect-show").toggleClass("signin-incorrect-hidden");
        $(".signin-incorrect-hidden").removeClass("signin-incorrect-show");
        //How do I set the text of the h1 element with the class of welcome to "Welcome, +" the name? How do I get the data of the users name from the databse?





















        console.log("success");
      },

      error: function (data) {
        //show the Incorrect Password message
        $(".signin-incorrect-hidden").toggleClass("signin-incorrect-show");
        $(".signin-incorrect-show").removeClass("signin-incorrect-hidden");
        //Make the button shake
        $(".btn-animate").addClass("btn-animate-shake");
      },
    });
  });
});
