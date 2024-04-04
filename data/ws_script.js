let gateway = `ws://${window.location.hostname}/ws`;
let websocket;
let direction;
let getLoader = document.querySelector("#loader");
let getSlider = document.querySelector("input");
let getDot = document.querySelector("#dot");
let getKnob = document.querySelector(".knob_number");
let wsStatus = 0;

window.addEventListener('load', onload);


function onload(event) {
  initWebSocket();
}

function initWebSocket() {
  console.log('Trying to open a WebSocket connection…');
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}

function onOpen(event) {
  console.log('Connection opened');
  wsStatus = 1;
}

function onClose(event) {
  console.log('Connection closed');
  wsStatus = 0;
  setTimeout(initWebSocket, 2000);
}

function submitForm(steps, direction){

  if (wsStatus == 1){
    websocket.send(steps+"&"+direction)
    getSlider.setAttribute("disabled", "");
    getDot.setAttribute("style", "fill:white");
    getKnob.setAttribute("style","fill: #eaa14e")

    if (direction=="CW"){
      getLoader.classList.add("loaderCW");
      
    }else if (direction=="CCW"){
      getLoader.classList.add("loaderCCW");
    }
    else{
      console.log("NO DIRECTION");
    }
  }
}


function onMessage(event) {
  console.log(event.data);
  direction = event.data;
  if (direction=="stop"){ 
    getLoader.classList.remove("loadercw", "loaderccw");
    getSlider.removeAttribute("disabled", "");
    getDot.removeAttribute("style", "fill:white");
    getKnob.removeAttribute("style","fill: #eaa14e")
  }
  else if(direction=="CW" || direction=="CCW"){
      if (direction=="CW"){
        getLoader.classList.add("loadercw");
      }
      else{
        getLoader.classList.add("loaderccw");
      }
  }
}

