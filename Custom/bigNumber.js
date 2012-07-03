// select one data sources from the list above to view this demo.
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
  else if( resources.length !== 1 )
  {
    errorMsg('Select 1 data source, please.');
    return;
  }

  // show data report
  container.innerHTML = bigNumber( resources );

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


  function bigNumber( resources )
  {
    var output,
        group = $('<div/>'),
        date,
        dateFormat
    ;

    date = new Date( resources[0].data[0][0] * 1000 );
    dateFormat = '';
    dateFormat += date.toLocaleTimeString() + ' ';
    dateFormat += date.toDateString();

    // collect output data
    output =
    {
      time: dateFormat,
      data: resources[0].data[0][1],
      unit: JSON.parse( resources[0].info.description.meta ).datasource.unit
    };

    // create DOM
    group
      .empty()
      .append('<div/>')
      .children('div:last-child')
        .addClass('data')
        .text( output.data )
      .end()
      .append('<div/>')
      .children('div:last-child')
        .addClass('unit')
        .text( output.unit )
      .end()
      .append('<div/>')
      .children('div:last-child')
          .addClass('time')
          .text( output.time );

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
    style = [
             '.bigNumber' + stamp + '{',
             'overflow:hidden;',
             '}',
             '.bigNumber' + stamp + '>.data{',
             'position:absolute;',
             'top:40%;',
             'left:50%;',
             '}',
             '.bigNumber' + stamp + '>.unit{',
             'position:absolute;',
             'bottom:25%;',
             'width:100%;',
             'text-align:center;',
             'visibility:hidden;',
             '}',
             '.bigNumber' + stamp + '>.time{',
             'position:absolute;',
             'bottom:5%;',
             'width:100%;',
             'text-align:center;',
             'visibility:hidden;',
             '}'
            ].join('');

    $('head')
      .append('<style>' + style + '</style>'); 

    container
      .addClass('bigNumber' + stamp );


    // set dynamic CSS
    domMinHW = Math.min( container.height(), container.width() );
    
    $('.bigNumber' + stamp + '>.data')
      .css(
      {
       'font-size': domMinHW * 0.4 + 'px',
       'line-height': domMinHW * 0.4 + 'px'
      } );

    $('.bigNumber' + stamp + '>.unit')
    .css(
     {
      'font-size': domMinHW * 0.15 + 'px',
      'line-height': domMinHW * 0.15 + 'px'
     } );

    $('.bigNumber' + stamp + '>.time')
    .css(
     {
      'font-size': domMinHW * 0.06 + 'px',
      'line-height': domMinHW * 0.06 + 'px'
     } );

    domDataHeight = '-' + container.children('div').eq(0).height() / 2 + 'px';
    domDataWidth = '-' + container.children('div').eq(0).width() / 2 + 'px';

    container
      .children('div')
        .eq(0)
          .css('margin', domDataHeight + ' 0 0 ' + domDataWidth );


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

    cus = new Customer('#5C5D60', '#fff', 'visible');

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

}
