var chart_height = 400;
var chart_width = 400;
var paper = new Raphael(document.getElementById('cdf-canvas'), chart_width * 1.1, chart_height * 1.1);
var graph = paper.path("M 0 0 ");
var plot_graph = function (x_y_pairs) {

    var path_string = "";

    var x_max = _.max(_.map(x_y_pairs, function (p) {
        return p[0];
    }));
    var y_max = _.max(_.map(x_y_pairs, function (p) {
        return p[1];
    }));
    //console.log(x_max, y_max);

    var x_scale_factor = chart_width / x_max;
    var y_scale_factor = chart_height / y_max;
    //console.log(x_scale_factor, y_scale_factor);

    for (var i = 0; i < x_y_pairs.length; i++) {
        var this_x = parseInt(x_y_pairs[i][0] * x_scale_factor);
        var this_y = parseInt(x_y_pairs[i][1] * y_scale_factor);
        if (i === 0) {
            path_string += " M " + this_x + " " + (chart_height - this_y);
        } else {
            path_string += ' L ' + this_x + ' ' + (chart_height - this_y);
        }
    }
    //console.log(path_string);
    //var graph = paper.path(path_string);
    graph.animate({
        path: path_string
    }, 10, 'linear');
    graph.attr({
        fill: '#9cf',
        stroke: 'black',
            'stroke-width': 4
    });
};

var buckets = [];
var num_buckets = 50;
// Must be an even number
var rebalance_every = 1000;
var obs_so_far = 0;
var largest_ever = 0;
// We assume no X value is ever less than this
var x_min = -9999999999;
var initial_buffer = [];

var add_obs_to_bucket = function (obs) {
    obs_so_far++;
    if (obs > largest_ever) {
        largest_ever = obs;
    }
    if (initial_buffer.length < num_buckets * 2) {
        initial_buffer.push(obs);
        if (initial_buffer.length == num_buckets * 2) {
            initial_buffer.sort(function (a, b) {
                return a - b;
            });
            var z = 0;
            while (z < num_buckets * 2) {
                buckets.push({
                    min: initial_buffer[z],
                    max: initial_buffer[z + 1],
                    count: 2
                });
                z += 2;
            }
        }
        return;
    }

    var found = false;
    for (var i = 0; i < num_buckets; i++) {
        var this_bucket = buckets[i];
        if (i === 0 && obs < this_bucket.min) {
            this_bucket.min = obs;
            this_bucket.count++;
            found = true;
            break;
        } else if (obs >= this_bucket.min && obs <= this_bucket.max) {
            this_bucket.count++;
            found = true;
            break;
        } else if (i == num_buckets - 1 && obs >= this_bucket.max) {
            this_bucket.max = obs;
            this_bucket.count++;
            found = true;
            break;
        } else if (i !== 0 && obs >= buckets[i - 1].max && obs <= this_bucket.min) {
            // If it falls between two bins, give it to the closer one
            if (obs - buckets[i - 1].max < this_bucket.min - obs) {
                buckets[i - 1].max = obs;
                buckets[i - 1].count++;
                found = true;
                break;
            } else {
                this_bucket.min = obs;
                this_bucket.count++;
                found = true;
                break;
            }
        } else {
            // Must not be the right bucket yet...
            console.assert(!found);
            found = false;
        }
    }
    if (!found) {
        console.warn("Something must be wrong!  No bucket found for this obs.");
    }
    if (obs_so_far > 0 && obs_so_far % rebalance_every === 0) {
        buckets = get_rebalanced_buckets();
        plot_graph(get_cdf(), 'cdf-canvas');
        //plot_graph(get_pdf(), 'pdf-canvas');
    }
};

var get_rebalanced_buckets = function () {
    //console.log("buckets are", buckets);
    var max_iters = 1000;
    var iter_count = 0;
    var num_obvs_in_rebalancing = 0;
    // For knowing how far you have to jump from one max to the next min
    var jump_tracker = x_min;
    // if we have N total observations, move the buckets so that each one has N/num_buckets observations   
    var target_num_per_bucket = obs_so_far / num_buckets;
    var steps_and_rates_to_complete = [];
    var num_steps_planned = 0;
    for (var i = 0; i < num_buckets; i++) {
        var this_bucket = buckets[i];
        if (this_bucket.count === 0) {
            console.warn("we shouldnt be in here!");
            return 1;
        }

        // Jump from last max to the min
        steps_and_rates_to_complete.push({
            num_steps: 1,
            rate: this_bucket.min - jump_tracker
        });
        console.assert(jump_tracker <= this_bucket.min);
        num_steps_planned++;
        jump_tracker = this_bucket.max;

        // If there's more than one, do the uniform distribution assumption
        if (this_bucket.count > 1) {
            num_steps_planned += this_bucket.count - 1;
            var step_rate = (this_bucket.max - this_bucket.min) / (this_bucket.count - 1);
            steps_and_rates_to_complete.push({
                num_steps: this_bucket.count - 1,
                rate: step_rate
            });
        }
    }
    if (num_steps_planned != obs_so_far) {
        console.warn("Have not planned enough steps!", "Planned is", num_steps_planned, "so far:", obs_so_far);
        return 1;
    }
    var new_buckets = [];
    var new_min = x_min;
    var new_x = x_min;
    var num_steps_old_available = steps_and_rates_to_complete[0].num_steps;
    console.assert(num_steps_old_available == 1);
    var num_in_new_bucket = 0;
    var old_bucket_counter = 0;
    var just_finished_new_bucket = true;
    var new_bucket_index = 0;

    while (old_bucket_counter < steps_and_rates_to_complete.length) {
        //console.log("old bucket counter is ", old_bucket_counter);
        //console.log("num in entire rebalancing is ", num_obvs_in_rebalancing);
        iter_count++;
        if (iter_count > max_iters) {
            console.warn("Exceeded max iterations!");
            return 1;
        }
        //console.log("num in new bucket pre-step", num_in_new_bucket);
        var this_step_set = steps_and_rates_to_complete[old_bucket_counter];
        //console.log("step params", this_step_set);

        //console.log("available", num_steps_old_available);

        var rate_old = this_step_set.rate;

        //console.log("rate is", rate_old);
        var num_needed = target_num_per_bucket - num_in_new_bucket;
        console.assert(num_needed >= 0);
        console.assert(num_steps_old_available !== 0);
        //console.log("need", num_needed);
        if (num_needed === 0) {
            console.warn("we shouldnt be in here!  why are you iterating if you don't need any observations?!");
            return 1;
        }
        var num_to_take_from_old_bucket = Math.min(num_needed, num_steps_old_available);
        //console.log("takeing", num_to_take_from_old_bucket);
        if (num_to_take_from_old_bucket === 0) {
            console.warn("Trying to take 0 from a bucket!");
            return 1;
        }


        new_x += (num_to_take_from_old_bucket) * rate_old;
        if (new_x > largest_ever) {
            //console.warn("new x of ", new_x, "is bigger than largest ever of ", largest_ever);
        }
        //console.log("x is now", new_x);
        if (just_finished_new_bucket) {
            new_min = new_x;
            if (new_bucket_index !== 0) {
                // I know we set max to _something_ down below, but we can't have bins overlapping.
                // I think this is an ok assumption but should think about it more...
                //new_buckets[new_bucket_index -1].max = new_min;
            }
        }
        num_steps_old_available -= num_to_take_from_old_bucket;
        num_in_new_bucket = num_in_new_bucket + num_to_take_from_old_bucket;

        var old_exhausted = num_steps_old_available === 0;
        var new_bucket_completed = num_in_new_bucket == target_num_per_bucket;
        //console.log("num in new bucket post step", num_in_new_bucket);

        if (old_exhausted) {
            // We can use up what we have and then we need to go to the next old bucket
            if (old_bucket_counter !== steps_and_rates_to_complete.length - 1) {
                num_steps_old_available = steps_and_rates_to_complete[old_bucket_counter + 1].num_steps;
            }
            old_bucket_counter++;
        }
        if (new_bucket_completed) {
            // We can finish up this bucket and then go to the next old bucket, but need to finish the new bucket
            new_buckets.push({
                min: new_min,
                max: new_x,
                count: target_num_per_bucket
            });
            num_obvs_in_rebalancing += num_in_new_bucket;
            if (num_in_new_bucket !== target_num_per_bucket) {
                console.warn("proceeding without enough in a bucket argh fail!");
                return 1;
            }
            num_in_new_bucket = 0;
            just_finished_new_bucket = true;
            new_bucket_index++;
        } else {
            just_finished_new_bucket = false;
        }
    }
    if (num_obvs_in_rebalancing < obs_so_far) {
        console.warn("Didn't get enough obvs in rebalancing!", "got", num_obvs_in_rebalancing, "expected", obs_so_far);
        return 1;
    }
    return new_buckets;
};

var generate_gaussian = function (mu, sigma) {
    var have_spare = false;
    var rand1;
    var rand2;

    if (have_spare) {
        have_spare = false;
        return (sigma * Math.sqrt(rand1) * Math.sin(rand2)) + mu;
    }

    have_spare = true;

    rand1 = Math.random();
    if (rand1 < 1e-100) rand1 = 1e-100;
    rand1 = -2 * Math.log(rand1);
    rand2 = Math.random() * 2 * Math.PI;

    return (sigma * Math.sqrt(rand1) * Math.cos(rand2)) + mu;
};

var get_cdf = function () {
    var cdf_starts_and_props = [];
    for (var i = 0; i < num_buckets; i++) {
        var this_bucket = buckets[i];
        if (i === 0) {
            //console.log("min of all is", this_bucket.min);
        }
        var bucket_start = (this_bucket.max + this_bucket.min) / 2;
        var prop = i / num_buckets;
        cdf_starts_and_props.push([bucket_start, prop]);
    }
    return cdf_starts_and_props;
};

var get_pdf = function () {
    var cdf_points = get_cdf();
    //console.log(cdf_points.length);
    var pdf_points = [];
    for (var i = 0; i < cdf_points.length; i++) {
        var this_cdf_point = cdf_points[i];
        if (i != cdf_points.length - 1) {
            var next_cdf_point = cdf_points[i + 1];
            var x_dist = next_cdf_point[0] - this_cdf_point[0];
            var num_per_x_dist = 1 / x_dist;
            pdf_points.push([this_cdf_point[0], num_per_x_dist]);
        }
    }
    return pdf_points;
};

var points = [];
var normal_update_counter = 0;
var add_more = function () {
    normal_update_counter++;
    for (var i = 0; i < 10000; i++) {
        if (normal_update_counter % 200 > 30) {
            var coin_flip = Math.random() < .5;
            var num = coin_flip * generate_gaussian(23, 1) + 1 * generate_gaussian(15, 1);
        } else {
            var num = Math.random() * 100;
        }
        add_obs_to_bucket(num);
    }
    var num_so_far_string = Math.floor((obs_so_far / 1000)) + "k";
    document.getElementById('event-counter').innerHTML = num_so_far_string;
    if (obs_so_far > 10000000) {
        clearInterval(update_interval);
    }
}
update_interval = setInterval(add_more, 100);
//var test_vals = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 1.1, 1.6, 2.1, 2.6, 3.1, 3.6, 4.1, 4.6, 5.1, 5.6, //19, 20, 3.2, 3.4, 3.5, 0, 0 ,0 ,0 ,0 ,0 ,0 ,0 ,0, 0, 0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0];
//for(var i in test_vals){
//add_obs_to_bucket(test_vals[i]);
//}

//var cdf = get_cdf();
//console.log("cdf is ", cdf);
//plot_graph(cdf, 'cdf-canvas');
//var pdf = get_pdf();
//console.log("pdf is", pdf);
//plot_graph(pdf, 'pdf-canvas');
