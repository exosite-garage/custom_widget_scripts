 /**
 *  
 * Summary:
 * This widget shows how to use widget 'read' api to read a dataport value quickly and 
 * continously update the HTML container.  This widget is not recommended for applications 
 * when data is reported slowly and millisecond updates are not useful.
 * 
 * Notes:
 * 1) Only works with one data port currently
 * 2) Make sure to set the refresh of the widget configuration window to 0 seconds.
 * 
 */

function(container, portal)
{
    // SETTINGS
    // THIS VARIABLE SETS HOW MUCH TIME HISTORY TO SHOW IN SECONDS

    var REFRESH_LIMIT = 3600; // number of times to refresh getting data, this helps developers with mistakes so browser doesn't crash

    
    //widget variables
    var times_to_refresh = 0; //counter for number of times refreshed
    var timer_id_datarefresh = 0;
    var timer_id_checkagain = 0;
    var last_time_s = 0;
  
    var dataport_friendly_name = '';
    var dataport_units = '';
    var widgetid = getWidgetInfo("id");
    var html_print = "draw" + String(widgetid);
    var printwidget_div = 'printwidget'+ String(widgetid);

    /*****
    * helper functions 
    *****/
    
    // function to call to create errorhandling 
    function errorMsg(message)
    {
        $('#' + html_print).html(message);    
    }

    if (portal.clients.length == 0){
        errorMsg('Please select a data port from the widget options.');
    }

    function timeConverter(UNIX_timestamp){
     var a = new Date(UNIX_timestamp*1000);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var day = days[a.getDay()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     if (min < 10 ){
         min = '0' + min;    
     }
     if (sec < 10 ){
         sec = '0' + sec;    
     }

     var time = hour+':'+min+':'+sec+' '+day+' '+month+' '+date+' '+year;
     return time;
    }

    // returns a single value, timestamped, from Exosite
    function getData()
    {
        
        var timestamp;
        var value;
        var i;
        var j;
        var k;
        var newData = [];
        var found_old_data = false;

        var current_time_s = parseInt((new Date).getTime() / 1000);

        //console.log('current time: '+current_time_s);
        times_to_refresh++
        

        var read_options = {
          starttime: 0, // start of data window
          endtime: current_time_s - 1,  // current time
          limit: 1,                              // how many max points - this is a max limit set by Portals
          sort: "desc"                           // latest point
        };

        //console.log('getting data: ' + timeConverter(read_options.starttime) + ' to ' + timeConverter(read_options.endtime));

        for (i = 0; i < portal.clients.length; i++)
        {
            //console.log('getting data for:' + portal.clients[i].alias );

            // call the Portals 'read' widget API
            for (j = 0; j < portal.clients[i].dataports.length; j++)
            {
                //console.log('getting the value for:' + portal.clients[i].dataports[j].alias);
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
                    console.log('exo returned the value: '+newData.length);
                    for (k = 0; k < newData.length; k++)
                    {
                        //timestamp = Number(newData[k][0]);
                        timestamp = Number(newData[k][0]) * 1000; //Change Unix Timestamps to Javascript milliseconds timestamp
                        if (isNaN(Number(newData[k][1])))
                        {
                            //console.warn('not a number: ' + String(newData[k][1]) + ',skipping' );
                            break;
                        }
                        value = Number(newData[k][1]);
                        console.log('got value: ' + value);
                        var prettyTime = (timestamp/1000);
                        prettyTime = timeConverter(prettyTime);
                        $(container).html(display(value, prettyTime, dataport_units)); // Here is the actual call to the display method
                    }

                    //console.log('done getting data: ' + read_options.starttime + ' to ' + read_options.endtime );

                    last_time_s = read_options.endtime+1; 

                    if(times_to_refresh < REFRESH_LIMIT){
                        //console.log('reschdule Exosite read')
                        timer_id_datarefresh = setTimeout(getData, 500);
                    }

                  })
                  .fail(function() {
                   // console.log('error getting data');
                  });
            }
        }
        return ;
    }


	function display( value, incTime, incUnit)
	  {
	    var output,
		group = $('<div/>'),
		date
	    ;

	    // create DOM
	    group
	      .empty()
	      .append('<div/>')
	      .children('div:last-child')
		.addClass('data')
		.text( value )
	      .end()
	      .append('<div/>')
	      .children('div:last-child')
		.addClass('unit')
		.text( incUnit )
	      .end()
	      .append('<div/>')
	      .children('div:last-child')
		  .addClass('time')
		  .text( incTime );

	    return group.html();
	  }


	  function setCSS()
	  {
	    var style,
		stamp = new Date().getTime(), 
		domMinHW,
		domDataHeight,
		domDataWidth,
		Customer,
		cus
	    ;

	    container = $(container);

	    // set CSS
            //change text size and alignment here
	    style = [
		     '.display' + stamp + '{',
		     'overflow:hidden;',
		     '}',
		     '.display' + stamp + '>.data{',
		     'position:absolute;',
		     'top:35%;',
		     'width:100%;',
                     'font-size:180px;',
                     'text-align:center;',
		     '}',
		     '.display' + stamp + '>.unit{',
		     'position:absolute;',
		     'bottom:25%;',
		     'width:100%;',
                     'font-size:54px;',
		     'text-align:center;',
		     '}',
		     '.display' + stamp + '>.time{',
		     'position:absolute;',
		     'bottom:5%;',
		     'width:100%;',
		     'text-align:center;',
                     'font-size:30px;',
		     '}'
		    ].join('');

	    $('head')
	      .append('<style>' + style + '</style>'); 

	    container
	      .addClass('display' + stamp );


	    // set customer CSS
	    Customer = function ( background, color, visibility )
	    {
	      this.background = background;
	      this.color = color;
	      this.visibility = visibility;
	    };
	    Customer.prototype =
	    {
	      background: '',
	      color: '',
	      visibility: ''
	    };

	    cus = new Customer('#3450E0', '#fff', 'visible');  // set background color here

	    if( cus.background !== '' )
	    {
	      container
		.css('background-color', cus.background );
	    }

	    if( cus.color !== '' )
	    {
	      container
		.css('color', cus.color );
	    }

	    if( cus.visibility !== '' )
	    {
	      container
		.children('div:gt(0)')
		  .css('visibility', cus.visibility );
	    }
	  }



    function setInitialView() 
    {
      	var html = "";
      	//console.log('set initial view');

      	if ( $('#'+printwidget_div).length)
      	{ 
      	    //console.log('found element, no need to recreate');
      	    ;
      	}
      	else
      	{
      	    html += '<div id=\"' +printwidget_div+ '\" style=\"width:95%; height:90%;\">';
      	        html += '<div id=\"' + html_print + '\" class=\"print\" style=\"margin-top:18px; margin-left:15px; width:100%; height:100%; text-align:center; position:relative\">';
      	        html += 'Getting Data Now';
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
    setCSS();

    
    $.when.apply($, [
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.time.min.js"),
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js"),
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.navigate.min.js")
    ]).done(function() {
        getData(); //start getting data
    }); 
}
