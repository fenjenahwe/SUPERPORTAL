module.exports = (httpServer, server) => {
  const WebSocketServer = new require("websocket").server;
  const wsServer = new WebSocketServer({
    httpServer: httpServer,
  });

  wsServer.on("request", function (request) {
    var connection = request.accept(null, request.origin);
    let username = request.resourceURL.query.username
    
    server.on_connect(connection, username);

    connection.on("message", (msg) => {
      server.on_message(connection, msg);
    });

    connection.on("close", () => {
      server.on_close(connection);
    });
  });


};
