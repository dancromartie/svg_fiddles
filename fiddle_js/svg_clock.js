var r = 170;
var cx = 300;
var cy = 200;

var paper = new Raphael(document.getElementById('canvas_container'), 1000, 1000);
var circle = paper.circle(cx, cy, r);
var dot = paper.circle(cx, cy, r * 1 / 8);

var hour_hand = paper.path("M " + cx + " " + cy + " l 0 0");
var minute_hand = paper.path("M " + cx + " " + cy + " l 0 0");
var second_hand = paper.path("M " + cx + " " + cy + " l 0 0");

circle.attr({
    stroke: 'brown',
    'stroke-width': 6
});
dot.attr({
    fill: 'black',
    stroke: 'yellow',
    'stroke-width': 3
});

var signature_string = "Cromograph™ NYC\nSince " + (new Date()).getFullYear();
paper.text(cx, cy + .35 * r, signature_string).attr({
    'text-anchor': 'middle',
        'font-size': r * .07
});

second_hand.attr({
    fill: '#9cf',
    stroke: 'black',
    'stroke-width': .3 * r / 8
});
minute_hand.attr({
    fill: '#9cf',
    stroke: 'black',
    'stroke-width': .5 * r / 8
});
hour_hand.attr({
    fill: '#9cf',
    stroke: 'black',
    'stroke-width': .8 * r / 8
});

var degrees_to_x_y_offset = function (degrees, radius) {
    // I want pi/2 to correspond to "0" degrees; it's just easier for my head
    // So subtract 90...
    var radians = ((degrees - 90) / 360.0) * 2 * Math.PI;
    x_offset = Math.cos(radians) * radius;
    y_offset = Math.sin(radians) * radius;
    return [x_offset, y_offset];
}

var degrees_to_path_string = function (degrees, radius, x_cent, y_cent) {
    var x_y = degrees_to_x_y_offset(degrees, radius);
    return "M " + x_cent + " " + y_cent + " l " + x_y[0] + " " + x_y[1];
}

// Make the big tickmarks (i.e. every 5 minutes)
for (var major_mark_counter = 0; major_mark_counter < 360; major_mark_counter += 30) {
    var x_y_1 = degrees_to_x_y_offset(major_mark_counter, r * 5 / 8);
    var x_y_2 = degrees_to_x_y_offset(major_mark_counter, r * 3 / 8);

    var major_mark_path = "M " + (cx + x_y_1[0]) + " " + (cy + x_y_1[1]) + " l " + x_y_2[0] + " " + x_y_2[1];
    paper.path(major_mark_path);
    // Make little tickmarks (i.e. every 1 minute)
    for (
    var minor_mark_counter = major_mark_counter;
    minor_mark_counter < major_mark_counter + 30;
    minor_mark_counter += 6) {
        var x_y_3 = degrees_to_x_y_offset(minor_mark_counter, r * 7 / 8);
        var x_y_4 = degrees_to_x_y_offset(minor_mark_counter, r * 1 / 8);
        var minor_mark_path = "M " + (cx + x_y_3[0]) + " " + (cy + x_y_3[1]) + " l " + x_y_4[0] + " " + x_y_4[1];
        paper.path(minor_mark_path);
    }
}

//Get the current time so we can start the clock off at the right place
var now = new Date();
// i for second, j for minute, k for hour
i = (now.getSeconds() / 60.0) * 360;
// The minute hand would be halfway through the minor tick if second hand is at 30, etc
j = (now.getMinutes() / 60.0) * 360 + (i / 360) * 6;
// Also, hour hand is halfway through major tick if minute hand at 30, etc
// There are 24 hours to a day, but only 12 hours to a cycle of that hand, so divide by 12
k = (now.getHours() / 12.0) * 360 + (j / 360) * 30;

var update_hands = function () {
    // Render the current degrees
    second_hand.animate({
        path: degrees_to_path_string(i, r * 7 / 8, cx, cy)
        // Can adjust this animation time to make snappier or smoother
    }, 150, 'linear');
    minute_hand.animate({
        path: degrees_to_path_string(j, r * 6 / 8, cx, cy)
    }, 150, 'linear');
    hour_hand.animate({
        path: degrees_to_path_string(k, r * 3.5 / 8, cx, cy)
    }, 150, 'linear');

    // Have each hand adjust its corresponding number of degrees (but render later)
    i = i + (360 / 60);
    j = j + (360 / 60 / 60);
    k = k + (360 / 60 / 60 / 24);
}

// Tick once per second!
setInterval(update_hands, 1000)
