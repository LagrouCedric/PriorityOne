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
socket.on('B2FDevice', function(jsonObject){
    console.log('device')
    console.log(jsonObject)
    toonDevice(jsonObject)


})
socket.on('B2Falarm', function(jsonObject){
//   console.log('alarmstate opvangen')
//   toonAlarmState(jsonObject)
})
socket.on('B2FDeviceInfo', function(jsonObject){
    toonInfo(jsonObject)
})
//   socket.on("B2F_status_lampen", function (jsonObject) {
//     console.log("alle lampen zijn automatisch uitgezet");
//     console.log("Dit is de status van de lampen");
//     console.log(jsonObject);
//     for (const lamp of jsonObject.lampen) {
//       const room = document.querySelector(`.js-room[data-idlamp="${lamp.id}"]`);
//       if (room) {
//         const knop = room.querySelector(".js-power-btn");
//         knop.dataset.statuslamp = lamp.status;
//         clearClassList(room);
//         if (lamp.status == 1) {
//           room.classList.add("c-room--on");
//         }
//       }
//     }
//   });

//   socket.on("B2F_verandering_lamp", function (jsonObject) {
//     console.log("Er is een status van een lamp veranderd");
//     console.log(jsonObject.lamp.id);
//     console.log(jsonObject.lamp.status);

//     const room = document.querySelector(`.js-room[data-idlamp="${jsonObject.lamp.id}"]`);
//     if (room) {
//       const knop = room.querySelector(".js-power-btn"); //spreek de room, als start. Zodat je enkel knop krijgt die in de room staat
//       knop.dataset.statuslamp = jsonObject.lamp.status;

//       clearClassList(room);
//       if (jsonObject.lamp.status == 1) {
//         room.classList.add("c-room--on");
//       }
//     }
//   });
//   socket.on("B2F_verandering_lamp_from_HRDWR", function (jsonObject) {
//     console.log(jsonObject)
//   } 
//   )
};

const toonInfo = function(json){
    let html = `<tr class="c-row is-header">

    <th class="c-cell">value</th>
    <th class="c-cell">tijdstip</th>
    <th class="c-cell">Date</th>
    <th class="c-cell">Description</th>
    </tr>`

    for (const sensor of json.info) {
        html += `
        <tr class="c-row">
 
            <td class="c-cell" style="max-width:20%;">${sensor.NewValue}</td>   
            <td class="c-cell" style="max-width:20%;">${sensor.Tijdstip}</td>   
            <td class="c-cell" style="max-width:20%;">${sensor.Dag}</td>   

            <td class="c-cell" style="max-width:20%;">${sensor.Beschrijving}</td>    
        </tr>`;
    }
  // html = `<tr class='c-row is-header'>
  // <td class='c-cell'>sensor</td>
  // <td class='c-cell'>Value</td>
  // <td class='c-cell'>Tijdstip</td>
  // <td class='c-cell>Beschrijving</td>
  // </tr>`
  // for (sensor of json.sensoren){
  //     html += `<tr class='c-row>
  //     <td class='c-cell'>${sensor.DeviceHistoriekID}</td>
  //     <td class='c-cell'>${sensor.NewValue}</td>
  //     <td class='c-cell'>${sensor.Tijdstip}</td>
  //     <td class='c-cell'>${sensor.Beschrijving}</td>
  //     </tr>`
  // }

  
            // <tr><td>#sensor</td><td>#waarde</td></tr>
  
  document.querySelector('.js-temp').innerHTML = html
}

const getInfoDevice = function(id){
    console.log('id is')
    console.log(id)
    socket.emit('F2Bshowdevice', {'id':id})

}

const addSelectBtn = function(){
    
    // const selectElement = document.querySelector('.js-select');
    // console.log(selectElement)
    // selectElement.addEventListener('change', (event) => {
        //     console.log('click')
        
    // });
    
    // buttons.addEventListener('change', function(){
        //     console.log('click btn')
        // })
        
        
    // console.log('btns')
    // const buttons = document.querySelectorAll('.js-select');
    // console.log(buttons)
    // for (let device of document.querySelectorAll(".js-select")) {
    //     console.log('btn added')
    //     console.log(device)
    //     device.addEventListener("click",function() {
    //         console.log('btn clicked')
            
    //         const id = this.getAttribute('data')
            
    //         getInfoDevice(id)
    //     });
	// }
    // console.log('btns klaar')

    let filterButton = document.querySelector('.js-button')
    filterButton.addEventListener('click',function(){
        filter = 1;
        let input = document.querySelector('.js-device')
        let devices = document.querySelectorAll('.js-select')
        for (let device of devices){
            // console.log(device.value)
            // console.log(device.value)
            if(input.value == device.value){
                deviceId = device.getAttribute('data')
                console.log('id:')
                console.log(deviceId)
                getInfoDevice(deviceId)
                
            }
        }
    })

}

const toonDevice = function(json){
    // let html = `<option selected disabled>Choose an option</option>` 
    let html = ``
    
    for (device of json.device){
        html += `<div><option class="js-select" data="${device.DeviceID}">${device.Naam}</option></div>`
    }

    document.querySelector('.js-device').innerHTML = html
    addSelectBtn();

}

const init = function(){
    listenToSocket()


    console.log('init')
    socket.emit('F2BDevice')
    // AddDeviceListener()

    
    // socket.emit('F2BSensoren')
    // console.log('sens')
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

