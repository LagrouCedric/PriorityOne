
  const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

const listenToAlarmBtn = function(){
    let button = document.querySelector(".js-alarm-btn");
    console.log('btnlistener toegevoegd')   
    
    button.addEventListener("click", function() {
        // console.log("veranderen state alarm");
        // alarmstate = button.getAttribute('data')
        console.log("testen alarm");
        alarmstate = button.getAttribute('data')
        socket.emit('F2BveranderAlarm', {'alarm':alarmstate})
        

        }
        // socket.emit('F2BveranderAlarm', {'alarm':alarmstate})

        
    )
  }
  const listenToAlarmtest = function(){
    let button = document.querySelector(".js-alarmtest");
    console.log('btnlistener toegevoegd')   
    
    button.addEventListener("click", function() {
      alarmstate = button.getAttribute('data')
        
        if (alarmstate == 0){
          console.log('test aan')
          socket.emit('F2BTestAan')
        }
        else{
          console.log('test bezig');

        
    }})
  }
  
const toonAlarm = function(json){
  // console.log(json)
let html = `` 
let text = ``
let testbutton = ``
let header = document.querySelector('.js-header')
let widthState
if (window.screen.width < 992){
  widthState = true
  console.log('widt < 992')
}
else{
  widthState = false
}
if (json.alarm.NewValue == 2){html = `<img src="img/png/AlarmGaataf.png" alt="Alarm Triggered, goes off" />`
  text = `<h2>Alarm: </h2><p>Triggered and going off!</p>`
  button= `<button data="2" type="button" class="js-alarm-btn">Alarm aan/uit</button>`
  testbutton = `<div class="js-alarmtest c-cirkel" data="1" style="margin-top: 2em" >Test Alarm</div>`
  if (widthState == true){
    header.classList.remove('c-header-green')
    header.classList.remove('c-header-grey')
    header.classList.add('c-header-red')
  }
  else{
    header.classList.remove('c-header-green')
    header.classList.remove('c-header-grey')
    header.classList.remove('c-header-red')


  }
}
if (json.alarm.NewValue == 3){html = `<img src="img/png/AlarmGaataf.png" alt="Alarm Testing" />`
  text = `<h2>Alarm: </h2><p>Alarm Testing</p>`
  button= `<button data="2" type="button" class="js-alarm-btn">Alarm aan/uit</button>`
  testbutton = `<div class="js-alarmtest c-cirkel" data="1" style="margin-top: 2em" >Test Alarm</div>`
  if (widthState == true){
    header.classList.remove('c-header-green')
    header.classList.remove('c-header-grey')
    header.classList.add('c-header-red')
  }
  else{
    header.classList.remove('c-header-green')
    header.classList.remove('c-header-grey')
    header.classList.remove('c-header-red')


  }
}

if (json.alarm.NewValue == 1){html = `<img src="img/png/AlarmAan.png" alt="Alarm Secured logo" />`
text = `<h2>Alarm: </h2><p>Active and Secure</p>`
button= `<button data="1" type="button" class="js-alarm-btn">Alarm aan/uit</button>`
testbutton = `<div class="js-alarmtest c-cirkel" data="0" style="margin-top: 2em" >Test Alarm</div>`

if (widthState == true){
  header.classList.add('c-header-green')
  header.classList.remove('c-header-grey')
  header.classList.remove('c-header-red')
}
else{
  header.classList.remove('c-header-green')
  header.classList.remove('c-header-grey')
  header.classList.remove('c-header-red')


}

}
if (json.alarm.NewValue == 0){html = `<img src="img/png/alarmuit.png" alt="Alarm inactive" />`
text = `<h2>Alarm: </h2><p>Alarm inactive</p>`
button= `<button data="0" type="button" class="js-alarm-btn">Alarm aan/uit</button>`
testbutton = `<div class="js-alarmtest c-cirkel" data="0" style="margin-top: 2em" >Test Alarm</div>`

if (widthState == true){
  header.classList.remove('c-header-green')
  header.classList.add('c-header-grey')
  header.classList.remove('c-header-red')
}
else{
  header.classList.remove('c-header-green')
  header.classList.remove('c-header-grey')
  header.classList.remove('c-header-red')


}

}
  document.querySelector('.js-alarmtext').innerHTML = text
document.querySelector('.js-alarmsymbol').innerHTML = html
document.querySelector('.js-btn').innerHTML = button
document.querySelector('.js-test').innerHTML = testbutton
listenToAlarmBtn()
listenToAlarmtest()




}

const toonAlarmState = function(json){
  console.log('')
//     console.log(json)
//     let html = `` 
//     let button = `` 
//     if (json.alarm.NewValue == 2){
//       button = `<button data="2" type="button" class="js-alarm-btn">Alarm aan/uit</button>`
// }

// if (json.alarm.NewValue == 1){
//   button = `<button data="1" type="button" class="js-alarm-btn">Alarm aan/uit</button>`

// }
// if (json.alarm.NewValue == 0){
//   button = `<button data="0" type="button" class="js-alarm-btn">Alarm aan/uit</button>`

}
    // if (json.alarm.NewValue == 2){html = `Aan`
    // button = `<button data="1" type="button" class="js-alarm-btn">Alarm aan/uit</button>`}
    // if (json.alarm.NewValue == 1){html = `Aan`
    // button = `<button data="1" type="button" class="js-alarm-btn">Alarm aan/uit</button>`}
    // else{html = `uit`
    // button = `<button data="0" type="button" class="js-alarm-btn">Alarm aan/uit</button>`}
    // // document.querySelector('.js-alarm').innerHTML = html
    
    
  
const listenToSocket = function () {

    socket.on("connected", function () {
      console.log("verbonden met socket webserver");
    });
    
  
  // socket.on('B2Falarmhistoriek', function (jsonObject) {
  //     // console.log('sensoren opvragen')
  socket.on('B2FTrigger', function(jsonObject){
    toonTriggerInfo(jsonObject)
  })
  // })
  socket.on('B2Falarm', function(jsonObject){
    console.log('alarmstate opvangen')
    toonAlarm(jsonObject)
    toonAlarmState(jsonObject)
  })
}

const toonTriggerInfo = function(json){
  // console.log(json)
  let html = ``
  info = json.trigger
  // if (info = ""){
  //   info = "None"
  // }
  console.log('triggerinfo')
  console.log(info)
  html += `<h2>More information:</h2>
  <p>${info}</p>`

  document.querySelector('.js-info').innerHTML = html
}

const init = function(){
    console.log('init')

    listenToSocket()
    listenToAlarmBtn()
    socket.emit('F2BSensoren')
    toonAlarm()

}

document.addEventListener("DOMContentLoaded", function () {
    console.info("DOM geladen");
  //   handleData(lanIP+`/test/sensoren`, toontemp)
  
    init()
  //   console.log('test')
    
  });
  