/*
  This example reference widget will show a slider in the widget window for each dataport selected in the Widget Edit Options.  
  When you move the slider, it will show the value on the screen and attempt to write the value to the Exosite dataport.  
  It will also write a message at the bottom to signify if it was able to successfully write the value.

 global 
  jQuery:false,
  $:false,
  getWidgetInfo:false,
  write:false
 */

function(container, portal) {
  "use strict";

  var option = {
    min: 0,
    max: 100,
    //darg step
    increment: 1,
    //show tick's gap
    label: 10,
    //if true let label number <=10
    autoLabel: true,
  };

  var html = "",
    htmlWidget = "",
    dataports,
    jq110,
    widgetInfo = getWidgetInfo("id").toString();

  html += "<link rel='stylesheet' href='//code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css'>";
  html += "<style type='text/css'>.ui-spinner{width: 4em;}.slibertable{display:table;border-spacing:2px;}.tr{ display: table-row;}.td{display: table-cell;}/*https://github.com/bseth99/jquery-ui-extensions*/.ui-slider-wrapper{position:relative}.ui-slider-wrapper .ui-slider-horizontal{width:100%}.ui-slider-labels{position:absolute;border:1px solid transparent}.ui-slider-label-ticks{border:1px solid transparent;position:absolute;white-space:nowrap}.ui-slider-label-ticks span{font-size:.9em;min-width:1.2em}.ui-slider-wrapper.horizontal{height:3em}.horizontal .ui-slider-labels{left:0;right:0;top:.7em}.horizontal .ui-slider-label-ticks{width:1.2em;height:.8em;text-align:center;border-left:1px solid #999}.horizontal .ui-slider-label-ticks span{position:relative;display:inline-block;margin-left:-1.2em;top:.8em}.ui-slider-wrapper.vertical{width:4.5em}.vertical .ui-slider-labels{top:1px;bottom:0;left:.7em}.vertical .ui-slider-label-ticks{height:1.2em;width:.8em;border-bottom:1px solid #999}.vertical .ui-slider-label-ticks span{position:relative;display:inline-block;margin-left:1em;top:.6em}</style>";
  html += $("#divwidget" + widgetInfo).width() < 230 ? "<style type='text/css'>.ui-slider-handle{width:1.0em !important;height:1.0em !important;top:-.2em !important;}.ui-slider-horizontal{height:.7em  !important;}.ui-slider-label-ticks span{font-size:.7em !important; margin-left: -1.6em !important;}</style>" : "";
  html += "<div id='showmsg" + widgetInfo + "'></div>";
  html += "<div id='sliderWidgetDiv" + widgetInfo + "'></div>";

  if (container.innerHTML === "") {
    container.innerHTML = html;
  }

  $("#divwidget" + widgetInfo).children().css("overflow-x", "hidden");

  if (portal.clients.length === 0) {
    showBigErrorMsg("Please select a data source from the edit page.");
    return false;
  }

  dataports = getDataports("", portal);

  $.when(
    $.ajax({
      url: "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js",
      dataType: "script",
      cache: true
    })
  ).done(function() {
    $.ajax({
      url: "//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js",
      dataType: "script",
      cache: true
    }).done(function() {
      jq110 = jQuery.noConflict(true);
      window.jq110 = jq110;

      //Copyright (c) 2012 Ben Olson (https://github.com/bseth99/jquery-ui-extensions)
      //jQuery UI LabeledSlider @VERSION
      /* jshint ignore:start */
      (function(a, b) {
        a.widget("ui.labeledslider", a.ui.slider, {
          version: "@VERSION",
          options: {
            tickInterval: 0,
            tweenLabels: true,
            tickLabels: null,
            tickArray: []
          },
          uiSlider: null,
          tickInterval: 0,
          tweenLabels: true,
          _create: function() {
            this._detectOrientation();
            this.uiSlider = this.element.wrap("<div class='ui-slider-wrapper ui-widget'></div>").before("<div class='ui-slider-labels'>").parent().addClass(this.orientation).css("font-size", this.element.css("font-size"));
            this._super();
            this.element.removeClass("ui-widget");
            this._alignWithStep();
            if (this.orientation == "horizontal") {
              //this.uiSlider.width(this.element.width())
            } else {
              this.uiSlider.height(this.element.height())
            }
            this._drawLabels()
          },
          _drawLabels: function() {
            var j = this.options.tickLabels || {}, f = this.uiSlider.children(".ui-slider-labels"),
              e = this.orientation == "horizontal" ? "left" : "bottom",
              g = this.options.min,
              l = this.options.max,
              k = this.tickInterval,
              d = (l - g) / k,
              c = this.options.tickArray,
              h = 0;
            f.html("");
            if (c.length > 0) {
              for (h = 0; h < c.length; h++) {
                var m = j[c[h]];
                m = m ? m : c[h];
                a("<div>").addClass("ui-slider-label-ticks").css(e, (Math.round((c[h] - g) / d * 10000) / 100) + "%").html("<span>" + m + "</span>").appendTo(f)
              }
            } else {
              for (; h <= d; h++) {
                a("<div>").addClass("ui-slider-label-ticks").css(e, (Math.round(h / d * 10000) / 100) + "%").html("<span>" + (j[h * k + g] ? j[h * k + g] : (this.options.tweenLabels ? h * k + g : "")) + "</span>").appendTo(f)
              }
            }
          },
          _setOption: function(c, d) {
            this._super(c, d);
            switch (c) {
              case "tickInterval":
              case "tickLabels":
              case "tickArray":
              case "min":
              case "max":
              case "step":
                this._alignWithStep();
                this._drawLabels();
                break;
              case "orientation":
                this.element.removeClass("horizontal vertical").addClass(this.orientation);
                this._drawLabels();
                break
            }
          },
          _alignWithStep: function() {
            if (this.options.tickInterval < this.options.step) {
              this.tickInterval = this.options.step
            } else {
              this.tickInterval = this.options.tickInterval
            }
          },
          _destroy: function() {
            this._super();
            this.uiSlider.replaceWith(this.element)
          },
          widget: function() {
            return this.uiSlider
          }
        })
      }(jq110));
      /* jshint ignore:end */

      for (var index in dataports) {
        htmlWidget = "<div id=" + dataports[index].alias.toString() + widgetInfo + "></div>";
        jq110("#sliderWidgetDiv" + widgetInfo).append(htmlWidget);

        createSlider(dataports[index].alias, dataports[index]);

        if (dataports[index].noAlias === true || isNumber(dataports[index].data[0][1]) === false) {
          jq110("#slider" + dataports[index].alias + widgetInfo).labeledslider("disable");
        }

      }

      function createSlider(data_alias, dataport) {
        var range,
          slidername,
          html = "";

        slidername = data_alias.toString() + widgetInfo;

        if ($("#divwidget" + widgetInfo).width() > 230) {
          html += portal.clients.length === 1 ? "<div style='width: 90%;margin:auto;padding:20px 0 0 0; height:1.5em'>" : "<div style='width: 90%;margin:5px auto;padding:2px 0 0 0; height:1.5em'>";
          html += "<span id='deviceName" + slidername + "' style='width:100%;line-height: 1em;font-size:smaller '></span>";
          html += "<span id='sliderValue" + slidername + "' style='font-size: 1.5em;position: absolute; right:0%;color:#69B1B9' ></span>";
          html += " </div>";
          html += " <div style='width:90%;margin:5px auto;text-align: center;'>";
          html += "   <div id='slider" + slidername + "'></div>";
          html += " </div>";
        } else {
          html += "<div style='width: 90%;margin:5px auto;height:2em'>";
          html += "<span id='deviceName" + slidername + "' style='line-height: 1em;font-size:smaller'></span>";
          html += " </div>";
          html += " <div style='width:90%;margin:5px auto;text-align: center;'>";
          html += "   <div id='slider" + slidername + "'></div>";
          html += "<div id='sliderValue" + slidername + "' style='font-size: 2em;color:#69B1B9' ></div>";
          html += " </div>";
        }

        jq110("#" + slidername).html(html);

        jq110("#sliderValue" + slidername).text(dataports[data_alias].data[0][1]);

        shwoDeviceName(portal);

        var $sliderWidget = jq110("#slider" + slidername).labeledslider({
          min: option.min,
          max: option.max,
          step: option.step,
          tickInterval: option.tickInterval,
          value: dataport.data[0][1],
          slide: function(event, ui) {
            jq110("#sliderValue" + slidername).text(ui.value);
          },
          stop: function(event, ui) {
            jq110(this).labeledslider("disable");
            write(dataport.path, ui.value).done(function() {
              jq110("#slider" + slidername).labeledslider("enable");
              showMsg("Wrote data successfully.", "green");
            }).fail(function() {
              jq110("#slider" + slidername).labeledslider("enable");
              showMsg("Failed to write data.", "red");
            });
          }
        });

        if (option.autoLabel === true) {
          changeTick();
        }

        function changeTick() {
          range = $sliderWidget.labeledslider("option", "max") - $sliderWidget.labeledslider("option", "min");
          var stepValue = $sliderWidget.labeledslider("option", "min");
          range = range / stepValue > 10 ? Math.floor(range / 10) : stepValue;
          $sliderWidget.labeledslider("option", "tickInterval", range);
        }

        function shwoDeviceName() {
          var deviceName,
            dataName,
            $deviceSpan,
            $dataSpan;
          deviceName = dataport.deviceName;
          dataName = dataport.info.description.name;
          $deviceSpan = jq110("<span>" + deviceName + "&nbsp</sapn>").css("color", "#69B1B9");
          $dataSpan = jq110("<span>" + dataName + "</sapn>").css("font-style", "italic");
          jq110("#deviceName" + slidername).append($deviceSpan).append($dataSpan);
        }
      }
    });
  });

  function getDataports(alias, client) {
    var cx,
      vx,
      dataports = [],
      childDataports,
      childClient;

    dataports = dataports.concat(client.dataports);

    for (cx = 0; cx < dataports.length; cx++) {
      dataports[cx].path = alias !== "" ? [alias] : [];
      dataports[cx].path.push(dataports[cx].alias);
      dataports[cx].deviceName = client.info.description.name;
    }

    if (client.clients === undefined) {
      return dataports;
    }

    for (cx = 0; cx < client.clients.length; cx++) {
      childClient = client.clients[cx];
      childDataports = getDataports(childClient.alias, childClient);
      for (vx = 0; vx < childDataports.length; vx++) {
        childDataports[vx] = checkAlias(childDataports[vx]);

        if (childDataports[vx].data.length === 0) {
          showMsg("A selected dataport is empty.", "red");
          //break;
        }
        else{
          dataports[childDataports[vx].alias] = childDataports[vx];
        }
      }
    }
    return dataports;
  }

  function showMsg(message, color, time) {
    var bgcolors = {
      green: "#4DA74D",
      red: "#A91E27"
    };
    color = typeof color === "undefined" ? "black" : color;
    color = color === "red" ? bgcolors.red : color;
    color = color === "green" ? bgcolors.green : color;
    time = typeof time === "undefined" ? 3000 : time;
    jQuery("#showmsg" + widgetInfo)
      .text(message)
      .css({
        "color": "white",
        "position": "absolute",
        "background": color,
        "height": "28px",
        "padding-left": "0.5em",
        "padding-right": "0.5em",
        "z-index":999
      })
    //prevent message too long exceed container width
    .css("height", function(index, value) {
      return $(this).width() + 30 >= $(container).width() ? 56 : value;
    })
    .css("top", function() {
      return $(this).width() + 30 >= $(container).width() ? jQuery("#divwidget" + widgetInfo).children().scrollTop() + jQuery("#divwidget" + widgetInfo).height() - 56 : jQuery("#divwidget" + widgetInfo).children().scrollTop() + jQuery("#divwidget" + widgetInfo).height() - 28;
    })
    .show().delay(time).fadeOut();
  }

  function showBigErrorMsg(message) {
    var h3 = document.createElement("h3"),
      strong = document.createElement("strong"),
      p = document.createElement("p");

    container.appendChild(h3);
    h3.appendChild(strong);
    strong.innerHTML = "ERROR:";

    container.appendChild(p);
    p.innerHTML = message;

    container.style.margin = "20px";
    container.style.color = "#a60000";
  }

  function checkAlias(dataport) {
    if (dataport === undefined) {
      showMsg("Please select a data source from the edit page.", "red");
      return dataport;
    } else if (dataport.path[0] === null && dataport.path[1] === null) {
      showMsg("Device " + dataport.deviceName + " and data " + dataport.info.description.name + " has no alias.", "red");
      dataport.alias = dataport.info.description.name;
      dataport.noAlias = true;
      return dataport;
    } else if (dataport.path[0] === null) {
      showMsg(" Device " + dataport.deviceName + " has no alias.", "red");
      dataport.noAlias = true;
      return dataport;
    } else if (dataport.path[1] === null) {
      showMsg("Data " + dataport.info.description.name + " has no alias.", "red");

      dataport.alias = dataport.info.description.name;
      dataport.noAlias = true;
      return dataport;
    }
    return dataport;
  }

  function isNumber(data) {
    if (isNaN(parseFloat(data)) || !isFinite(data)) {
      showMsg("Input type should be Number.", "red");
      return false;
    }
    return true;
  }
}