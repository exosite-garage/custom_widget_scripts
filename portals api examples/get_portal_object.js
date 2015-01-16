/*
 * This example shows how to get the portals object for the current portal 
 * using an AJAX call and prints out to the browser console window.
*/

function(container, portal)
{


  function getPortalInfo()
  {
    //GET THE PORTAL IDENTIFIER
    var xmlHttp = null;
    var portal_id = window.location.pathname.split('/')[2]; 

    // GET THE PORTAL OBJECT AND CONVERT INTO JSON OBJECT
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/api/portals/v1/portals/'+portal_id, true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json' );

    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) 
        { 
          //console.log(xmlHttp.responseText); 

          var portal_resources = JSON.parse(xmlHttp.responseText, function (key, value) 
          {
            var type;
            if (value && typeof value === 'object') {
                type = value.type;
                if (typeof type === 'string' && typeof window[type] === 'function') {
                    return new (window[type])(value);
                }
            }
            return value;
          });
          console.log(portal_resources);

        } else { console.error(xmlHttp.statusText); }
      }
    };
    xmlHttp.onerror = function (e) {
      console.error(xmlHttp.statusText);
    };
    xmlHttp.send( null );
  }


  /*****
  * main code path starts here.
  *****/
  console.log('widget container loading/refresh');
  getPortalInfo();


}
