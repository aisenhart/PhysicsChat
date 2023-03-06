let email = "default";

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
/*
<ul class="navbar-nav ml-auto">
					<li class="nav-item dropdown">
						<a id="username-text" class="nav-link dropdown-toggle" href="/login"">Sign in</a>
						<!-- Dropdown list -->
						<ul class=" dropdown-menu">
					<li><a id="app" class="dropdown-item " href="/beta">App</a></li>
					<li><a id="account" class="dropdown-item" href="/account">My Account</a></li>
					<li><a id="sign-out" class="dropdown-item" href="/sign-out">Sign Out</a></li>
					</li>
				</ul>


        <script src="js/getUserInfo.js"></script>
*/