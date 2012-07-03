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

  // d3 chart
  d3Chart( resources );


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


  function d3Chart( resources )
  {
    var i,
        j,
        output = [],
        arr,
        obj
    ;
    // create DOM
    $(container)
      .empty()
      .css('overflow','hidden')
      .append('<div/>')
      .children('div:last-child')
        .attr('id','chart')
        .append('<button/>')
        .children('button:last-child')
          .attr('id','group')
          .addClass('first')
          .text('Group')
        .end()
        .append('<button/>')
        .children('button:last-child')
          .attr('id','stack')
          .addClass('active')
          .addClass('last')
          .text('Stack')
    ;


    // collect output data
    for( i = 0; i < resources.length; i++ )
    {
      arr = [];
      for( j = 0; j < resources[i].data.length; j++ )
      {
        obj = {};
        obj.x = j;

        obj.y = Number( resources[i].data[j][1] );
        
        if( isNaN( obj.y ) )
        {
          errorMsg('Your data is not a number and will not work with this widget.');
          return;
        }

        try
        {
          obj.y0 = output[i-1][j].y0 + output[i-1][j].y;
        }
        catch(e)
        {
          obj.y0 = 0;
        }

        arr.push( obj );
      }
      output.push( arr );
    }


    //  get multi scripts
    window.$myScript = $.sub();
    ( function( jQuery )
    {
      var getScript = jQuery.getScript;

      jQuery.getScript = function( resources, callback )
      {
        var length = resources.length, 
            handler = function()
            {
              counter++;
            },
            deferreds = [],
            counter = 0, 
            i;

        for( i = 0; i < length; i++ )
        {
            deferreds.push( getScript( resources[ i ], handler ) );
        }

        jQuery.when.apply( null, deferreds ).then(function()
        {
            callback && callback();
        } );
      };
    } )( $myScript );

    var scripts =[];
    scripts.push('http://d3js.org/d3.v2.js');
    scripts.push('http://mbostock.github.com/d3/ex/stream_layers.js');
    
    $myScript.getScript( scripts, function( datas, textStatus )
    {
      var n = resources.length,
          m = resources[0].data.length,
          data = output,
          color = d3.interpolateRgb('#B1E1EA', '#5C5D60');

      var width = container.clientWidth * 0.8,
          height = container.clientHeight * 0.8,
          mx = m,
          my = d3.max( data, function(d)
          {
            return d3.max( d, function(d)
            {
              return d.y0 + d.y;
            } );
          } ),
          mz = d3.max( data, function(d)
          {
            return d3.max( d, function(d)
            {
              return d.y;
            } );
          } ),
          x = function(d)
          {
            return d.x * width / mx;
          },
          y0 = function(d)
          {
            return height - d.y0 * height / my;
          },
          y1 = function(d)
          {
            return height - ( d.y + d.y0 ) * height / my;
          },
          y2 = function(d)
          {
            return d.y * height / mz;
          }; // or `my` to not rescale
      var vis =
      d3
        .select( container )
          .select('#chart')
           .append('svg')
            .attr('width', width )
            .attr('height', height + 20 )
            .style('display','block')
            .style('margin','15px auto 0')
      ;

      var layers =
      vis
        .selectAll('g.layer')
        .data( data )
        .enter()
          .append('g')
          .style('fill', function( d, i )
          {
            if( n === 1 )
            {
              return '#b1e1ea';
            }
            else
            {
              return color( i / ( n - 1 ) );
            }
          })
          .attr('class', 'layer');

      var bars =
      layers
        .selectAll('g.bar')
        .data( function(d)
        {
          return d;
        } )
        .enter()
          .append('g')
          .attr('class', 'bar')
          .attr('transform', function(d)
          {
            return 'translate(' + x(d) + ',0)';
          } )
      ;

      bars
        .append('rect')
        .attr('width', x(
        {
          x: 0.9
        } ) )
        .attr('x', 0)
        .attr('y', height)
        .attr('height', 0)
        .transition()
        .delay( function(d, i)
        {
          return i * 10;
        } )
        .attr('y', y1)
        .attr('height', function(d)
        {
          return y0(d) - y1(d);
        } )
      ;

      var labels =
      vis
        .selectAll('text.label')
        .data( data[0] )
        .enter()
          .append('text')
          .style('fill','#5C5D60')
          .attr('class', 'label')
          .attr('x', x)
          .attr('y', height + 6)
          .attr('dx', x(
          {
            x: 0.45
          } ) )
          .attr('dy', '.71em')
          .attr('text-anchor', 'middle')
          .text(function(d, i)
          {
            return i;
          } )
        ;

      vis
        .append('line')
        .attr('x1', 0)
        .attr('x2', width - x(
        {
          x: 0.1
        } ) )
        .attr('y1', height)
        .attr('y2', height)
      ;

      d3
        .select( container )
          .select('#chart')
            .select('#group')
            .on('click', transitionGroup );
      d3
        .select( container )
          .select('#chart')
            .select('#stack')
            .on('click', transitionStack );

      function transitionGroup()
      {
        var group = d3.select( container ).select('#chart');

        group.select('#group').attr('class', 'first active');

        group.select('#stack').attr('class', 'last');

        group
          .selectAll('g.layer rect')
          .transition()
          .duration( 500 )
          .delay( function( d, i )
          {
            return (i % m) * 10;
          } )
          .attr('x', function( d, i )
          {
            return x(
            {
                x: 0.9 * ~~ (i / m) / n
            } );
          } )
          .attr('width', x(
          {
            x: 0.9 / n
          } ) )
          .each('end', transitionEnd )
        ;

        function transitionEnd()
        {
          d3
            .select( this )
            .transition()
            .duration( 500 )
            .attr('y', function(d)
            {
              return height - y2( d );
            } )
            .attr('height', y2 )
          ;
        }
      }

      function transitionStack()
      {
        var stack = d3.select( container ).select('#chart');

        stack.select('#group').attr('class', 'first');

        stack.select('#stack').attr('class', 'last active');

        stack
          .selectAll('g.layer rect')
          .transition()
          .duration( 500 ).
          delay( function( d, i )
          {
            return (i % m) * 10;
          } )
          .attr('y', y1 )
          .attr('height', function(d)
          {
            return y0(d) - y1(d);
          } )
          .each('end', transitionEnd )
        ;

        function transitionEnd()
        {
          d3
            .select( this )
            .transition()
            .duration( 500 )
            .attr('x', 0 )
            .attr('width', x(
            {
              x: 0.9
            } ) )
          ;
        }
      }
    } );
  }
}
