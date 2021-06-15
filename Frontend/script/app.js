const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

const listenToSocket = function () {

  socket.on("connected", function () {
    console.log("verbonden met socket webserver");
  });
  

socket.on('B2FSensoren', function (jsonObject) {
    console.log('sensoren opvragen')
    toonsens(jsonObject)
})
socket.on('B2Falarm', function(jsonObject){
  console.log('alarmstate opvangen')
  toonAlarmState(jsonObject)
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

const handleData = function (url, callbackFunctionName, callbackErrorFunctionName = null, method = 'GET', body = null) {
    fetch(url, {
      method: method,
      body: body,
      headers: {
        'content-type': 'application/json',
      },
    })
      .then(function (response) {
        if (!response.ok) {
          console.warn(`>> Probleem bij de fetch(). Statuscode: ${response.status}`);
          if (callbackErrorFunctionName) {
            console.warn(`>> Callback errorfunctie ${callbackErrorFunctionName.name}(response) wordt opgeroepen`);
            callbackErrorFunctionName(response);
          } else {
            console.warn('>> Er is geen callback errorfunctie meegegeven als parameter');
          }
        } else {
          console.info('>> Er is een response teruggekomen van de server');
          return response.json();
        }
      })
      .then(function (jsonObject) {
        if (jsonObject) {
          console.info('>> JSONobject is aangemaakt');
          console.info(`>> Callbackfunctie ${callbackFunctionName.name}(response) wordt opgeroepen`);
          callbackFunctionName(jsonObject);
        }
      });
    /*.catch(function(error) {
        console.warn(`>>fout bij verwerken json: ${error}`);
        if (callbackErrorFunctionName) {
          callbackErrorFunctionName(undefined);
        }
      })*/
  };

const toonAlarmState = function(json){
  console.log(json)
  let html = `` 
  if (json.alarm.NewValue == 1){html = `Aan`}
  else{html = `uit`}
  document.querySelector('.js-alarm').innerHTML = html
}
const toonsens= function(json){
  console.log(json)
  let html = `<tr class="c-row is-header">
    <th class="c-cell">sensor</th>
    <th class="c-cell">value</th>
    <th class="c-cell">tijdstip</th>
    <th class="c-cell">beschrijving</th>
    </tr>`

    for (const sensor of json.sensoren) {
        html += `
        <tr class="c-row">
            <td class="c-cell">${sensor.DeviceHistoriekID}</td>
            <td class="c-cell">${sensor.NewValue}</td>   
            <td class="c-cell">${sensor.Tijdstip}</td>   
            <td class="c-cell">${sensor.Beschrijving}</td>    
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

const init = function(){
    listenToSocket()
    console.log('init')
    
    socket.emit('F2BSensoren')
    console.log('sens')
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

















const listenToUI = function () {
  const knoppen = document.querySelectorAll(".js-power-btn");
  for (const knop of knoppen) {
    knop.addEventListener("click", function () {
      const id = this.dataset.idlamp;
      let nieuweStatus;
      if (this.dataset.statuslamp == 0) {
        nieuweStatus = 1;
      } else {
        nieuweStatus = 0;
      }
      //const statusOmgekeerd = !status;
      clearClassList(document.querySelector(`.js-room[data-idlamp="${id}"]`));
      document.querySelector(`.js-room[data-idlamp="${id}"]`).classList.add("c-room--wait");
      socket.emit("F2B_switch_light", { lamp_id: id, new_status: nieuweStatus });
    });
  }
};
