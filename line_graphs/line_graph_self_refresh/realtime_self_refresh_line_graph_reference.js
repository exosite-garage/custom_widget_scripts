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
    
    var REFRESH_GRAPH_INTERVAL = 30; //milliseconds, how often to refresh the graph
    
    var DATA_GAP_TIMEOUT = 30; //gap in seconds to show line graph white space in if no data in that gap
    
    var focus = true; // don't update graph if not on window tab

    //FLOT GRAPHING OPTIONS
    var GRAPH_OPTIONS = {
        series: {
            lines: { show: true, lineWidth: 2, fill: true, fillColor: "rgba(65, 196, 220, 0.2)"},
            points: { show: true, radius: 0.8, fillColor: "#FFFFFF" },
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

    var last_data_time_s = parseInt((new Date).getTime() / 1000) - TIME_HISTORY_S; //pointer to help us track asking for data from Exosite Platform
    var last_check_time_s = 0;

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

    // returns a matrix of new date with timestamps from Exosite.
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

        var current_time_s = parseInt((new Date).getTime() / 1000);

        //console.log('current time: '+current_time_s);
        times_to_refresh++
        
        if (current_time_s - last_check_time_s < 1){
            if(times_to_refresh < REFRESH_LIMIT){
                //console.log('check again in 1 sec')
                timer_id_checkagain = setTimeout(getData, 500);
                return;
            }
            return;
        }

        last_check_time_s = current_time_s;

        var read_options = {
          starttime: last_data_time_s+1, // start of data window
          limit: 4000,                              // how many max points - this is a max limit set by Portals
          sort: "desc"                           // latest point
        };

        console.log('getting data: ' + timeConverter(read_options.starttime) + ' to ' + timeConverter(current_time_s));

        for (i = 0; i < portal.clients.length; i++)
        {
            //console.log('getting data for:' + portal.clients[i].alias );

            // call the Portals 'read' widget API
            for (j = 0; j < portal.clients[i].dataports.length; j++)
            {
                //console.log('getting values for:' + portal.clients[i].dataports[j].alias);
                console.log(JSON.stringify(read_options));
                var meta = portal.clients[i].dataports[j]['info']['description']['meta'];
                dataport_friendly_name = portal.clients[i].dataports[j]['info']['description']['name'];
                var meta_json = JSON.parse(meta);
                if (meta_json['datasource']['unit'] ){
                    dataport_units = meta_json['datasource']['unit'];
                }

                read([portal.clients[i].alias, portal.clients[i].dataports[j].alias], read_options)
                  .done(function() {
                    newData = arguments;
                    console.log('exo returned values: '+newData.length);
                    for (k = 0; k < newData.length; k++)
                    {
                        row = [];
                        timestamp_s = Number(newData[k][0]);
                        timestamp_ms = Number(newData[k][0]) * 1000; //Change Unix Timestamps to Javascript milliseconds timestamp

                        row.push(timestamp_ms);
                        if (isNaN(Number(newData[k][1])))
                        {
                            console.warn('not a number: ' + String(newData[k][1]) + ',skipping' );
                            break;
                        }
                        value = Number(newData[k][1]);
                        row.push(value);
                        //console.log('new value:' + timeConverter(row[0]) + ',' + row[1]);
                        new_series_data.push(row);
                      if (timestamp_s > time_since_last_value){
                        time_since_last_value = timestamp_s;
                      }
                    }

                    //console.log('done getting data: ' + read_options.starttime + ' to ' + current_time_s );
                    //console.log(JSON.stringify(new_series_data));

                    //flotGraph();
                    if (first_exo_data == true){
                        first_exo_data = false;
                        setTimeout(flotGraph, 1000);
                    }

                    last_data_time_s = time_since_last_value; 

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

        var current_time_ms = parseInt((new Date).getTime()); //in MS
        var window_start = current_time_ms-TIME_HISTORY_MS; //This is the graphing time window, assume it continuously moves

        // find data that is null inside of data gap timeout from leading eadge
        time_series_data = $.grep(time_series_data, function (value,index) {
            if(value[0] <= (current_time_ms-(DATA_GAP_TIMEOUT*1000) ) || value[1] != null){
                return true; //value is kept
            }
            else {
                //console.log('found null at timestamp: '+value[0]);
                return false;
            }
        });

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
                //console.log('new data')
                time_series_data.push(new_value);
            }

        }


        // MASSAGE DATA FOR GRAPHING
        
        // find data in time_series_data that is older than the time window and remove it
        time_series_data = $.grep(time_series_data, function (value,index) {
            if(value[0] > (current_time_ms - TIME_HISTORY_MS) ){
                return true; //value is in than time window
            }
            else {
                //console.log('found old data at timestamp: '+value[0]);
                return false;
            }
        });
        
        // if no data, show user message instead of graph
        if (0 == time_series_data.length)
        {
            errorMsg('No data within last ' + String(TIME_HISTORY_MIN) + ' minutes');
            timer_id_graphrefersh = setTimeout(flotGraph, 1000);
            return;
        }
        //else{
            //console.log('points to graph:'+time_series_data.length);
        //}

        //make sure data is in timeseries order
        time_series_data.sort(function(a,b){return a[0] - b[0]}); //

        // end value (real-time) should be null so graph leading edge stays up to current time
        if (time_series_data[time_series_data.length-1][0] < current_time_ms){
            //console.log('set leading value to null');
            time_series_data.push([current_time_ms,null]);
        }

        var latest_good_value = 'na';
        for (var i = time_series_data.length-1 ;i >= 0; i--) 
        {
            if (time_series_data[i][1] != null){
                latest_good_value = time_series_data[i][1];
                break;
            }
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
            else if (time_series_data[i][0] - time_series_data[i-1][0] > (DATA_GAP_TIMEOUT*1000) && time_series_data[i][1] != null){
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
        

        if (graph_initialized == false){
            initGraph();
            graph_initialized = true;
        }
        
        var series = {
            label: dataport_friendly_name + ' ' + latest_good_value + ' ' + dataport_units,
            data: time_series_data,
            hoverable: true
        };

        $.plot($(html_graph_element), [series], GRAPH_OPTIONS);
        if (current_time_ms/1000 - time_since_last_value > 30 ){current_refresh_interval = 1000;}//refresh slower, we are not getting data very fast
        else{ current_refresh_interval = REFRESH_GRAPH_INTERVAL;} //whatever user set to

        if(times_to_refresh < REFRESH_LIMIT){
            //console.log('reschdule Exosite read')
            timer_id_graphrefersh = setTimeout(flotGraph, current_refresh_interval);
        }
        

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
