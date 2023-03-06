$(function () {
  $(".btn").click(function () {
    $(".table-container").toggleClass("table-container-left");
    $(".form-one-time").toggleClass("form-one-time-left");
    $(".one-time-inactive").toggleClass("one-time-active");
    $(".subscriptions-active").toggleClass("subscriptions-inactive");
    $(".contact").toggleClass("contact-left");
    $(this).removeClass("idle").addClass("active");
  });
});

