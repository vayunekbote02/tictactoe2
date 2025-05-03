require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Uncomment below code to use frontend
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// Uncomment below code to use backend only
const io = new Server(server);

app.use(express.static(path.join(__dirname, "client-dist")));

const playerRooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    if (roomSize >= 2) {
      socket.emit("room_full", room);
      return;
    }
    socket.join(room);
    playerRooms[socket.id] = room;
    const role = roomSize === 0 ? "X" : "O";
    socket.emit("room_joined", { room, role });
    roomSize === 1 && io.to(room).emit("game_start");
    console.log(`User ${socket.id} joined room: ${room} as ${role}`);
  });

  socket.on("move_made", ({ room, board_array }) => {
    socket.to(room).emit("move_broadcasted", board_array);
  });

  socket.on("restart_game", (room) => {
    socket.to(room).emit("game_restarted");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const room = playerRooms[socket.id];
    if (room) {
      delete playerRooms[socket.id];
      socket.to(room).emit("opponent_left");
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
