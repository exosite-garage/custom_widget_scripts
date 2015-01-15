function(container, portal)
{
  var widgetid = getWidgetInfo("id");
  var html_widget = "widget" + String(widgetid);
  var html_widget_element = "#"+html_widget+"";
  console.log("html element: " + html_widget);
  var widget_div = 'div_widget'+ String(widgetid);
  var deviceTable;

  
  //contains a list of domain dashboards for specific client models (when user clicks on a device, where do you want them to go)
  var client_model_dashboards = { 'dev1_v1': '1546163025'};
  //array of devices in the portal
  var portal_device_list = [];
  //available indicator graphics in portals
  var GREEN_LED = '/static/png/indicator_green_lamp.png';
  var RED_LED = '/static/png/indicator_red_lamp.png';
  var GREY_LED = '/static/png/indicator_grey_lamp.png';

  function get_current_portal()
  {
    return window.location.pathname.split('/')[2];
  }

  function get_portal_device_list(portal_id)
  {
      // GET A LIST OF DEVICES OWNED BY THIS PORTAL
      xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", '/api/portals/v1/portals/'+portal_id, true );
      xmlHttp.setRequestHeader( 'Content-Type', 'application/json' );

      xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status === 200) {
            //console.log(xmlHttp.responseText);
            
            var json_response = xmlHttp.responseText;

            var portal_resources = JSON.parse(json_response, function (key, value) 
            {
              var type;
              if (value && typeof value === 'object') {
                  type = value.type;
                  if (typeof type === 'string' && typeof window[type] === 'function') {
                      return new (window[type])(value);
                  }
              }
              return value;
            });
            
            portal_device_list = portal_resources['devices'];
            //console.log(portal_device_list);
            publish('updated_device_list');
            //timer_id_refreshDeviceList = setTimeout(refreshDeviceList, 5000);

          } else { console.error(xmlHttp.statusText); }
        }
      };
      xmlHttp.onerror = function (e) {
        console.error(xmlHttp.statusText);
        return null;
      };
      xmlHttp.send( null );

  }

  function load_data()
  {
    var portal_id = get_current_portal();
    //console.log('portal_id: '+String(portal_id));
    get_portal_device_list(portal_id);

  }
  function setInitialView() 
  {
      var html = "";
      console.log('set initial view');

      html += '<div id=\"' +widget_div+ '\" style=\"width:95%; height:95%;\">';
          html += '<div id=\"' + html_widget + '\" style=\"margin-top:18px; margin-left:15px; line-height: 1.0em; font-size:0.8em; width:100%; height:100%; text-align:left; position:relative\">';
          html += 'loading device information...';
          html += '</div>';
      html += '</div>';

      $(container).html(html);
      
  }

  setInitialView();

  //wait until we have the device list to populate the table
  subscribe('updated_device_list',function() {
    console.log('call get all device info');

    deviceTable = $('#device_table').dataTable( {
          "bJQueryUI": false,
          "ajax": {'url':'/api/portals/v1/users/_this/devices/['+String(portal_device_list)+']', 'dataSrc':''},
          "columns": [
              { "data": "rid","title": "RID","visible": false },
              { "data": "info.description.name","title": "Name" },
              { "data": "vendor", "title": "Vendor","visible": false  },
              { "data": "model", "title": "Model", "class": "center" },
              { "data": "sn", "title": "Identifier", "class": "center" },
              { "data": null, "title": "Online", "class": "center","defaultContent": "unknown", 
                  "render": function ( data, type, row ) {
                  return '<img src="' +GREY_LED+'" style="vertical-align:middle"/> Unknown';
                  //return data +' ('+ row[3]+')';
                  }
              },
              { "data": "info.basic.status", "title": "Provision State", "class": "center" , 
                  "render": function ( data, type, row ) {
                    if (data == 'activated'){
                      return '<img src="' +GREEN_LED+'" style="vertical-align:middle"/> Activated';
                    } else if (data == 'notactivated'){
                      return '<img src="' +RED_LED+'" style="vertical-align:middle"/> Not Activated';
                    } else {return '<img src="' +GREY_LED+'" style="vertical-align:middle"/> Unknown';}
                    //return data +' ('+ row[3]+')';
                  }
              },
              { "data": null, "title": "Condition", "class": "center" , 
                  "render": function ( data, type, row ) {
                    return '<img src="' +GREY_LED+'" style="vertical-align:middle"/> Unknown';
                  }
              }
          ],
          "scrollY":        "400px",
          "scrollCollapse": false,
          "paging":         false
      } ); 

      //handle row clicks
      $('#device_table tbody').on('click', 'tr', function () {
          var name = $('td', this).eq(0).text();
          var position = deviceTable.fnGetPosition(this); // getting the clicked row position
          var device_rid = deviceTable.fnGetData(position)['rid']; // getting the value of the first (invisible) column
          //console.log('rid: '+ device_rid);
          var model = deviceTable.fnGetData(position)['model'];
          //console.log('client model id: '+ model);
          //console.log('dashboard id: ' + client_model_dashboards[model]);
          if(client_model_dashboards[model] == null)
          {console.log('You selected ' + name +' - which does not have a dashboard link at this time');}
          else
          {
              pathArray = window.location.pathname.split( '/' );
              newURL = window.location.protocol + "//" + window.location.host + "/"+pathArray[1]+'/'+pathArray[2]+'/'+client_model_dashboards[model]+'?devicerid=' + device_rid;
              location.href = newURL; //redirect
          }
        } );

      }
    );

    jQuery(document).ready(function() {
      var cssPath = '//cdn.datatables.net/1.10.4/css/jquery.dataTables.css';
      var cssNode = document.createElement('link');
      cssNode.type = 'text/css';
      cssNode.rel = 'stylesheet';
      cssNode.href = cssPath;
      cssNode.media = 'screen';
      cssNode.title = 'dynamicLoadedSheet';
      document.getElementsByTagName("head")[0].appendChild(cssNode);
    } );

    $.when.apply($, [
        $.getScript("https://code.jquery.com/jquery-1.11.1.min.js"),
        $.getScript("https://cdn.datatables.net/1.10.4/js/jquery.dataTables.min.js")

    ]).done(function() {
        console.log('done loading libraries');
        load_data();
         $(html_widget_element).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="device_table"></table>' );
        
    });

}

