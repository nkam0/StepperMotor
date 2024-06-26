let gateway = `ws://${window.location.hostname}/ws`;
let websocket;
let direction;
let getLoader = document.querySelector("#loader");
let getSlider = document.querySelector("input");
let getDot = document.querySelector("#dot");
let getKnobValue = document.querySelector(".knob_number");
let getHomeBtn = document.querySelector("#homeBtn");
let wsStatus = 0;
let stepperRatio = 1024/90;     // Move this many steps; 1024 = approx 1/4 turn

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
    steps = Math.round(steps * stepperRatio);

    websocket.send(steps+"&"+direction)
    
    getSlider.setAttribute("disabled", "");
    getDot.setAttribute("style", "fill:white");
    getKnobValue.setAttribute("style","fill: #eaa14e")
    getHomeBtn.setAttribute("disabled", "");

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
    getLoader.classList.remove("loaderCW", "loaderCCW");
    getSlider.removeAttribute("disabled", "");
    getDot.removeAttribute("style", "fill:white");
    getKnobValue.removeAttribute("style","fill: #eaa14e")
    getHomeBtn.removeAttribute("disabled", "");
  }
  else if(direction=="CW" || direction=="CCW"){
      if (direction=="CW"){
        getLoader.classList.add("loadercw");
      }
      else{
        getLoader.classList.add("loaderccw");
      }
  }else if (direction =="homing"){
    getLoader.classList.add("loadercw");
    getSlider.setAttribute("disabled", "");
    getHomeBtn.setAttribute("disabled", "");
    getDot.setAttribute("style", "fill:white");
    getKnobValue.setAttribute("style","fill: #eaa14e")
  }
}

