const generateMessage = (message, username) => ({
    messageText: message,
    createdAt: new Date().getTime(),
    username,
});

const generateLocationMessage = (location, username) => ({
    url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
    createdAt: new Date().getTime(),
    username,
});

module.exports = { generateMessage, generateLocationMessage };