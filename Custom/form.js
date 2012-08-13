function(container, portal)
{
  var dataports = getDataports("", portal),
      cx,
      buttons,
      styles,
      colors,
      messages;

  styles =
  {
    dl:
    [
      "margin-left: 1em;"
    ],
    div:
    [
      "position: absolute;",
      "bottom: 0;",
      "color: white;",
      "padding-left: 0.5em;",
      "padding-right: 0.5em;"
    ],
    dt:
    [
      "overflow: hidden;",
      "float: left;",
      "width: 9.3em;",
      "text-align: right;",
      "font-size: 84%;"
    ],
    input:
    [
      "margin-left: 1.5em;",
      "margin-right: 0.75em;",
      "width: 9.3em;",
      "color: #5C5D60;",
      "text-align: right;"
    ],
    button:
    [
      "margin: 0;",
      "border: none;",
      "padding: 0;",
      "color: #5C5D60;",
      "background: transparent;",
      "text-decoration: underline;",
      "text-transform: lowercase;",
      "font-size: x-small;",
      "cursor: pointer;"
    ]
  };

  messages =
  {
    onWriteDone: "Wrote data successfully.",
    onWriteFail: "Failed to write data.",
    onPathBroken: "Device has no alias."
  };

  colors =
  {
    green:  "#4DA74D",
    red: "#A91E27"
  };

  for (cx in styles)
    styles[cx] = styles[cx].join("");

  container.innerHTML =
  [
    '<dl style=":style">'.replace(":style", styles.dl),
      createDefinition(dataports),
    '</dl>',
    '<div style=":style"></div>'.replace(":style", styles.div)
  ].join("");

  buttons = container.getElementsByTagName("button");
  for (cx = 0; cx < buttons.length; cx++)
    buttons[cx].onclick = onSubmit;

  function getDataports(alias, client)
  {
    var cx,
        dataports = [],
        childDataports,
        childClient;

    dataports = dataports.concat(client.dataports);

    for (cx = 0; cx < dataports.length; cx++)
    {
      dataports[cx].path = alias !== "" ? [alias] : [];
      dataports[cx].path.push(dataports[cx].alias);
    }

    if (client.clients === undefined)
      return dataports;

    for (cx = 0; cx < client.clients.length; cx++)
    {
      childClient = client.clients[cx];

      childDataports = getDataports(childClient.alias, childClient);
      dataports = dataports.concat(childDataports);
    }

    return dataports;
  }

  function createDefinition(dataports)
  {
    var cx,
        html = "",
        dataport,
        value;

    for (cx = 0; cx < dataports.length; cx++)
    {
      dataport = dataports[cx];
      value = dataport.data[0] ? dataport.data[0][1] : "";

      html += '<dt style=":style" title=":name">'
        .replace(":style", styles.dt)
        .replace(":name", dataport.info.description.name);
      html += dataport.info.description.name;
      html += '</dt>';

      html += '<dd>';
      html += '<fieldset>';
      html += '<input type="text" name="value" value=":value" style=":style" />'
        .replace(":style", styles.input)
        .replace(":value", value)
      ;
      html += '<button type="button" name="resource" value=":value" style=":style">'
        .replace( ":value", encodePath(dataport.path) )
        .replace(":style", styles.button)
      ;
      html += 'Update';
      html += '</button>';
      html += '</fieldset>';
      html += '</dd>';
    }

    return html;
  }

  function onSubmit()
  {
    var resource = decodePath(this.getAttributeNode("value").value),
        value = this.parentNode.getElementsByTagName("input")[0].value;

    if (resource[0] === null)
    {
      onPathBroken();
      return;
    }

    write(resource, value)
      .done(onWriteDone)
      .fail(onWriteFail)
      .done(onWriteComplete)
      .fail(onWriteComplete)
    ;

    disableWrite(true);
  }

  function disableWrite(disabled)
  {
    // closure: buttons //
    var cx;

    for (cx = 0; cx < buttons.length; cx++)
      buttons[cx].disabled = disabled;
  }

  function onWriteDone()
  {
    // closure: messages, colors //
    showMesssage(messages.onWriteDone, colors.green);
  }

  function onWriteFail()
  {
    // closure: messages, colors //
    showMesssage(messages.onWriteFail, colors.red);
  }

  function onPathBroken()
  {
    // closure: messages, colors //
    showMesssage(messages.onPathBroken, colors.red);
  }

  function onWriteComplete()
  {
    disableWrite(false);
  }

  function showMesssage(message, color)
  {
    // closure: container //
    var board = container.getElementsByTagName("div")[0],
        timeout = 2000;

    board.innerHTML = message;
    board.style.backgroundColor = color;
    setTimeout(onMessageExpire, timeout);
  }

  function onMessageExpire()
  {
    // closure: container //
    var board = container.getElementsByTagName("div")[0];

    board.innerHTML = "";
  }

  function encodePath(path)
  {
    return path.join();
  }

  function decodePath(path)
  {
    var cx;

    path = path.split(",");
    for (cx = 0; cx < path.length; cx++)
    {
      if (path[cx] !== "")
        continue;
      path[cx] = null;
    }

    return path;
  }
}
