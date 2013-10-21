/*****************************************************************************
* textBox.js - Simple Text Box Entry Example for Exosite Portals Custom Widget
* Note:   Edit the resouce variable below to point to the device and
*         datasource you have checked above.
*
* Author: Patrick Barrett - patrickbarrett@exosite.com
*****************************************************************************/

// select one or more data sources from the list above to view this demo.
function( container, portal )
{
  var resource = ["device_alias", "datasource_alias"];

  var message = document.createTextNode("")

  displaySettingsPage(resource);

  // ---- Functions ----
  function clearWidget(){
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
    }
  }

  function displaySettingsPage(resource){
    clearWidget()
    container.appendChild(getSettingsBox(resource))
    //container.appendChild(message)
  }

  function submitSettings(settingsString, resource){
    console.log("Resource: " + resource + " Content: " + settingsString)
    write(resource, settingsString)
      .done(onWriteDone)
      .fail(onWriteFail)
  }
  
  function getLatestDataPoint(resource){
    read(resource, JSON.parse('{"limit":1}'))
      .done(onReadDone)
      .fail(onReadFail)
    ;
  }

  function onReadDone(data){
    var input = document.getElementById("settings_text")
    input.value = data[1];
    disableSubmit(false);
  }
      
  function onReadFail(data){
    var input = document.getElementById("settings_text")
    input.value = "Error: " + data;
    disableSubmit(true);
  }

  function disableSubmit(disabled){
    var subButton = document.getElementById("sub_button")
    subButton.disabled = disabled;
  }

  function getSettingsBox(resource){
    var form = document.createElement('form')
    var title = document.createElement('h3')
    var titleText = document.createTextNode('Set Value for "' + resource[1] + '":')
    var input = document.createElement('input')
    var lineBreak1 = document.createElement('br')
    var lineBreak2 = document.createElement('br')
    var subButton = document.createElement('button')
    var canButton = document.createElement('button')
    var subText = document.createTextNode("Submit")
    var canText = document.createTextNode("Cancel")
    form.onsubmit = (function(resource){return function(){submitSettings(input.value, resource); return false};})(resource);
    input.id = "settings_text"
    input.value = "Loading..."
    subButton.appendChild(subText)
    subButton.id = "sub_button"
    subButton.disabled = true;
    canButton.onclick = function(){displaySettingsPage(resource); return false;}
    canButton.appendChild(canText)
    title.appendChild(titleText)
    title.style.padding = 0;
    title.style.margin = 0;
    form.style.padding = '2em';
    form.appendChild(title)
    form.appendChild(lineBreak1)
    form.appendChild(input)
    form.appendChild(lineBreak2)
    form.appendChild(subButton)
    form.appendChild(canButton)

    getLatestDataPoint(resource);

    return form
  }

  function onWriteDone(data){
    message.nodeValue = "Done: " + data;
    displaySettingsPage(resource)
  }
      
  function onWriteFail(data){
    message.nodeValue = "Error: " + data;
  }
  
}
