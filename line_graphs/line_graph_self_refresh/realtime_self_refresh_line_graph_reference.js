/**
 * Example Exosite Custom Widget - realtime updating line graph using flot 
 * http://www.flotcharts.org/
 *  
 * Summary:
 * This widget shows how to use widget 'read' api to read a dataport value quickly and 
 * continously update the graph window.  This widget is not recommended for applications 
 * when data is reported slowly and millisecond updates time to a graph isn't useful.
 * 
 * Notes:
 * 1) Javascript and Flot timestamps are typically expecting milliseconds whereas 
 *    Exosite timestamps are in seconds.  Please watch for this as you customize this code
 * 2) Only works with one data port currently
 * 3) Make sure to set the refresh of the widget configuration window to 0 seconds.
 * 
 */

// select one or more data sources from the list above to view this demo.
function(container, portal)
{
    // SETTINGS
    // THIS VARIABLE SETS HOW MUCH TIME HISTORY TO SHOW IN MINUTES
    var TIME_HISTORY_MIN = 5; //minutes of history to show
    var TIME_HISTORY_S = TIME_HISTORY_MIN*60; // 
    var TIME_HISTORY_MS = TIME_HISTORY_S*1000; //

    var REFRESH_LIMIT = 60*60; // number of times to refresh getting data, this helps developers with mistakes so browser doesn't crash
    
    var REFRESH_GRAPH_INTERVAL = 250; //milliseconds, how often to refresh the graph
    
    var DATA_GAP_TIMEOUT = 10; //gap in seconds to show line graph white space in if no data in that gap
    
    var focus = true; // don't update graph if not on window tab

    //FLOT GRAPHING OPTIONS
    var GRAPH_OPTIONS = {
        series: {
            lines: { show: true, lineWidth: 1, fill: false, fillColor: "rgba(65, 196, 220, 0.2)"},
            points: { show: false, radius: 0.2, fillColor: "#41C4DC" },
            shadowSize: 0
        },
        legend: { position: "nw" },
        //xaxis: { mode: "time"  },
        //xaxis: { mode: "time" , minTickSize: [1,"day"] },
        xaxis: { mode: "time", show: false},
        //timeformat: "%m/%d/%Y",
        //timeformat: "%b %d",
        //timeformat: "%I:%M:%S %p",
        //selection: { mode: "x" },
        //yaxis:{min:0,max:100}, //if you want to hard-code y axis range
        grid: { hoverable: false, clickable: false },
        pan: { interactive: false },
        colors: ["#41C4DC","#FF5847","#FFC647", "#5D409C", "#BF427B","#D5E04D" ], // pick your own or comment out for defaults
        //grid: { backgroundColor:"#FFFFFF"}
    };



    //widget variables
    var times_to_refresh = 0; //counter for number of times refreshed
    var time_since_last_value = 0;
    var timer_id_datarefersh = 0;
    var timer_id_checkagain = 0;
    var timer_id_graphrefersh = 0;
    var current_refresh_interval = REFRESH_GRAPH_INTERVAL;

    var time_series_data = []; // array to hold the data to graph
    var new_series_data = []; // array to hold new data

    var last_time_s = parseInt((new Date).getTime() / 1000) - TIME_HISTORY_S; //pointer to help us track asking for data from Exosite Platform
    
    var graph_initialized = false; //only init once
    var first_exo_data = true; //once loading first data, then start graphing

    var dataport_friendly_name = '';
    var dataport_units = '';
    var widgetid = getWidgetInfo("id");
    var html_graph = "graph" + String(widgetid);
    var html_graph_element = "#"+html_graph+"";
    console.log("html element: " + html_graph);
    var graphwidget_div = 'graphwidget'+ String(widgetid);

    /*****
    * helper functions 
    *****/
    
    // prints an error message if something fails in the widget.
    function errorMsg(message)
    {
        $(html_graph_element).html(message);    
    }

    function timeConverter(UNIX_timestamp){
     var a = new Date(UNIX_timestamp*1000);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
     return time;
    }

    // returns a matrix of time and data.
    // set flot to true if returning data for a flot graph.
    function getData()
    {
        
        var timestamp;
        var value;
        var i;
        var j;
        var k;
        var row = [];
        var newData = [];
        var found_old_data = false;

        var current_time = parseInt((new Date).getTime() / 1000);

        //console.log('current time: '+current_time);
        times_to_refresh++
        
        if (current_time - last_time < 1){
            if(times_to_refresh < REFRESH_LIMIT){
                //console.log('check again in 1 sec')
                timer_id_checkagain = setTimeout(getData, 1000);
                return;
            }
            return;
        }

        var read_options = {
          starttime: last_time, // 1 week
          endtime: current_time,  // current time
          limit: 4000,                              // how many max points - this is a max limit set by Portals
          sort: "desc"                           // latest point
        };

        var starttime = timeConverter(read_options.starttime);
        var endtime = timeConverter(read_options.endtime);

        console.log('getting data: ' + starttime + ' to ' + endtime);

        for (i = 0; i < portal.clients.length; i++)
        {
            //console.log('getting data for:' + portal.clients[i].alias );

            // call the Portals 'read' widget API
            for (j = 0; j < portal.clients[i].dataports.length; j++)
            {
                //console.log('getting values for:' + portal.clients[i].dataports[j].alias);
                //console.log(JSON.stringify(read_options));
                read([portal.clients[i].alias, portal.clients[i].dataports[j].alias], read_options)
                  .done(function() {
                    newData = arguments;
                    console.log('exo returned values: '+newData.length);
                    for (k = 0; k < newData.length; k++)
                    {
                        row = [];
                        timestamp = Number(newData[k][0]);
                        //timestamp = Number(newData[k][0]) * 1000; //Change Unix Timestamps to Javascript milliseconds timestamp
                        row.push(timestamp);
                        if (isNaN(Number(newData[k][1])))
                        {
                            console.warn('not a number: ' + String(newData[k][1]) + ',skipping' );
                            break;
                        }
                        value = Number(newData[k][1]);
                        row.push(value);
                        //console.log('new value:' + timeConverter(row[0]) + ',' + row[1]);
                        new_series_data.push(row);
                        time_since_last_value = current_time;
                    }

                    //console.log('done getting data: ' + read_options.starttime + ' to ' + read_options.endtime );
                    //console.log(JSON.stringify(new_series_data));

                    //flotGraph();
                    if (first_exo_data == true){
                        first_exo_data = false;
                        setTimeout(flotGraph, 1000);
                    }

                    last_time = read_options.endtime+1; 

                    if(times_to_refresh < REFRESH_LIMIT){
                        //console.log('reschdule Exosite read')
                        timer_id_datarefersh = setTimeout(getData, 1000);
                    }

                  })
                  .fail(function() {
                    console.log('error getting data');
                  });
            }
        }
        return ;
    }

    function flotGraph()
    {
        function initGraph()
        {
            console.log('init graph');

            $(html_graph_element).bind("plotselected", function (event, ranges) {
                // do the zooming
                //console.log('zoom in, stop refresh')
                //clearTimeout(timer_id_datarefersh);
                //clearTimeout(timer_id_checkagain);
                $.plot($(html_graph_element), [series],
                        $.extend(true, {}, detailOptions, {
                        xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                                
                }));

            });

            var previousPoint = null;
            $(html_graph_element).bind("plothover", function (event, pos, item) {
                if (item) 
                {
                    var x = new Date(item.datapoint[0]);
                    var y = item.datapoint[1].toFixed(2);
                    
                    if (previousPoint != item.dataIndex) 
                    {
                        previousPoint = item.dataIndex;
                        $("#tooltip").remove();
                        showTooltip(item.pageX, item.pageY, x.toLocaleDateString() + ' ' + x.toLocaleTimeString(), y + ' Units');
                    }
                } 
                else 
                {
                    $("#tooltip").remove();
                    previousPoint = null;
                }
            });
        }

        if (focus == false){
            timer_id_graphrefersh = setTimeout(flotGraph, 1000);
            return;
        }

        var current_time = parseInt((new Date).getTime() / 1000);
        var window_start = current_time-TIME_HISTORY;

        // ADD NEW DATA IF AVAILABLE
        //if (new_series_data.length > 0) {console.log('new data for graph');}
        for (var i = 0;i < new_series_data.length; i++){
            
            var unique_timestamp = true;
            var new_value = new_series_data.pop();

            for(var j = time_series_data.length-1; j >= 0 ; j--)
            {
              if(time_series_data[j][0] == new_value[0])
              {
                unique_timestamp = false;
                time_series_data[j] = new_value;
                break;
              }
            }

            if (unique_timestamp == true) {
                time_series_data.push(new_value);
            }

            //if (one_val_at_a_time==true){
            //  break;
            //}
        }
        if (one_val_at_a_time == false){
            one_val_at_a_time = true;
        }



        // MASSAGE DATA FOR GRAPHING
                
        // find data in time_series_data that is older than the time window and remove it
        time_series_data = $.grep(time_series_data, function (value,index) {
            if(value[0] > (current_time - TIME_HISTORY) ){
                return true; //value is in than time window
            }
            else {
                //console.log('found old data at timestamp: '+value[0]);
                return false;
            }
        });


        // find data that is null inside of data gap timeout from leading eadge
        time_series_data = $.grep(time_series_data, function (value,index) {
            if(value[0] <= (current_time-DATA_GAP_TIMEOUT ) || value[1] != null){
                return true; //value is kept
            }
            else {
                //console.log('found null at timestamp: '+value[0]);
                return false;
            }
        });

        // if no data, show user message instead of graph
        if (0 == time_series_data.length)
        {
            errorMsg('No data within realtime data time window');
            timer_id_graphrefersh = setTimeout(flotGraph, 1000);
            return;
        }
        //else{
            //console.log('points to graph:'+time_series_data.length);
        //}

        //make sure data is in timeseries order
        time_series_data.sort(function(a,b){return a[0] - b[0]}); //

        // end value (real-time) should be null so graph leading edge stays up to current time
        if (time_series_data[time_series_data.length-1][0] < current_time){
            //console.log('set leading value to null');
            time_series_data.push([current_time,null]);
        }

        // start value (real-time) should be null so graph historical edge stays up to current time window
        if (time_series_data[0][0] > window_start){
            //console.log('start gap in data');
            time_series_data.splice(0,0,[window_start,null]); 
        }


        
        var null_timeslots = [];
        //check for large gaps in the data, decide to use empty space instead of continuous by putting in null values
        for (var i = 0 ;i < time_series_data.length; i++) {
            if (i == time_series_data.length-1 || i == 0) //reached last point or first point
            {
                ;
            }
            else if (time_series_data[i][0] - time_series_data[i-1][0] > DATA_GAP_TIMEOUT && time_series_data[i][1] != null){
                //console.log('mid gap in data: ' + i + ',' + time_series_data[i][0]);
                //debugger;
                ;
                null_timeslots.push([i,[time_series_data[i-1][0]+1,null]]);
                null_timeslots.push([i,[time_series_data[i][0]-1,null]])
            }
        }

        for(var i = 0;i<null_timeslots.length;i++){
            //console.log('fill in gap: ' + null_timeslots[i][0] + ',' + null_timeslots[i][1][0] );
            time_series_data.splice(null_timeslots[i][0],0,null_timeslots[i][1]);
        }
        

        //console.log('call flot');
        if (graph_initialized == false){
            initGraph();
            graph_initialized = true;
        }
        
        //console.log('update graph')

        //Change Unix Timestamps to Javascript milliseconds timestamp
        //for (var i = 0; i < time_series_data.length; i++)
        //{
        //    time_series_data[i][0] = time_series_data[i][0]*1000;
        //}

        var series = {
            label: "data",
            data: time_series_data,
            hoverable: true
        };

        //console.log('graphing updated data');
        $.plot($(html_graph_element), [series], detailOptions);
        timer_id_graphrefersh = setTimeout(flotGraph, REFRESH_GRAPH_INTERVAL);

    }

    function showTooltip(x, y, time, data) 
    {
        $('<div id="tooltip">' + time + '<br>' + data + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #3C3C3C',
            padding: '2px',
            'background-color': '#808080',
            opacity: 0.75
        }).appendTo("body").fadeIn(200);
    }    

    

    function setInitialView() 
    {
        var html = "";
        console.log('set initial view');

        if ( $('#'+graphwidget_div).length)
        { 
            //console.log('found element, no need to recreate');
            ;
        }
        else
        {
            html += '<div id=\"' +graphwidget_div+ '\" style=\"width:95%; height:90%;\">';
                html += '<div id=\"' + html_graph + '\" class=\"graph\" style=\"margin-top:18px; margin-left:15px; width:100%; height:100%; text-align:center; position:relative\">';
                html += 'just a sec...loading some data...';
                html += '</div>';
            html += '</div>';

            $(container).html(html);
        }
    }

    /*****
    * main code path starts here.
    *****/

    console.log('widget container refresh');

    setInitialView();
    
    $.when.apply($, [
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.time.min.js"),
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js"),
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.navigate.min.js")
    ]).done(function() {
        getData(); //start getting data
    });

  
}
