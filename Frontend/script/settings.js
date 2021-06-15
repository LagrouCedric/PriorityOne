const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
let oldpin = ``

const listenToSocket = function () {

  socket.on("connected", function () {
    console.log("verbonden met socket webserver");
  });

  socket.on("B2FPincode",function(json){
    console.log(json)
      oldpin = json.pincode.pincode
      console.log(oldpin)
  })
}


const listenToShutdownButton = function(){
    let button = document.querySelector(".js-shutdown-btn");
    console.log('btnlistener toegevoegd')   
    
    button.addEventListener("click", function() {
        // console.log("veranderen state alarm");
        // alarmstate = button.getAttribute('data')
        console.log("Shutdown device");
        socket.emit('F2BShutdown')
        
        

        }
        // socket.emit('F2BveranderAlarm', {'alarm':alarmstate})

        
    )
  }

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    // const username = loginForm.username.value;
    // if (username === "MCT" && pincode === "MCT") {
    
    const pincode = loginForm.oldpassword.value;
    if (pincode === oldpin) {

        newPin = loginForm.newpassword.value;
        socket.emit('F2BChangePin', {'pin': newPin})

        alert("succesfully changed Pincode");
        window.location.href = "index.html";
    } else {
        loginErrorMsg.style.opacity = 1;
    }
})

const init = function(){
    listenToSocket()
    console.log('init')
    socket.emit('F2BPincode')
    listenToShutdownButton()
}

document.addEventListener("DOMContentLoaded", function () {
  console.info("DOM geladen");
//   handleData(lanIP+`/test/sensoren`, toontemp)

  init()
//   console.log('test')
  
});
