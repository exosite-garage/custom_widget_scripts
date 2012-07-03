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

  // set CSS
  setCSS();


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
        output
    ;

    // collect output data
    output = {};
    output.name = 'resources';
    output.children = [];

    for( i = 0; i < resources.length; i++ )
    {
      output.children.push(
      {
        name: resources[i].alias,
        children: formatToJSON( resources[i].data )
      } );
    }

    function formatToJSON( obj )
    {
      var k,
          json,
          output = []
      ;

      for( k in obj )
      {
        if( obj.hasOwnProperty( k ) )
        { 
          json = {};
          json.name = k;

          if( typeof obj[k] === 'object' )
          {
            json.children = formatToJSON( obj[k] );
          }
          else if( typeof obj[k] === 'string' && isNaN( Number( obj[k] ) ) )
          {
            try
            {
               json.children = formatToJSON( JSON.parse( obj[k] ) );
            }
            catch(e)
            {
              lastChild( json,obj[k] );
            }
          }
          else
          {
            lastChild( json,obj[k] );
          }
          output.push( json );
        }
      }
      return output;
    }

    function lastChild( json, k )
    {
      json.children = [];
      json.children[0] = {};
      json.children[0].name = k;
      json.children[0].size = 100;
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
            i
        ;

        for ( i = 0 ; i < length; i++ )
        {
            deferreds.push( getScript( resources[ i ], handler ) );
        }

        jQuery.when.apply( null, deferreds ).then( function()
        {
            callback && callback();
        } );
      };
    } )( $myScript );
    
    // d3 chart
    var scripts = [];
    scripts.push('http://d3js.org/d3.v2.js');
    scripts.push('http://mbostock.github.com/d3/talk/20111018/d3/d3.layout.js');

    $myScript.getScript( scripts, function( data, textStatus )
    {
      var w = container.clientWidth,
          h = container.clientHeight,
          x = d3.scale.linear().range([0, w]),
          y = d3.scale.linear().range([0, h])
      ;

      var vis =
      d3
        .select( container )
        .html('')
          .append('div')
          .attr('class', 'chart')
          .style('width', w + 'px')
          .style('height', h + 'px')
            .append('svg:svg')
            .attr('width', w)
            .attr('height', h)
      ;

      var partition = d3.layout.partition().value( function(d)
      {
          return d.size;
      } );

      root = output;

      var g =
      vis
        .selectAll('g')
        .data( partition.nodes( root ) )
        .enter()
          .append('svg:g')
          .attr('transform', function(d)
          {
            return 'translate(' + x(d.y) + ',' + y(d.x) + ')';
          } ).on('click', click )
      ;

      var kx = w / root.dx,
          ky = h / 1
      ;

      g
        .append('svg:rect')
        .attr('width', root.dy * kx )
        .attr('height', function(d)
        {
          return d.dx * ky;
        } )
        .attr('class', function(d)
        {
          return d.children ? 'parent' : 'child';
        } );

      g
        .append('svg:text')
        .attr('transform', transform )
        .attr('dy', '.35em')
        .style('opacity', function(d)
        {
          return d.dx * ky > 12 ? 1 : 0;
        } )
        .text( function(d)
        {
          return d.name;
        } )
      ;

      d3
        .select( container )
        .on('click', function()
        {
          click(root);
        } )
      ;


      function click(d)
      {
        if( !d.children )
        {
          return;
        }

        kx = (d.y ? w - 40 : w) / (1 - d.y);
        ky = h / d.dx;
        x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
        y.domain([d.x, d.x + d.dx]);

        var t =
        g
          .transition()
          .duration( d3.event.altKey ? 7500 : 750 )
          .attr('transform', function(d)
          {
            return 'translate(' + x(d.y) + ',' + y(d.x) + ')';
          } )
        ;

        t
          .select('rect')
          .attr('width', d.dy * kx )
          .attr('height', function(d)
          {
            return d.dx * ky;
          } )
        ;

        t
          .select('text')
          .attr('transform', transform )
          .style('opacity', function(d)
          {
            return d.dx * ky > 12 ? 1 : 0;
          } )
        ;

        d3
          .event
          .stopPropagation()
        ;
      }

      function transform(d)
      {
          return 'translate(8,' + d.dx * ky / 2 + ')';
      }

    } );
  }


  function setCSS()
  {
    var style,
        i,
        check = false
    ;

    style = [
              '.d3LayoutPartition{',
              'overflow:hidden !important;',
              '}',
              '.d3LayoutPartition .chart{',
              'dispaly:block;',
              'margin:auto;',
              'font-size:1em;',
              'fill:#F7F7F7;',
              '}',
              '.d3LayoutPartition rect{',
              'stroke:#e5e6e6;',
              'fill-opacity:.8;',
              '}',
              '.d3LayoutPartition rect.parent:hover{',
              'fill:#B1E1EA;',
              '}',
              '.d3LayoutPartition rect.parent{',
              'cursor:pointer;',
              'fill:#E6E6E6;',
              'stroke:#ddd;',
              '}',
              '.d3LayoutPartition text{',
              'pointer-events:none;',
              'fill:#5C5D60;',
              '}'
            ].join('');
    
    for( i = 0; i < $('style').length; i++ )
    {
      if( $('style').eq(i).html().match('.d3LayoutPartition') !== null )
      {
        check = true;
      }
    }

    if( !check )
    {
      $('head')
        .append('<style>' + style + '</style>');
    }

    container.setAttribute('class', 'd3LayoutPartition');
  }
}
