let knob_being_dragged = null;
let knob_drag_previous_rad = null;
let knob_drag_previous_rotations = null;
let knob_start = 0;
let knob_end = 0;
let cur_rotations = null;


//elements
let knobElem = document.querySelector('#dial-col');
let sliderElem = document.querySelector('#rangetesting');
let homeBtnElem = document.querySelector("#homeBtn");




function format_number(number) {
    return number.toFixed(0);
}


function set_rotations(rotations) {

  cur_rotations = rotations;
  
  foobar.getElementsByClassName('knob_number')[0].textContent = format_number(cur_rotations * 360);
  document.getElementById('rangetesting').value = cur_rotations;
  foobar.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (cur_rotations * 360) + 'deg)';

  // Ensures the start and end angles are between -360 and 360
  if(Math.round(rotations*360)>360){
    knob_end = 360;
  }else if(Math.round(rotations*360)<-360){
    knob_end = -360;
  }else{
    knob_end = Math.round(rotations*360);
  }
}


function get_position(knobElem) {

  var rect = knobElem.getBoundingClientRect();
  return [
    rect.left + (rect.right - rect.left) / 2,
    rect.top + (rect.bottom - rect.top) / 2
  ];
}

function get_mouse_angle(event, center_elem) {
  var pos = get_position(center_elem);

  var cursor = [event.clientX, event.clientY];
  if (event.targetTouches && event.targetTouches[0]) {
    cursor = [event.targetTouches[0].clientX, event.targetTouches[0].clientY];
  }
  
  var rad = Math.atan2(cursor[1] - pos[1], cursor[0] - pos[0]);
  rad += Math.PI / 2;

  return rad;
}


function drag_outside(e){
  e.stopPropagation();
  stop_dragging();
}

function start_dragging(e) {
  knob_being_dragged = e.currentTarget;
  e.preventDefault();
  e.stopPropagation();

  knobElem.addEventListener('mouseleave', drag_outside);
  
  var rad = get_mouse_angle(e, knob_being_dragged.getElementsByClassName('knob_center')[0]);
  knob_start = knob_end;
  knob_drag_previous_rad = rad;
  knob_drag_previous_rotations = cur_rotations;
}

function stop_dragging(e) {
  knob_being_dragged = null;
  knobElem.removeEventListener('mouseleave', drag_outside);

  let steps = knob_end - knob_start;

  if (steps>0){
    direction = "CW"
  }else if(steps<0){
    direction = "CCW"
  }else{
    direction = null;
  }

  console.log("START: " + knob_start + ", END: " + knob_end + ", " + steps + ", " + direction);  
  submitForm(steps, direction); 
}

function drag_rotate(e) {
  if (!knob_being_dragged) {
    return;
  }
  
  var rad = get_mouse_angle(e, knob_being_dragged.getElementsByClassName('knob_center')[0]);
  var old = knob_drag_previous_rad;
  knob_drag_previous_rad = rad;

  var delta = rad - old;
  if (delta < 0) {
    // Because this is a circle
    delta += Math.PI * 2;
  }
  if (delta > Math.PI) {
    // Converting from 0..360 to -180..180.
    delta -= Math.PI * 2;
  }
  console.assert(delta >= -Math.PI && delta <= Math.PI, {delta: delta, rad: rad, old: old});
  
  // var rotation = rad / Math.PI / 2;
  
  let delta_rotation = delta / Math.PI / 2;  
  let rotations = knob_drag_previous_rotations + delta_rotation; 
  
  knob_drag_previous_rotations = rotations;

  //Allows only 360 to -360 rotation
  if (knob_drag_previous_rotations>1 || knob_drag_previous_rotations<-1){
    knob_being_dragged = null;
    return;
  }
  
  set_rotations(rotations);

  
}

function homing() {
  if (wsStatus == 1){
    websocket.send("homing");
  }
  //zero everything
  knob_start = 0;
  knob_end = 0;
  knob_drag_previous_rad = 0;
  knob_drag_previous_rotations = 0;
  cur_rotations = 0;
  foobar.getElementsByClassName('knob_number')[0].textContent = format_number(0);
  document.getElementById('rangetesting').value = 0;
  foobar.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (0) + 'deg)';
}

function test(){
  console.log("outside")
}

function set_event_listeners() {

  //for desktops
  homeBtnElem.addEventListener('click', homing);
  knobElem.addEventListener('mousedown', start_dragging);
  knobElem.addEventListener('mouseup', stop_dragging);
  knobElem.addEventListener('mousemove', drag_rotate);
  sliderElem.addEventListener('mousedown', (e) => knob_start=knob_end);
  //for touchscreens
  knobElem.addEventListener('touchstart', start_dragging);
  knobElem.addEventListener('touchend', stop_dragging);
  knobElem.addEventListener('touchmove', drag_rotate);
  sliderElem.addEventListener('touchstart', (e) => knob_start=knob_end);
  //input via slider
  document.getElementById('rangetesting').addEventListener('change', function(e) {
    let number = parseFloat(e.target.value);
    set_rotations(number);
    stop_dragging();  
  });
}


set_event_listeners();
set_rotations(0);




