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

  // show data report
  container.innerHTML = dataReport( resources );

  // add event
  $(container)
    .find('span')
    .css(
    {
      'cursor': 'pointer',
      'text-decoration': 'underline'
    } )
    .click( function()
    {
      var str = $(this).attr('title');
      alert( JSON.stringify( JSON.parse( str ), null, '\n' )  );
    } );


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


  function dataReport( resources )
  {
    var i,
        j,
        date,
        dateFormat,
        value,
        unit,
        group,
        output = [],
        data
    ;

    // collect output data
    for( i = 0; i < resources.length; i++ )
    {
      group = {};
      group.alias = resources[i].alias;
      group.data = [];

      for( j = 0; j < resources[i].data.length; j++ )
      {
        date = new Date( resources[i].data[j][0] * 1000 );
        dateFormat = '';
        dateFormat += date.toLocaleTimeString() + ' ';
        dateFormat += date.toDateString();

        value =  resources[i].data[j][1];
        try
        {
          if( typeof JSON.parse( value ) === 'object' )
          {
            value = $('<span/>')
                      .attr('title', value)
                      .text('More data')
            ;
          }
        }
        catch(e)
        {
        }

        unit = JSON.parse( resources[i].info.description.meta ).datasource.unit;

        group.data[j] =
        {
          date: dateFormat,
          value: value,
          unit: unit
        };
        
      }

      output.push( group );
    }


    // create DOM
    group = $('<div/>');

    for( i = 0; i < output.length; i++ )
    {
      // talbe head
      group
        .append('<table/>')
        .children('table:last-child')
          .addClass('blockcontent')
          .css('margin-bottom','1em')
          .append('<caption/>')
          .children('caption:last-child')
            .addClass('caller background')
            .text( output[i].alias )
          .end()
          .append('<thead/>')
          .children('thead:last-child')
            .append('<tr/>')
            .children('tr:last-child')
              .append('<th/>')
              .children('th:last-child')
                .text('Time')
              .end()
              .append('<th/>')
              .children('th:last-child')
                .css('text-align','center')
                .text('value')
              .end()
              .append('<th/>')
              .children('th:last-child')
                .css('text-align','center')
                .text('unit')
              .end()
            .end()
          .end()
          .append('<tbody/>')
      ;

      // table rows
      for( j = 0; j < output[i].data.length; j++ )
      {
        data =  output[i].data[j];
        
        group
          .children('table:last-child')
            .find('tbody:last-child')
              .append('<tr/>')
              .children('tr:last-child')
                .append('<td/>')
                .children('td:last-child')
                  .text( data.date )
                .end()
                .append('<td/>')
                .children('td:last-child')
                  .css('text-align','center')
                  .html( data.value )
                .end()
                .append('<td/>')
                .children('td:last-child')
                  .css('text-align','center')
                  .text( data.unit )
        ;
      }
    }
    return group.html();
  }

}
