let ball = document.getElementById("ball");
let circle = document.getElementById('circle');
let dragable = false;
let min = 0;
let max = 360;
let endPoint = 1024;     // Move this many steps; 1024 = approx 1/4 turn

let posX;
let posY;
let cx = 131;
let cy = 131;
let r = 140;
let initialAngle, initialValue, finalAngle, finalValue, prevValue;
let dragCounter;
let startSet = false;


let gateway = `ws://${window.location.hostname}/ws`;
let websocket;
window.addEventListener('load', onload);
let direction;

function onload(event) {
  // initWebSocket();
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
}

function onClose(event) {
  console.log('Connection closed');
  setTimeout(initWebSocket, 2000);
}

function submitForm(steps, direction){

  // if(websocket.send(steps+"&"+direction)){

    if (direction=="CW"){
      document.querySelector("#loader").classList.add("loadercw");
    }
    else{
      document.querySelector("#loader").classList.add("loaderccw");
    }
  // }else{
  //   console.log("ERROR SENDING TO WEBSOCKET")
  // }
}


function onMessage(event) {
  console.log(event.data);
  direction = event.data;
  if (direction=="stop"){ 
    document.querySelector("#loader").classList.remove("loadercw", "loaderccw");
  }
  else if(direction=="CW" || direction=="CCW"){
      // document.getElementById("motor-state").innerHTML = "motor spinning...";
      // document.getElementById("motor-state").style.color = "blue";
      if (direction=="CW"){
        document.querySelector("#loader").classList.add("loadercw");
      }
      else{
        document.querySelector("#loader").classList.add("loaderccw");
      }
  }
}

let getAngle = function (ex, ey, cx, cy) {
    
  let dy = ey-cy;
  let dx = ex-cx;
  // console.log('coordinates',dx, ", ", dy);
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  // console.log('theta',theta);
  let value = Math.round(theta * (max-min)/Math.PI/2 +min );

  if(theta < 0.0) 
  {
    value = value + max - min;
  }
  // console.log('value',value);
  
  return [theta, value];
};


function getCoords (cx, cy, r, a) {
  let x = cx + r * Math.cos(a);
  let y = cy + r * Math.sin(a);
  let coords = {x: x, y: y};
  return coords;
}

function mouseDown(e) {
  posX = e.clientX-circle.offsetLeft;
  posY = e.clientY-circle.offsetTop;
  [initialAngle, initialValue] = getAngle(posX, posY, cx, cy);
  console.log("START: " + initialValue)


  startSet = true;
  dragCounter = 0;
  dragable = true; 
}

function mouseMove(e) {

  if (dragable) 
  {
    posX = e.clientX-circle.offsetLeft;
    posY = e.clientY-circle.offsetTop;
;
    let [angle, value] = getAngle(posX, posY, cx, cy);
    let coords = getCoords(cx, cy, r, angle);
    // console.log(coords.x + ",  " + coords.y);

    document.getElementById('value').innerHTML = value;

    if (value > prevValue){
      dragCounter ++;
    } 
    else if (value < prevValue) {
      dragCounter--;
    }
    prevValue = value;

    ball.style.left = coords.x + 'px';
    ball.style.top = coords.y + 'px';
  
  }
  
}

function mouseUp(e) {
  dragable = false;
  posX = e.clientX-circle.offsetLeft;
  posY = e.clientY-circle.offsetTop;
  [finalAngle, finalValue] = getAngle(posX, posY, cx, cy);

  if (startSet==true){
    console.log("END: " + finalValue)

    let steps = Math.floor((finalValue/360)*(4*endPoint))

    if (dragCounter > 0){
      direction = "CW"  
    }
    else if(dragCounter < 0){
      direction = "CCW"
    }

    console.log(steps + ", " + direction);
    submitForm(steps, direction) 
  }
  
  startSet = false;
  
}

let getBallElement = document.getElementById("ball")
// document.addEventListener('DOMContentLoaded', function() {
//   getBallElement.addEventListener('mousedown', function(e) {
//     mouseDown(e);
//   });
// });
getBallElement.onmousedown = function(e) {mouseDown(e)};
window.onmouseup = function(e) {mouseUp(e)};
window.onmousemove = function(e) {mouseMove(e)};


