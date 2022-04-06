//Simular nickname
const nickname = "Pedro";
//   io recibe del host del server, sin embargo no la pasamos aquí porque por defecto se conecta al mismo host que esté sirviendo la web
//  Instanciamos el cliente y lo almacenamos en socket
const socketClient = io();
//Obtenemos el mensaje a enviar del form en el submit
const form = document.getElementById("form");
const input = document.getElementById("input");
const messagesContainer = document.getElementById("messages");
const loadingMessage = document.getElementById("loading-message");
const usersListContainer = document.getElementById("connectedUsers");

//Centralizamos la función para crear mensajes en el chat
const addNewMessageToChat = (msg) => {
  const messageItem = document.createElement("li");
  messageItem.textContent = msg;
  messagesContainer.appendChild(messageItem);
  window.scrollTo(0, document.body.scrollHeight);
};

//Actualizamos la lista de usuarios conectados
const updateUsersConnected = (usersList) => {
  usersListContainer.innerHTML = "";
  usersList.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.innerText = user;
    usersListContainer.appendChild(userItem);
  });
};

//Añadimos un eventListener para enviar mensajes al server y renderizarlos en el chat
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  console.log(socketClient);
  console.log(loadingMessage.textContent);
  //Si el input tiene algún mensaje, emitimos un evento con socket con el contenido del mensaje como data
  if (input.value) {
    socketClient.emit("chat msg", `${nickname}: ${input.value}`);
    addNewMessageToChat(`${nickname}: ${input.value}`);
    input.value = "";
    loadingMessage.textContent = "";
  }
  console.log(loadingMessage.textContent);
});

//   Escuchamos al cambio del valor del input para el mensaje de "el usuario está escribiendo"
input.addEventListener("keyup", () => {
  !input.value || input.value.length === 0
    ? (loadingMessage.textContent = "")
    : socketClient.emit("user typing", nickname);
});

socketClient.on("user typing server", (loadingMsg) => {
  loadingMessage.textContent = loadingMsg;
});
//   Enviamos mensaje al chat cuando un usuario se conecta o se desconecta
socketClient.on("new user connected", (data) => {
  const { msg, userNames } = data;
  addNewMessageToChat(msg);
  updateUsersConnected(userNames);
});

socketClient.on("user disconnected", (data) => {
  const { msg, updatedUsers } = data;
  addNewMessageToChat(msg);
  updateUsersConnected(updatedUsers);
});

//   Agregamos nuevo mensaje al chat cuando un usuario envía un mensaje
socketClient.on("chat msg server", (chatMessage) => {
  addNewMessageToChat(chatMessage);
});

socketClient.on("connect", () => {
  socketClient.emit("new user nickname", { nickname });
});