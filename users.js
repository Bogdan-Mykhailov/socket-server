const {trimString} = require("./utils");

let users = [];

const findUser = (user) => {
  const userName = trimString(user.name);
  const userRoom = trimString(user.room);

  return users.find(
    (user) => (
      trimString(user.name) === userName
      && trimString(user.room) === userRoom
    )
  );
};

const addUser = (user) => {
  const isExist = findUser(user);

  !isExist && users.push(user);

  const currentUser = isExist || user;

  return {isExist: !!isExist, user: currentUser};
};

const getRoomUsers = (room) => (
  users.filter((user) => user.room === room)
);

const removeUser = (user) => {
  const foundUser = findUser(user);

  if (foundUser) {
    users = users.filter(({room, name}) => room === foundUser.room && name !== foundUser.name)
  }

  return foundUser;
}

module.exports = {addUser, findUser, getRoomUsers, removeUser};
