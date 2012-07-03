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

  // set CSS
  container.style.overflow = 'hidden';


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
        output = [],
        date,
        dateFormat,
        sum
    ;

    // collect output data
    for( i = 0; i < resources[0].data.length; i++ )
    {
      date = new Date( resources[0].data[i][0] * 1000 );
      dateFormat = '';
      dateFormat += date.toLocaleTimeString() + ' ';
      dateFormat += date.toDateString();

      output[i] = [];
      output[i][0] = dateFormat;

      for( j = 0; j < resources.length; j++ )
      {
        try
        {
          output[i][j+1] = Number( resources[j].data[i][1] );
        }
        catch(e)
        {
          output[i][j+1] = 0;
        }
      }
    }

    for( i = 0; i < output.length; i++ )
    {
      sum = 0;

      for( j = 1; j < output[i].length; j++ )
      {
        sum += output[i][j];
      }
      output[i].push( sum / resources.length );
    }

    //  draw google chart
    google.load( 'visualization', '1',
    {
      packages: ['corechart'],
      callback: drawChart
    } );

    function drawChart() 
    {
      var data = new google.visualization.DataTable(),
          chart = new google.visualization.ComboChart( container ),
          len = output[0].length - 2,
          options =
          {
            title: 'Combo Chart',
            vAxis: 
            {
              title: 'Value'
            },
            hAxis:
            {
              title: 'Time'
            },
            seriesType: 'bars'
          }
       ;

      options.series = {};
      options.series[len] = {};
      options.series[len].type = 'area';

      data.addColumn('string', 'Time');

      for( i = 0; i < resources.length; i++ )
      {
        data.addColumn('number', resources[i].alias );
      }      

      data.addColumn('number', 'Average');
      data.addRows( output.reverse() );
      
      chart.draw( data, options );
    }
  }
}
