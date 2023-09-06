// const socket = io()
// let name;
// let textarea = document.querySelector('#textarea')
// let messageArea = document.querySelector('.message__area')
// do {
//     name = prompt('Please enter your name: ')
// } while(!name)

// textarea.addEventListener('keyup', (e) => {
//     if(e.key === 'Enter') {
//         sendMessage(e.target.value)
//     }
// })

// function sendMessage(message) {
//     let msg = {
//         user: name,
//         message: message.trim()
//     }
//     // Append
//     appendMessage(msg, 'outgoing')
//     textarea.value = ''
//     scrollToBottom()

//     // Send to server
//     socket.emit('message', msg)

// }

// function appendMessage(msg, type) {
//     let mainDiv = document.createElement('div')
//     let className = type
//     mainDiv.classList.add(className, 'message')

//     let markup = `
//         <h4>${msg.user}</h4>
//         <p>${msg.message}</p>
//     `
//     mainDiv.innerHTML = markup
//     messageArea.appendChild(mainDiv)
// }

// // Recieve messages
// socket.on('message', (msg) => {
//     appendMessage(msg, 'incoming')
//     scrollToBottom()
// })

// function scrollToBottom() {
//     messageArea.scrollTop = messageArea.scrollHeight
// }

const socket = io();
// imports
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
let currentTime = document.querySelector("#c_time");
let name;
do {
  name = prompt("Please Enter name");
} while (!name);
console.log(name);
textarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage(e.target.value);
  }
});

function sendMessage(message) {
  let msg = {
    user: name,
    message: message.trim(),
  };
  //   Append
  appendMessage(msg, "outgoing");
  textarea.value = "";
  // Send to server
  socket.emit("chat message", msg);
}
function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "message");
  let htmlMarkup = `
    <h4>${msg.user}</h4>
    <p>${msg.message}</p>
    <div class="time">
    <p id="c_time">${getCurrentTime()}</p>

</div>
    `;
  mainDiv.innerHTML = htmlMarkup;

  messageArea.appendChild(mainDiv);
}
// Receive Messages
socket.on("message", (msg) => {
  console.log(msg);
  appendMessage(msg, "incoming");
});
function getCurrentTime() {
    const now = new Date();
    const options = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Karachi'  };
    return now.toLocaleTimeString('en-US', options);
  }