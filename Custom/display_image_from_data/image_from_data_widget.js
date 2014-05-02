/**
 * Example Exosite Custom Widget - Base64 encoded image Widget
 * 
 * This widget will check for new data point and if found display it as an image
 * Assumption is that the image is a jpg and was base64 encoded before writing 
 * to an Exosite dataport.
 * 
 * To Use: Add a Custom Widget to your Exosite Portals dashboard and insert this code.
 * 
 * Notes:
 * 1. The custom widget options should only select on dataport, otherwise 
 *    it will only get the first dataport.  
 * 
 * 2. Set custom widget refresh to 0.  This widget will refresh data itself
 * 
 */

// select one or more data sources from the list above to view this demo.
function(container, portal)
{
    var REFRESH_LIMIT = 60*60; // number of times to refresh data from Exosite before stopping
    var REFRESH_DATA_INTERVAL = 1000; //milliseconds
    
    var last_time = 0;
    var times_to_refresh = 0; //counter for number of times refreshed
    var last_value_time = 0;
    var timer_id_datarefersh = 0;

    /*****
    * helper functions 
    *****/
    

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


    function upateImage(data)
    {
      //var base64Data = Base64.decode(data);
      //console.log(data)
      $('#my-image').attr('src', 'data:image/jpeg;base64,' + data); 
    }

    // returns a matrix of time and data.
    // set flot to true if returning data for a flot graph.
    function getData()
    {
        
        var timestamp;
        var k;
        var newData = [];

        var current_time = (new Date).getTime() / 1000;

        //since data has resolution of 1 sec min, don't check until a second has passed
        if (last_time >= parseInt(current_time) && times_to_refresh < REFRESH_LIMIT){
            timer_id_datarefersh = setTimeout(getData, REFRESH_DATA_INTERVAL);
            return;
        }

        //console.log('current time: '+current_time);
        times_to_refresh++

        //Only want the latest value
        var read_options = {
          starttime: 0,                           // from beginning of time
          endtime: parseInt(current_time),        // to right now
          limit: 1,                              // just get last point
          sort: "desc"                           // latest point
        };

        var starttime = timeConverter(read_options.starttime);
        var endtime = timeConverter(read_options.endtime);
        console.log('getting data: ' + starttime + ' to ' + endtime);

        read([portal.clients[0].alias, portal.clients[0].dataports[0].alias], read_options)
          .done(function() {
            newData = arguments;
            //console.log('exo returned values: '+newData.length);

            // There should only be one value for this widget based on read option
            for (k = 0; k < newData.length; k++)
            {
                timestamp = Number(newData[k][0]);

                if ( timestamp > last_value_time)
                {   
                    console.log('new image:'+timestamp)
                    last_value_time = timestamp;
                    upateImage(String(newData[k][1]));
                }
                else {
                    console.log('no new image:'+timestamp);
                    ;
                } 
            }

            if (newData.length == 0){
                console.log('no data available!');
            }
            last_time = read_options.endtime; 

            if(times_to_refresh < REFRESH_LIMIT){
                //console.log('reschdule Exosite read')
                timer_id_datarefersh = setTimeout(getData, REFRESH_DATA_INTERVAL);
            }

          })
          .fail(function() {
            console.log('error getting data');
            if(times_to_refresh < REFRESH_LIMIT){
                //console.log('reschdule Exosite read')
                timer_id_datarefersh = setTimeout(getData, 3000);
            }
          });

        return ;
    }

    function setInitialView() 
    {
        var html = "";
        console.log('set initial view');

        html += '<div id="imagewidget" >';
        html +=  '<img id="my-image" style="width: 100%;max-height: 100%"/>'
        html += '</div>';

        $(container).html(html);
    }

    function errorMsg(msg)
    {
        var html = "";

        html += '<div id="message" >';
        html +=  '<p>' + msg + '</p>';
        html += '</div>';

        $(container).html(html);

    }

    /*****
    * main code path starts here.
    *****/

    if (portal.clients.length == 0 )
    {
        console.log('no dataport selected');
        errorMsg('no data port selected');
        return;
    }
    if (portal.clients[0].dataports.length == 0)
    {
        console.log('no dataport selected');
        errorMsg('no data port selected');
        return;
    }

    console.log('widget container refresh');

    setInitialView();

    getData(); //start getting data
  
}
