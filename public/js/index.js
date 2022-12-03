function hideLoading() {
    let x = document.getElementsByClassName("lds-ellipsis")[0];
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
}

function hideSubmissions() {
    for(let i=0;i<document.getElementsByClassName("submission").length;i++){
        let x = document.getElementsByClassName("submission")[i];
        if (x.style.display === "none") {
          x.style.display = "flex";
        } else {
          x.style.display = "none";
        }
    }
}
hideSubmissions();

hideLoading()
  
function sendJSON() {
    let data = {
        prompt:document.getElementById("text-box").value
    };
    let json = JSON.stringify(data);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(json);

    hideLoading();
    xhr.onload = function() {
        console.log(xhr.response);
        document.getElementById("read-only").innerHTML = xhr.response;
    }
    hideLoading();
}

function clearText() {
    document.getElementById("text-box").value = "";
    document.getElementById("read-only").innerHTML = "";
}