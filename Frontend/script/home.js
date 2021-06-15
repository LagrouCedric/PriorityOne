const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

const listenToSocket = function () {

  socket.on("connected", function () {
    console.log("verbonden met socket webserver");
  });
  

socket.on('B2FSensoren', function (jsonObject) {
    // console.log('sensoren opvragen')
    // toonsens(jsonObject)
})
socket.on('B2Falarm', function(jsonObject){
//   console.log('alarmstate opvangen')
  toonAlarmState(jsonObject)
})
socket.on('B2Ftemp',function(json){
    // console.log('temp opvangen')
    toontemp(json)
})
socket.on('B2Fgas',function(json){
    // console.log('temp opvangen')
    toongas(json)
})
}
const toongas= function(json){
    // console.log('temp')
    // console.log(json)
    gasvalue = json.gas.NewValue
    if (gasvalue <= 300){
        gas = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
        <g id="done_black_24dp" transform="translate(0 47.7)">
          <path id="Path_130" data-name="Path 130" d="M0,0H100V62H0Z" transform="translate(0 -33.472)" fill="none"/>
          <path id="Path_131" data-name="Path 131" d="M33.182,84.7,10.845,53.361,3.4,63.809,33.182,105.6,97,16.048,89.555,5.6Z" transform="translate(-0.2 -53.3)" fill="#31f300"/>
        </g>
      </svg>
      `
    }
    else{
        gas = `<svg xmlns="http://www.w3.org/2000/svg" width="61.518" height="61.519" viewBox="0 0 61.518 61.519">
        <g id="Group_386" data-name="Group 386" transform="translate(-157.331 -550.088)">
          <rect id="Rectangle_284" data-name="Rectangle 284" width="81" height="6" transform="translate(161.574 550.088) rotate(45)" fill="#f01"/>
          <rect id="Rectangle_285" data-name="Rectangle 285" width="81" height="6" transform="translate(157.331 607.364) rotate(-45)" fill="#f01"/>
        </g>
      </svg>
      `
    }

    document.querySelector('.js-gas').innerHTML = gas
}
const toontemp= function(json){
    // console.log('temp')
    // console.log(json)
    temperatuur = json.temp.NewValue
    temp = `${temperatuur}°C`

    document.querySelector('.js-temp').innerHTML = temp
}
const toonAlarmState = function(json){
    // console.log(json)
  let html = `` 
  let text = ``
  if (json.alarm.NewValue == 2){html = `<img src="img/png/AlarmGaataf.png" alt="Alarm Triggered, goes off" />`
    text = `<h2>Alarm: </h2><p>Triggered and going off!</p>`
}

  if (json.alarm.NewValue == 1){html = `<img src="img/png/AlarmAan.png" alt="Alarm Secured logo" />`
  text = `<h2>Alarm: </h2><p>Active and Secure</p>`

}
if (json.alarm.NewValue == 0){html = `<img src="img/png/alarmuit.png" alt="Alarm inactive" />`
  text = `<h2>Alarm: </h2><p>Alarm inactive</p>`

}
    document.querySelector('.js-alarmtext').innerHTML = text
  document.querySelector('.js-alarmsymbol').innerHTML = html

  
  // html = `<img src="img/svg/security_black_24dp.png" alt="Alarm Secured logo" />`

}
const init = function(){
    listenToSocket()
    console.log('init')
    
    socket.emit('F2BSensoren')
   
//   Request URL: http://192.168.168.168:5000/api/v1/test/sensoren
    
//   handleData(`http://192.168.168.168:5000/api/v1/test/sensoren`, toontemp)

//   handleData(lanIP+`/test/sensoren`, toontemp)
}

document.addEventListener("DOMContentLoaded", function () {
  console.info("DOM geladen");
//   handleData(lanIP+`/test/sensoren`, toontemp)

  init()
//   console.log('test')
  
});
















