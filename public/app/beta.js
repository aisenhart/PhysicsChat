
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
  document.getElementById("text-area").value = text + response.completion;
  console.log(response.completion);
  if(response.error){
      displayError(response.error);
  }
  const basicScroller = document.querySelector('.basic');
  basicScroller.classList.remove('spin');


}
});


//Loading scroller animation
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', startBasicScroller);
function startBasicScroller() {
  const basicScroller = document.querySelector('.basic');
  basicScroller.classList.add('spin');
}