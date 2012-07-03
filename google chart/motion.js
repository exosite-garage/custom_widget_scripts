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
        group
    ;

    // collect output data
    for( i = 0; i < resources.length; i++ )
    {
      for( j = 0; j < resources[i].data.length; j++ )
      { 
        group = [];
        group[0] = resources[i].alias;
        group[1] = new Date( resources[i].data[j][0] * 1000 );

        try
        {
          group[2] = Number( resources[i].data[j][1] );
        }
        catch(e)
        {
          group[2] = 0;
        }

        group[3] = group[0];

        output.push( group );
      }
    }

    // draw google chart
    google.load( 'visualization', '1',
    {
      packages: ['motionChart'],
      callback: drawVisualization
    } );

    function drawVisualization() {
      var data = new google.visualization.DataTable(),
          motionchart = new google.visualization.MotionChart( container ),
          option =
          {
            'width': container.clientWidth,
            'height': container.clientHeight
          };

      data.addColumn('string', 'Data Resource');
      data.addColumn('date', 'Date');
      data.addColumn('number', 'Value');
      data.addColumn('string', 'Data Resource');
      data.addRows( output );

      motionchart.draw( data, option );
    }
  }
}
