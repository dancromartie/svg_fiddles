var plane_lines  = [
  "  \ `/",
  " \__`!",
  " / ,' `-.__________________",
  "\_____                LI`-.",
  "   <____()-=O=O=O=O=O=[]====--)",
  "     `.___ ,-----,_______...-'",
  "       0 0/    .'     0 0",
  "         /   .'",
  "        /  .'",         
  "        `-'"
];;

var render_plane = function(padding_left, padding_top, last, on_ground){
    var plane_text = "";
  for(var i=0; i<padding_top; i++){
    plane_text += "\n";
  }
  if(on_ground){
    plane_text += Array(padding_left + 1).join(" ") + "Hooray!\n";
  }
  for(var i=0; i<plane_lines.length; i++){
    plane_text += Array(padding_left + 1).join(" ");
    plane_text += plane_lines[i] + "\n";
  }
  $('#plane-pre').text(plane_text);
  if(on_ground){
    $("#message").text("Somewhere in the US, another airplane just finished a safe journey!  Relax...");
    $("#submessage").text("Despite the turbulence, that sound you just heard, and your pilot being 10th percentile for pilot intelligence.");
  }
    
}

var land_plane = function(){
  $("#message, #submessage").text("");
  var time_to_wait = 100;
  var num_horiz_movements = 100;
  var movement_when_flat = 50;
  var j = 0;
  var on_ground = false;
    for(var i=0; i<=num_horiz_movements; i++){
         var last = i == num_horiz_movements;
       if(i < movement_when_flat){
                j = i / 5;
       }else{
            on_ground = true;
       }
       time_to_wait += 20;
       var lander = make_lander(i, j, last, on_ground);
         setTimeout(lander, time_to_wait);
   }
}

var make_lander = function(i, j, last, on_ground){
    return function(){ render_plane(i, j, last, on_ground);};
}

var update_time = function(){
  var d = new Date();
    $("#time").text(d.toLocaleString());
}

$("document").ready(function(){
    var seconds_per_landing = 86400 * 1000.0 / 23910;
  $("#rate").text(", Seconds per landing: " + (seconds_per_landing / 1000.0).toPrecision(3));
  setInterval(land_plane, seconds_per_landing);
  update_time();
  setInterval(update_time, 1000);
});


<h3>Simulator for flight anxiety</h3>

<p>I have some friends and family that are unwilling to fly. I'll even admit to getting a little anxious myself now and then, despite flying frequently.</p>

<p>
There are about 24k commercial flights in the US alone daily, I read.  Supposedly crashes only happen once every few million flights.  But, as discussed in the book "Innumeracy" by John Allen Paulos, people often don't have a good grasp of what big numbers mean.  Would you feel twice as safe with a 1 in 6 million chance of dying as you would with a 1 in 3 million chance?  Perhaps, logically speaking, one knows that "one in several million" are good odds, but it's still possible it doesn't register very much with the less thinking, more emotional parts of one's brain.  Maybe this is a complementary way one could think about it.</p>

#plane-pre {
    height: 220px;
    color: blue;
}
#message{
  height: 50px;
  font-size: 30px;
  color: green;
}
