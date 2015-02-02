var timer_app = {};
timer_app.current_timer_names = {};
timer_app.active_timer = null;

var add_timer = function(new_timer_name){
    if(new_timer_name in timer_app.current_timer_names){
        alert("timer with that name already exists");
        return;
    }
    
    timer_app.current_timer_names[new_timer_name] = 1;
    
    var timer_container = $("<div class='timer'></div>");
    timer_container.attr("timer-name", new_timer_name);
    var header = $("<div class='timer-header'></div>");
    $("<span></span>").text(new_timer_name).appendTo(header);
    header.appendTo(timer_container);
    var minutes = $("<div class='counter'><span>M: </span><span class='minutes'>0</span>");
    var seconds = $("<div class='counter'><span>S: </span><span class='seconds'>0</span>");
    minutes.appendTo(timer_container);
    seconds.appendTo(timer_container);
    
    var delete_text = $("<div class='delete'>rm</div>");
    delete_text.appendTo(timer_container);

    timer_container.appendTo('body');
}

$("#add-timer-button").click(function(){
    add_timer($("#timer-name").val()); 
});

var update_timer = function(timer_name){
    var container_selector = ".timer[timer-name=" + timer_name + "]";

    var minutes_elem = $(container_selector + " .minutes");
    var minutes_num = parseInt(minutes_elem.text());
    var seconds_elem = $(container_selector + " .seconds");
    var seconds_num = parseInt(seconds_elem.text());
    
    if(seconds_num == 60){
        seconds_num = 0;
        minutes_num++;
    }else{
        seconds_num++;
    }
    
    minutes_elem.text(minutes_num);
    seconds_elem.text(seconds_num);
    
};

var update_active_timer = function(){
    if(timer_app.active_timer === null){
        return;
    }
    update_timer(timer_app.active_timer);
}

$("body").on("click", ".timer-header span", function(){
    var timer_name = $(this).text();
    $(".timer-header span").css("color", "black");
    $(this).css("color", "green");
    timer_app.active_timer = timer_name;
});

$("body").on("click", ".delete", function(){
    var container = $(this).closest(".timer");
    var timer_name = container.attr("timer-name");
    delete timer_app.current_timer_names[timer_name];
    container.remove();
});

setInterval(update_active_timer, 1000);
