let users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return { error: 'Username and room are required' };
    }

    const existingUser = users.find(user => user.room === room && user.username === username);
    if (existingUser) {
        return { error: `${username} already exists in ${room}` }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };

}

const removeUser = id => {
    const existingUser = users.find(user => user.id === id);
    if (!existingUser) {
        return { error: `$User with id {id} was not found` };
    }

    users = users.filter(user => user.id !== id)
    return existingUser;
}

const getUser = id => {
    return users.find(user => user.id === id)
}

const getUsersinRoom = room => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

module.exports = { addUser, removeUser, getUser, getUsersinRoom }