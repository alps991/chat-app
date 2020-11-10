const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $chatSidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const linkTemplate = document.querySelector("#link-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageHeight = $newMessage.offsetHeight + parseInt(newMessageStyles.marginBottom);

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;

    const curScrolled = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= curScrolled) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}

$messageForm.addEventListener('submit', e => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log("Delivered!");
    });
});

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not available');
    }
    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(location => {
        socket.emit('sendLocation', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled');
            console.log("Location shared!");
        });
    });
});

socket.on('recieveMessage', (message) => {
    const { messageText, createdAt, username } = message;
    const html = Mustache.render(messageTemplate, {
        messageText,
        createdAt: moment(createdAt).format("h:mm a"),
        username,
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('recieveLocation', (locationMessage) => {
    const { url, createdAt, username } = locationMessage;
    const html = Mustache.render(linkTemplate, {
        url,
        createdAt: moment(createdAt).format("h:mm a"),
        username,
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomUpdate', users => {
    const html = Mustache.render(sidebarTemplate, { users, room: users[0].room });
    $chatSidebar.innerHTML = html;
});

socket.emit('joinRoom', { username, room }, err => {
    if (err) {
        alert(err);
        location.href = '/';
    }
});

