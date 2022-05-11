const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
//Importamos Server de socket.io
const { Server } = require("socket.io");
//Creamos un server desde socket.io (recibe como parámetro la instancia del server http de node)
const ioServer = new Server(server);
let usersConnected = [];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

//Nos registramos al evento de conexión de algún usuario al socket
ioServer.on("connection", async (socket) => {
  socket.on("new user nickname", (data) => {
    usersConnected.push({ id: socket.id, nickname: data.nickname });
    const userNames = usersConnected.map((user) => user.nickname);
    console.log(userNames);
    ioServer.emit("new user connected", {
      msg: `${data.nickname} ha entrado a la sala`,
      userNames,
    });
  });

  socket.on("private message", (obj) => {
    const { userSelected, msg } = obj;
    const user = usersConnected.filter(
      (item) => item.nickname === userSelected
    );
    const myUser = usersConnected.filter((item) => item.id === socket.id);
    socket.to(user[0].id).emit("private message", myUser[0], msg);
    console.log(socket.id);
    console.log(user);
  });

  //Escuchamos al evento de chat msg del cliente
  socket.on("chat msg", (message) => {
    //emitimos el mensaje al cliente para mostrarlo en el panel del chat, al hacerlo con broadcast, el mensaje lo reciben los otros clientes y no el que lo envía
    socket.broadcast.emit("chat msg server", message);
    console.log("mensaje del chat", message);
  });
  //Escuchamos al evento de user typing del cliente
  socket.on("user typing", (nickname) => {
    socket.broadcast.emit("user typing server", `${nickname} está escribiendo`);
  });
  //el evento de desconexión viene dado por el argumento recibido en el callback (objeto socket)
  socket.on("disconnect", () => {
    const disconnectedNickname = usersConnected.filter(
      (user) => user.id === socket.id
    );

    usersConnected = usersConnected.filter((user) => user.id !== socket.id);

    if (disconnectedNickname.length > 0) {
      ioServer.emit("user disconnected", {
        msg: `${disconnectedNickname[0].nickname} ha dejado la sala`,
        usersConnected,
      });
    }
  });
});

server.listen(3000, () => {
  console.log("listening on port: 3000");
});
