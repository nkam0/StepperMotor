let knob_being_dragged = null;
let knob_drag_previous_rad = null;
let knob_drag_previous_rotations = null;
let knob_start = 0;
let knob_end = 0;
let cur_rotations = null;




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


function get_position(elem) {
  var rect = elem.getBoundingClientRect();
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
    //cursor = [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
  }
  
  var rad = Math.atan2(cursor[1] - pos[1], cursor[0] - pos[0]);
  rad += Math.PI / 2;

  return rad;
}


function start_dragging(e) {
  knob_being_dragged = e.currentTarget;
  e.preventDefault();
  e.stopPropagation();
  
  var rad = get_mouse_angle(e, knob_being_dragged.getElementsByClassName('knob_center')[0]);
  knob_start = knob_end;
  knob_drag_previous_rad = rad;
  knob_drag_previous_rotations = cur_rotations;
}

function stop_dragging(e) {
  knob_being_dragged = null;

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


function set_event_listeners() {
  let elem = document.getElementById('foobar').getElementsByClassName('knob')[0];
  let sliderElem = document.querySelector('#rangetesting');
  //for desktops
  elem.addEventListener('mousedown', start_dragging);
  sliderElem.addEventListener('mousedown', (e) => knob_start=knob_end);
  document.addEventListener('mouseup', stop_dragging);
  document.addEventListener('mousemove', drag_rotate);
  //for touchscreens
  elem.addEventListener('touchstart', start_dragging);
  sliderElem.addEventListener('touchstart', (e) => knob_start=knob_end);
  document.addEventListener('touchend', stop_dragging);
  document.addEventListener('touchmove', drag_rotate);
  
  document.getElementById('rangetesting').addEventListener('input', function(e) {
    
    let number = parseFloat(e.target.value);
    set_rotations(number);    
  });
}
set_event_listeners();
set_rotations(0);

