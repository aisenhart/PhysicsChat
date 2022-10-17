function sendJSON() {
    var data = {
        prompt:document.getElementById("text-box").value
    };
    var json = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(json);
    
    xhr.onload = function() {
        console.log(xhr.response);
        document.getElementById("read-only").innerHTML = xhr.response;
    }
}

function clearText() {
    document.getElementById("text-box").value = "";
    document.getElementById("read-only").innerHTML = "";
}