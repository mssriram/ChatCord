const socket = io()
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

socket.emit('joinRoom', {username, room});

chatForm.addEventListener('submit', function(evt){
    evt.preventDefault();
   
    const msg = evt.target.elements.msg.value;
    
    socket.emit('chatMessage', msg);

    evt.target.elements.msg.value = "";
    evt.target.elements.msg.focus();
})

socket.on('roomUsers', function(users){
    outputRoomName(users.room);
    outputUsers(users.users);
})

socket.on("message", function(msg){
    outputMessage(msg);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function outputMessage(msg){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p><p class="text">${msg.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
};

function outputRoomName(room) {
    const roomName = document.getElementById('room-name');
    roomName.innerText = room;
}

function outputUsers(users){
    const userList = document.getElementById('users');
    userList.innerHTML = `
        ${users.map(user=> `<li> ${user.username}</li>`).join('')}
    `;
}

