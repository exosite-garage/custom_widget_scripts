// select one or more data sources from the list above to view this demo.
function( container, portal )
{
  var resources = [],
      output = [],
      i,
      dsi;
      
  var date,
      dateFormat,
      unit;

  container = $(container);

  // collect data sources for easy iteration.
  resources = resources.concat( portal.dataports );
  for( i = 0; i < portal.clients.length; i++ )
  {
    resources = resources.concat( portal.clients[i].dataports );
  }

  // return if no data sources are selected.
  if( !resources.length )
  {
    errorMsg('Please select a data source from the edit page.');
    return;
  }


  // collect output data
  for( dsi = 0; dsi < resources.length; dsi++ )
  {
    output[dsi] = [];
    for( i = 0; i < resources[dsi].data.length; i++ )
    {
      date = new Date( resources[dsi].data[i][0] * 1000 );
      dateFormat = '';
      dateFormat += date.toLocaleTimeString() + ' ';
      dateFormat += date.toDateString();

      unit = JSON.parse( resources[dsi].info.description.meta ).datasource.unit;

      output[dsi][i] = [];
      output[dsi][i][0] = resources[dsi].alias;
      output[dsi][i][1] = dateFormat;
      output[dsi][i][2] = String( resources[dsi].data[i][1] ) + ' ' + unit;
    }
  }


  output=[];
  output.push(
              ['Name', 'Manager', 'Tooltip'],
              ['Mike', null, 'The President'],
              ['Jim', 'Mike', null],
              ['Alice', 'Mike', null],
              ['Bob', 'Jim', 'Bob Sponge'],
              ['Carol', 'Bob', null]
            );

  // google chart
  google.load('visualization', '1', {packages: ['orgchart'],callback:drawVisualization});
  function drawVisualization()
  {
    // Create and populate the data table.
    var data = google.visualization.arrayToDataTable( output );
        
    // Create and draw the visualization.
    new google.visualization.OrgChart( container.get(0) ).
    draw(data, {allowHtml: true});
  }
   

  // error message
  function errorMsg( msg )
  {
    container
    .empty()
    .css(
         {
          'margin':'0 2em',
          'color':'#a60000'
         }
        )
    .append('<h3/>')
      .children('h3')
      .append('<strong/>')
        .children('strong')
        .text('ERROR:')
      .end()
    .end()
    .append('<p/>')
      .children('p')
      .text( msg );
  }
}
