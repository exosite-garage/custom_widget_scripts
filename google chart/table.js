// select one or more data sources from the list above to view this demo.
function( container, portal )
{
  var resources;

  // collect data sources for easy iteration.
  resources = collectDataSources( portal );

  // return if no data sources are selected.
  if( !resources.length )
  {
    errorMsg('Please select a data source from the edit page.');
    return;
  }

  // google chart
  googleChart( resources );


  /*-- functions --*/
  function collectDataSources( portal )
  {
    var resources = [],
        i
    ;

    resources = resources.concat( portal.dataports );
    for( i = 0; i < portal.clients.length; i++ )
    {
      resources = resources.concat( portal.clients[i].dataports );
    }

    return resources;
  }
  
  
  function errorMsg( message )
  {
    var h3 = document.createElement('h3'),
        strong = document.createElement('strong'),
        p = document.createElement('p')
    ;

    container.appendChild( h3 );
    h3.appendChild( strong );
    strong.innerHTML = 'ERROR:';

    container.appendChild( p );
    p.innerHTML = message;

    container.style.margin = '20px';
    container.style.color = '#a60000';
  }


  function googleChart( resources )
  {
    var i,
        j,
        output = {},
        group,
        date,
        dateFormat,
        unit
    ;
    
    output.cols = [];
    output.rows = [];

    // collect output data
    for( i = 0; i < resources.length; i++ )
    {
      for( j = 0; j < resources[i].data.length; j++ )
      {
        group = [];
        date = new Date( resources[i].data[j][0] * 1000 );
        dateFormat = '';
        dateFormat += date.toLocaleTimeString() + ' ';
        dateFormat += date.toDateString();

        unit = JSON.parse( resources[i].info.description.meta ).datasource.unit;

        group[0] = { v: resources[i].alias };
        group[1] = { v: dateFormat };
        group[2] = { v: String( resources[i].data[j][1] ) + ' ' + unit };

        output.rows.push( { c: group } );
      }
    }

    output.cols.push( { label: 'Data Source', type: 'string' } );
    output.cols.push( { label: 'Time', type: 'string' } );
    output.cols.push( { label: 'Value', type: 'string' } );
    
    // draw google chart
    google.load( 'visualization', '1',
    {
      packages: ['table'],
      callback: drawChart
    } );

    function drawChart() 
    {
      var data = new google.visualization.DataTable( output ),
          chart = new google.visualization.Table( container ),
          options =
          {
            width: '100%',
            height: '100%',
            showRowNumber: true,
            page: 'disable',
            pageSize: 5,
            pagingSymbols:
            {
              prev: 'prev',
              next: 'next'
            },
            pagingButtonsConfiguration: 'auto'

          }
      ;
      chart.draw( data, options );
    }
  }
}
