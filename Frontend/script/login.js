const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
let pin = ``

const listenToSocket = function () {

  socket.on("connected", function () {
    console.log("verbonden met socket webserver");
  });

  socket.on("B2FPincode",function(json){
    console.log(json)
      pin = json.pincode.pincode
      console.log(pin)
  })
}

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    // const username = loginForm.username.value;
    // if (username === "MCT" && pincode === "MCT") {
    
    const pincode = loginForm.password.value;
    if (pincode === pin) {

        alert("You have successfully logged in.");
        window.location.href = "Home.html";
    } else {
        loginErrorMsg.style.opacity = 1;
    }
})

const init = function(){
    listenToSocket()
    console.log('init')
    socket.emit('F2BPincode')
    
}

document.addEventListener("DOMContentLoaded", function () {
  console.info("DOM geladen");
//   handleData(lanIP+`/test/sensoren`, toontemp)

  init()
//   console.log('test')
  
});
