// Example widget with timezone conversion. Choose a single dataport to follow. The time
// and value of the latest data point will be printed in the widget

function(container, portal) {
  var html = 'Latest temperature in chosen location: <div id="temperature">loading...</div>';
  html += '<div><a class="reload" href="javascript:void(0);">reload</a></div>';

  function reload() {
    // call the read widget API
    var options = {
      starttime: 1,                          // beginning of epoch
      endtime: (new Date).getTime() / 1000,  // current time
      limit: 1,                              // single point
      sort: "desc"                           // latest point
    };
    try {
       // Get Device Alias
      var client = portal.clients[0];
      // console.log(client)
      device_alias = client.alias;
      // console.log(device_alias)
    }
    catch(err) {
        console.log("YOUR DEVICE MUST HAVE AN ALIAS IN ORDER FOR THE WIDGET API TO WORK.")
    }
    try {
      // Get Dataport Alias
      var dataport = client.dataports[0];
      // console.log(dataport)
      dataport = dataport.alias;
      // console.log(dataport)
    }
    catch(err) {
        console.log("YOUR DATAPORT MUST HAVE AN ALIAS IN ORDER FOR THE WIDGET API TO WORK.")
    }

   read([device_alias, dataport], options)
      .done(function() {
        var data = arguments;
        // update the data.
        var latest_point = data[0];
        var html = latest_point[1] + ' (' + new Date(latest_point[0] * 1000)  + ')';
        $(container).find('div#temperature').html(html);
      })
      .fail(function() {
        $(container).find('span#temperature').html(data);
      });
  } 
  $(container).html(html);
  $(container).find('a.reload').click(function() {
    // read value again when user clicks on "reload" link
    alert("loading!");
    reload();
  });
  // read value when widget loads
  reload();
}