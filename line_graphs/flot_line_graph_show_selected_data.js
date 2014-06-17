/**
 * Example Exosite Custom Widget - Flot line graph
 * http://www.flotcharts.org/
 * @version 1
 */

// select one or more data sources from the list above to view this demo.
function(container, portal)
{
    var timer_id_graphrefersh = 0;
    
    var graph_initialized = false; //only init once
    var widgetid = getWidgetInfo("id");
    var html_graph = "graph";
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
        selection: { mode: "x" },
        grid: { hoverable: true, clickable: true },
        pan: { interactive: false },
        colors: ["#41C4DC","#D5E04D","#FF5847","#FFC647", "#5D409C", "#BF427B" ]
    };

    /*****
    * helper functions 
    *****/
    
    // prints an error message if something fails in the widget.
    function errorMsg(message)
    {
        $("#graph").html(message);    
    }

    // returns a matrix of time and data.
    // set flot to true if returning data for a flot graph.
    
    function flotGraph()
    {
        function initGraph()
        {
            console.log('init graph');
            $("#graph").bind("plotselected", function (event, ranges) {
                // do the zooming
                //console.log('zoom in, stop refresh')
                $.plot($("#graph"), [series],
                        $.extend(true, {}, detailOptions, {
                        xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }       
                }));
            });

            var previousPoint = null;
            $("#graph").bind("plothover", function (event, pos, item) {
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

        if (graph_initialized == false){
            //console.log('init flot');
            initGraph();
            graph_initialized = true;
        }
        
        // JSON FORMAT OF FLOT DATA
        // [{"alias":"alias1","timedata":[[]],"friendly":"friendlyname1"}, {"alias":"alias2","timedata":[[]],"friendly":"friendlyname2"} ]

        //console.log('update graph')
        var series = [];
        for (i = 0; i < portal.clients.length; i++)
        {
            //console.log('getting data for:' + portal.clients[i].alias );
            for (j = 0; j < portal.clients[i].dataports.length; j++)
            {

                var meta = portal.clients[i].dataports[j]['info']['description']['meta'];
                var friendly = portal.clients[i].dataports[j]['info']['description']['name'];
                console.log('got data for: ' + friendly )
                series.push({
                    label: friendly,
                    data: portal.clients[i].dataports[j]['data'],
                    hoverable: true
                });
            }

        }
        // call the Portals 'read' widget API
        for (j = 0; j < portal.dataports.length; j++)
        {

            var meta = portal.dataports[j]['info']['description']['meta'];
            var friendly = portal.dataports[j]['info']['description']['name'];
            console.log('got data for: ' + friendly )
            series.push({
                label: friendly,
                data: portal.dataports[j]['data'],
                hoverable: true
            });
        }

        console.log('check if we have data')
        // if no data, show user message instead of graph
        var nodata = false;
        for (var j = 0; j < series.length-1;  j++ )
        {
            if (0 == series[j]['data'].length) {nodata = true;}
            else {nodata = false;}
        }
        if (nodata == true){
            errorMsg('No data within realtime data time window');
            timer_id_graphrefersh = setTimeout(flotGraph, 2000);
            return;
        }

        //make sure data is in timeseries order
        console.log('sort data')
        for (var j = series.length-1; j >= 0 ; j-- )
        {
            series[j]['data'].sort(function(a,b){return a[0] - b[0]}); //Array now becomes [7, 8, 25, 41]
                                  
            //Change Unix Timestamps to Javascript milliseconds timestamp
            for (var z = 0; z < series[j]['data'].length; z++)
            {
                series[j]['data'][z][0] = series[j]['data'][z][0]*1000;
            }

            // end value (real-time) should be null so graph leading (right) edge stays up to current time
            if (series[j]['data'][series[j]['data'].length-1][0] < current_time){
                //console.log('set leading value to null');
                series[j]['data'].push([current_time,null]);
            }
            /*
            // start value (real-time) should be null so graph historical edge stays up to current time window
            if (time_series_data[j].timedata[0][0] > window_start){
                //console.log('start gap in data');
                time_series_data[j].timedata.splice(0,0,[window_start,null]); 
            }
            */
        }

        //console.log('graphing updated data');
        $.plot($("#graph"), series, detailOptions);

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
            html += '<div id="graphwidget" style="width:90%; height:90%;">';
                html += '<div id="' + html_graph + '" style="margin:20px; width:100%; height:100%; text-align:center;">';
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
