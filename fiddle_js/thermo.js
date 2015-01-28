var paper = new Raphael(document.getElementById('canvas_container'), 500, 500);



var glass_bottom_outer = paper.path("M80 400 a 45 45, 0, 1, 0, 40 0 ");
glass_bottom_outer.attr({
    stroke: 'black',
    'stroke-width': 2,
    fill: "none"
});

var glass_bottom_inner = paper.path("M72 400 a 49 49, 0, 1, 0, 56 0 ");
glass_bottom_inner.attr({
    stroke: 'black',
    'stroke-width': 2,
    fill: "none"
});

var glass_left_outer = paper.path("M72 400 l 0 -160 Z");
var glass_left_inner = paper.path("M76 400 l 0 -160 Z");
var glass_right_outer = paper.path("M128 400 l 0 -160 Z");
var glass_right_inner = paper.path("M124 400 l 0 -160 Z");

var fluid_bottom = paper.path("M80 400 a 45 45, 0, 1, 0, 40 0  ");
fluid_bottom.attr({fill: "red"});

var glass_top = paper.path("M72 240 a 35 50, 0, 0, 1, 56 0 ");
glass_top.attr({
    stroke: 'black',
    'stroke-width': 2,
    fill: "none",
});


var fluid_level = paper.path("M 0 0");

function change_temp(new_temp){
    var fluid_height_percent = new_temp;
    var fh_y = Math.floor(160 * fluid_height_percent / 100);
    console.log(fh_y);
    var path_string = "M 76 400 l 0 -" + fh_y + " l 48 0 l 0 " + fh_y;
    console.log(path_string);
    
    
    fluid_level.animate({
            path: path_string
    }, 200, 'linear');
    
    fluid_level.attr({fill: "red"});
}

document.getElementById('change-button').onclick=function(){change_temp(Math.random()* 100)};
