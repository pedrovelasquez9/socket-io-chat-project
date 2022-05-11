//Simular nickname
let nickname = "";
//   io recibe del host del server, sin embargo no la pasamos aquí porque por defecto se conecta al mismo host que esté sirviendo la web
//  Instanciamos el cliente y lo almacenamos en socket
const socketClient = io();
//Obtenemos el mensaje a enviar del form en el submit
const form = document.getElementById("form");
const input = document.getElementById("input");
const messagesContainer = document.getElementById("messages");
const loadingMessage = document.getElementById("loading-message");
const usersListContainer = document.getElementById("connectedUsers");
const dialog = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname");
const nicknameForm = document.getElementById("nickname-form");
const directMessagesContainer = document.getElementById("dmMessages");
const userSelect = document.getElementById("userSelect");

const openModal = () => {
  dialog.showModal();
};

const closeModal = () => {
  dialog.close();
};

nicknameForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  defineNickname();
});

const defineNickname = () => {
  nickname = nicknameInput.value;
  socketClient.emit("new user nickname", { nickname });
  closeModal();
};

//Centralizamos la función para crear mensajes en el chat
const addNewMessageToChat = (msg) => {
  const messageItem = document.createElement("li");
  messageItem.textContent = msg;
  messagesContainer.appendChild(messageItem);
  window.scrollTo(0, document.body.scrollHeight);
  loadingMessage.textContent = "";
};

//Actualizamos la lista de usuarios conectados
const updateUsersConnected = (usersList) => {
  usersListContainer.innerHTML = "";
  userSelect.innerHTML = "<option value='global'>Chat Global</option>";
  usersList.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.innerText = user;
    usersListContainer.appendChild(userItem);
    if (user !== nickname) {
      const userOptionItem = document.createElement("option");
      userOptionItem.innerText = user;
      userOptionItem.setAttribute("value", user);
      userSelect.appendChild(userOptionItem);
    }
  });
};

//Añadimos un eventListener para enviar mensajes al server y renderizarlos en el chat
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const userSelected = userSelect.value;
  //Si el input tiene algún mensaje, emitimos un evento con socket con el contenido del mensaje como data
  if (input.value) {
    userSelected === "global"
      ? socketClient.emit("chat msg", `${nickname}: ${input.value}`)
      : socketClient.emit("private message", {
          userSelected,
          msg: input.value,
        });
    addNewMessageToChat(`${nickname}: ${input.value}`);
    input.value = "";
    loadingMessage.textContent = "";
  }
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
  console.log(data);
  const { msg, userNames } = data;
  addNewMessageToChat(msg);
  updateUsersConnected(userNames);
});

//Recibimos un mensaje directo
socketClient.on("private message", (emisor, msg) => {
  addNewMessageToChat(`${emisor.nickname}: ${msg}`);
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

window.addEventListener("load", () => {
  openModal();
});
