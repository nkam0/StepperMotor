let ball = document.getElementById("ball");
let circle = document.getElementById('circle');
let dragable = false;
let min = 0;
let max = 360;

let posX;
let posY;
let cx = 131;
let cy = 131;
let r = 140;

let gateway = `ws://${window.location.hostname}/ws`;
let websocket;
window.addEventListener('load', onload);
let direction;

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
}

function onClose(event) {
  console.log('Connection closed');
  setTimeout(initWebSocket, 2000);
}

function submitForm(steps, direction){

  document.getElementById("motor-state").innerHTML = "motor spinning...";
  document.getElementById("motor-state").style.color = "blue";
  if (direction=="CW"){
      document.getElementById("gear").classList.add("spin");
  }
  else{
      document.getElementById("gear").classList.add("spin-back");
  }
  websocket.send(steps+"&"+direction);
}


function onMessage(event) {
  console.log(event.data);
  direction = event.data;
  if (direction=="stop"){ 
    document.getElementById("motor-state").innerHTML = "motor stopped"
    document.getElementById("motor-state").style.color = "red";
    document.getElementById("gear").classList.remove("spin", "spin-back");
  }
  else if(direction=="CW" || direction=="CCW"){
      document.getElementById("motor-state").innerHTML = "motor spinning...";
      document.getElementById("motor-state").style.color = "blue";
      if (direction=="CW"){
          document.getElementById("gear").classList.add("spin");
      }
      else{
          document.getElementById("gear").classList.add("spin-back");
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
  document.getElementById('value').innerHTML = value;
  return theta;
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
  let initialAngle = getAngle(posX, posY, cx, cy);

  dragable = true; 
}

function mouseMove(e) {

  if (dragable) 
  {
    posX = e.clientX-circle.offsetLeft;
    posY = e.clientY-circle.offsetTop;
;
    let angle = getAngle(posX, posY, cx, cy);
    let coords = getCoords(cx, cy, r, angle);

    ball.style.left = coords.x + 'px';
    ball.style.top = coords.y + 'px';
  
  }
  
}

function mouseUp(e) {
  dragable = false;
  console.log('up');
  posX = e.clientX-circle.offsetLeft;
  posY = e.clientY-circle.offsetTop;
  let finalAngle = getAngle(posX, posY, cx, cy);
  let steps = Math.round(angle * (max-min)/Math.PI/2 +min );

  if(finalAngle < 0.0) 
  {
    steps = steps + max - min;
  }
  // console.log('Steps: ',steps);

  
  
}

document.getElementById("main").onmousedown = function(e) {mouseDown(e)};
window.onmouseup = function(e) {mouseUp(e)};
window.onmousemove = function(e) {mouseMove(e)};

