const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
//Importamos Server de socket.io
const { Server } = require("socket.io");
//Creamos un server desde socket.io (recibe como parámetro la instancia del server http de node)
const ioServer = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

//Nos registramos al evento de conexión de algún usuario al socket
ioServer.on("connection", (socket) => {
  ioServer.emit("new user connected");
  //Escuchamos al evento de chat msg del cliente
  socket.on("chat msg", (message) => {
    //emitimos el mensaje al cliente para mostrarlo en el panel del chat
    ioServer.emit("chat msg server", message);
    console.log("mensaje del chat", message);
  });
  //Escuchamos al evento de user typing del cliente
  socket.on("user typing", (nickname) => {
    ioServer.emit("user typing server", `${nickname} está escribiendo`);
  });
  //el evento de desconexión viene dado por el argumento recibido en el callback (objeto socket)
  socket.on("disconnect", () => {
    ioServer.emit("user disconnected");
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on port: 3000");
});

// TODO:
// Broadcast a message to connected users when someone connects or disconnects. (partially done)
// Add support for nicknames. (partially done)
// Don’t send the same message to the user that sent it. Instead, append the message directly as soon as he/she presses enter.
// Show who’s online.
// Add private messaging.
