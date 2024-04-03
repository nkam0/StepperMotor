function format_number(number) {
  if (Math.round(Math.abs(number) * 10) >= 10 * 10) {
    return number.toFixed(0);
  } else {
    return number.toFixed(1);
  }
}

// Converts the speed to the number of full-circles rotations.
// | Speed | Rotations |
// |  0.0× |    0.0    |
// |  1.0× |    1.0    |
// |  2.0× |    2.0    |
// |  3.0× |    2.5    |
// |  4.0× |    3.0    |
// |  8.0× |    4.0    |
// | 12.0× |    5.0    |
// | 16.0× |    6.0    |
function speed_to_rotations(speed) {
  var sign = speed < 0 ? -1 : 1;
  var abs = Math.abs(speed);
  
  if (abs < 2) {  // 0..2
    return speed;
  } else if (abs < 4) {  // 2..4
    return sign * ((abs - 2) / 2 + 2);
  } else {  // 4..inf
    return sign * ((abs - 4) / 4 + 3);
  }
}

// Inverse of speed_to_rotations.
function rotations_to_speed(rotations) {
  var sign = rotations < 0 ? -1 : 1;
  var abs = Math.abs(rotations);
  
  if (abs < 2) {  // 0..2
    return rotations;
  } else if (abs < 3) {  // 2..3
    return sign * ((abs - 2) * 2 + 2);
  } else {  // 3..inf
    return sign * ((abs - 3) * 4 + 4);
  }
}



var cur_speed = null;
var cur_rotations = null;
var max_rotations = speed_to_rotations(16);
var min_rotations = speed_to_rotations(-16);

function set_rotations(rotations) {
  if (snapping.checked) {
    var divisions = parseInt(snapping_granularity.value, 10);
    if (divisions >= 2) {
      rotations = Math.round(rotations * divisions) / divisions;
    }
  }
  
  if (max_rotations !== null && max_rotations !== undefined && rotations > max_rotations) {
    rotations = max_rotations;
  }
  if (min_rotations !== null && min_rotations !== undefined && rotations < min_rotations) {
    rotations = min_rotations;
  }
  
  cur_rotations = rotations;
  cur_speed = rotations_to_speed(rotations);
  
  foobar.getElementsByClassName('knob_number')[0].textContent = format_number(cur_speed);
  foobar.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (cur_rotations * 360) + 'deg)';
}
function set_speed(speed) {
  set_rotations(speed_to_rotations(speed));
}


// Inspired by:
// https://github.com/KaisarCode/Rotate/blob/master/kc-rotate-dial.js#L62
// function get_position(elem) {
//   var x = 0;
//   var y = 0;
//   while (elem) {
//     x += elem.offsetLeft;
//     y += elem.offsetTop;
//     elem = elem.offsetParent;
//   }
//   return [x, y];
// }

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
  
  //console.log(pos, cursor, rad);

  return rad;
}


var knob_being_dragged = null;
var knob_drag_previous_rad = null;
var knob_drag_previous_rotations = null;
function start_dragging(e) {
  knob_being_dragged = e.currentTarget;
  e.preventDefault();
  e.stopPropagation();
  
  var rad = get_mouse_angle(e, knob_being_dragged.getElementsByClassName('knob_center')[0]);
  knob_drag_previous_rad = rad;
  knob_drag_previous_rotations = cur_rotations;
}
function stop_dragging(e) {
  knob_being_dragged = null;
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
  
  var delta_rotation = delta / Math.PI / 2;
  var rotations = knob_drag_previous_rotations + delta_rotation;
  knob_drag_previous_rotations = rotations;
  set_rotations(rotations);
}


function set_event_listeners() {
  var elem = document.getElementById('foobar').getElementsByClassName('knob')[0];
  console.log(elem);
  elem.addEventListener('mousedown', start_dragging);
  document.addEventListener('mouseup', stop_dragging);
  document.addEventListener('mousemove', drag_rotate);
  elem.addEventListener('touchstart', start_dragging);
  document.addEventListener('touchend', stop_dragging);
  document.addEventListener('touchmove', drag_rotate);
  
  document.getElementById('rangetesting').addEventListener('input', function(e) {
    var number = parseFloat(e.target.value);
    set_speed(number);
  });
}
set_event_listeners();
set_speed(1);

