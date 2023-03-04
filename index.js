const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const app = express();

const route = require('./route')
const {addUser, findUser, getRoomUsers, removeUser} = require("./users");
const {MESSAGE, ADMIN, ROOM} = require("./constants");

app.use(cors({origin: '*'}));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({name, room}) => {
    socket.join(room);

    const {user, isExist} = addUser({name, room});
    const userMessage = isExist
      ? `Good to see you again, ${user.name}`
      : `Welcome, ${user.name}`;

    socket.emit(MESSAGE, {
      data: {user: {name: ADMIN}, message: userMessage}
    });

    socket.broadcast.to(user.room).emit(MESSAGE, {
      data: {user: {name: ADMIN}, message: `${user.name} has joined.`}
    });

    io.to(user.room).emit(ROOM, {
      data: {users: getRoomUsers(user.room)}
    });
  });

  socket.on('sendMessage', ({message, params}) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit(MESSAGE, {
        data: {user, message}
      })
    }
  })

  socket.on('leftRoom', ({params}) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(user.room).emit(MESSAGE, {
        data: {user: { name: ADMIN }, message: `${name} has left`}
      });

      io.to(user.room).emit(ROOM, {
        data: {users: getRoomUsers(room)}
      });
    }
  })

  io.on('disconnect', () => {
    console.log('Disconnect')
  });
});

server.listen(4000, () => {
  console.log('Server is running');
})
