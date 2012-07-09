/* 
     you need to first create an On/Off Switch widget,

     and add this script to your Custom widget,

     then you can click On/Off Switch title to slide button

  -- this example is to only show how to control other widgets, your data will not be updated -- 
*/
function( container, portal )
{
  var obj = $('.Switch');

  if( obj.length < 1 )
  {
    errorMsg('You need create On/Off Switch widget before this widget.');
    return;
  }
  
  setSwitch( obj );
  
  showInfo( $(container) );



  /*-- functions --*/
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


  function setSwitch()
  {
    var move;

    obj
      .children( 'button' )
        .css('position','relative')
          .children( 'img' ) 
            .css(
            {
              'position': 'absolute',
              'top': '0',
              'left': '0px'
            } )
    ;
    
    obj
      .children('h3')
        .css('cursor','pointer')
        .click( function()
        {
          if( obj.find('img').css('left') === '0px' )
          {
            move = '110px';
          }
          else
          {
            move = '0px';
          }

          obj
            .find('img')
              .animate(
              {
                left: move
              }, 'fast');
        } )
    ;
  }


  function showInfo( container )
  {
    container
      .empty()
      .css(
      {
        'margin': '0 2em'
      } )
      .append('<h3/>')
      .children('h3')
        .append('<strong/>')
        .children('strong')
          .text('Now you can try to click Switch widget title.')
        .end()
      .end()
      .append('<p/>')
      .children('p')
        .text( 'You have ' + obj.length + ' Switch widget.' );
  }
}
