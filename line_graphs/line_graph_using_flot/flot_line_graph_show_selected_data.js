/**
 * Example Exosite Custom Widget - Flot line graph
 * Uses: http://www.flotcharts.org/
 * @version 1
 * This example custom widget is meant to be like the off the shelf 
 * line graph widgets available in Exosite portals, but allow developers 
 * flexibility to change the code.
 * The widget assumes data will be provided to it using the Widget container as an array 
 * and that it will be refreshed by the widget configuration refresh time.
 * Some of the flot options are commented out below so developers can quickly see how they 
 * may do something like formatting the date, specifying a Y axis range, etc.
 */

// select one or more data sources from the list above to view this demo.
function(container, portal)
{
    var timer_id_graphrefersh = 0;
    
    var graph_initialized = false; //only init once
    var widgetid = getWidgetInfo("id");
    var html_graph = "graph" + String(widgetid);
    var html_graph_element = "#"+html_graph+"";
   console.log("html element: " + html_graph);

    // flot graph options
    var detailOptions = {
        series: {
            lines: { show: true, lineWidth: 1, fill: false, fillColor: "rgba(65, 196, 220, 0.2)"},
            points: { show: false, radius: 0.2, fillColor: "#41C4DC" }
        },
        legend: { position: "nw" },
        xaxis: { mode: "time"  },
        //xaxis: { mode: "time" , minTickSize: [1,"day"] },
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

    /*****
    * helper functions 
    *****/
    
    // prints an error message if something fails in the widget.
    function errorMsg(message)
    {
        $(html_graph_element).html(message);    
    }

    // returns a matrix of time and data.
    // set flot to true if returning data for a flot graph.
    
    function flotGraph()
    {
        function initGraph()
        {
            console.log('init graph');
            $(html_graph_element).bind("plotselected", function (event, ranges) {
                // do the zooming
                //console.log('zoom in, stop refresh')
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

        var current_time = parseInt((new Date).getTime() / 1000);
        //var window_start = current_time-TIME_HISTORY;
        var current_value = null;

        if (graph_initialized == false){
            //console.log('init flot');
            initGraph();
            graph_initialized = true;
        }
        
        // JSON FORMAT OF FLOT DATA
        // [{"alias":"alias1","timedata":[[]],"friendly":"friendlyname1"}, {"alias":"alias2","timedata":[[]],"friendly":"friendlyname2"} ]

        //console.log('update graph')
        var series = [];
        //Get all selected device dataports
        for (i = 0; i < portal.clients.length; i++)
        {
            //console.log('getting data for:' + portal.clients[i].alias );
            for (j = 0; j < portal.clients[i].dataports.length; j++)
            {

                var meta = portal.clients[i].dataports[j]['info']['description']['meta'];
                var friendly = portal.clients[i].dataports[j]['info']['description']['name'];
                var meta_json = JSON.parse(meta);
                var dp_units = '';
                if (meta_json['datasource']['unit'] ){
                    dp_units = meta_json['datasource']['unit'];
                }
                console.log('got data for: ' + friendly );
                series.push({
                    label: friendly,
                    data: portal.clients[i].dataports[j]['data'],
                    hoverable: true,
                    units: dp_units
                });
            }

        }
        //get all selected portal dataports
        for (j = 0; j < portal.dataports.length; j++)
        {

            var meta = portal.dataports[j]['info']['description']['meta'];
            var friendly = portal.dataports[j]['info']['description']['name'];
            var meta_json = JSON.parse(meta);
            var dp_units = '';
            if (meta_json['datasource']['unit'] ){
                dp_units = meta_json['datasource']['unit'];
            }
            console.log('got data for: ' + friendly );
            series.push({
                label: friendly,
                data: portal.dataports[j]['data'],
                hoverable: true,
                units: dp_units
            });
        }

        console.log('check if we have data');
        // if no data, show user message instead of graph
        console.log('series length:' + series.length)

        if (series.length == 0) {
            console.log('no data for time window')
            errorMsg('No data within realtime data time window or no data selected');
            //timer_id_graphrefersh = setTimeout(flotGraph, 2000);
            return;
        }
        var nodata = true;
        for (var j = 0; j < series.length;  j++ )
        {
            if (0 < series[j]['data'].length) {
                nodata = false;
            }
            //console.log('data points set size:'+ series[j]['label'] + ',' + series[j]['data'].length);
        }
        if (nodata == true){
            console.log('no data for time window');
            errorMsg('No data within realtime data time window');
            //timer_id_graphrefersh = setTimeout(flotGraph, 2000);
            return;
        }

        //make sure data is in timeseries order
        for (var j = series.length-1; j >= 0 ; j-- )
        {

            if (series[j]['data'].length > 0)
            {
                // Sort data to be sure in correct time order
                console.log('sort data')
                series[j]['data'].sort(function(a,b){return a[0] - b[0]}); //Array now becomes [7, 8, 25, 41]
                
                // get the last value
                current_value = series[j]['data'][series[j]['data'].length-1][1]

                // end value (real-time) should be null so graph leading (right) edge stays up to current time
                if (series[j]['data'][series[j]['data'].length-1][0] < current_time){
                    console.log('set leading value to null');
                    series[j]['data'].push([current_time,null]);
                }

                /*
                // start value (real-time) should be null so graph historical edge stays up to current time window
                // Unfortunately the time window is not known, it is not available from the options for the widget.
                // You could specify your own window start / size 
                if (time_series_data[j].timedata[0][0] > window_start){
                    //console.log('start gap in data');
                    time_series_data[j].timedata.splice(0,0,[window_start,null]); 
                }
                */

                //Change Unix Timestamps to Javascript milliseconds timestamp
                for (var z = 0; z < series[j]['data'].length; z++)
                {
                    series[j]['data'][z][0] = series[j]['data'][z][0]*1000;
                }

                //put the current value into the label
                if (current_value != null){
                    series[j]['label'] = series[j]['label'] + ':  ' + String(current_value) + ' ' + series[j]['units']; //latest value in label
                }
            }
            else {
                 //put the 'na' into the label
                series[j]['label'] = series[j]['label'] + ':  na'; //latest value in label
            }
        }
        if (series.length == 1){
            // if only showing one line graph, use fill
            detailOptions['series']['lines']['fill'] = true;
        }

        //console.log('graphing updated data');
        $.plot($(html_graph_element), series, detailOptions);

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

        if ( $('#graphwidget').length)
        { 
            //console.log('found element, no need to recreate');
            ;
        }
        else
        {
            html += '<div id=\"graphwidget\" style=\"width:95%; height:90%;\">';
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
        console.log('done loading libraries');
        flotGraph();
    });
    
  
}
