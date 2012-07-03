// select one or more data sources from the list above to view this demo.
function( container, portal )
{
  var resources,
      output
  ;

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
        output = []
    ;

    // collect output data
    for( i = 0; i < resources.length; i++ )
    {
      output[i] = [];
      output[i][0] = String( resources[i].alias );
      output[i][1] = Number( resources[i].data[0][1] );

      if( isNaN( output[i][1] ) )
      {
        errorMsg('Your data is not a number and will not work with this widget.');
        return;
      }
    }

    // draw google chart
    google.load( 'visualization', '1',
    {
      packages: ['gauge'],
      callback: drawChart
    } );

    function drawChart() 
    {
      var data = new google.visualization.DataTable(),
          chart = new google.visualization.Gauge( container ),
          options =
          {
            redFrom: 80,
            redTo: 100,
            yellowFrom: 50,
            yellowTo: 80,
            minorTicks: 5
          };

      data.addColumn('string', 'Label');
      data.addColumn('number', 'Value');
      data.addRows( output );
      
      chart.draw( data, options );
      
      // set CSS after drawChart
      container.style.overflow = 'hidden';
      container.childNodes[0].style.height = '100%';
      container.childNodes[0].style.margin = '0 auto';
    }
  }
}
