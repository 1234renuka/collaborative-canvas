const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const rooms = require('./rooms');
const drawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, '..', 'client')));

io.on('connection', socket => {
  let joinedRoom = null;

  // USER JOINS A ROOM
  socket.on('join', ({ roomId, username }, ack) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();
    username = (username || 'Guest').trim() || 'Guest';

    joinedRoom = roomId;
    socket.join(roomId);

    rooms.addUser(roomId, socket, username);

    ack({
      userId: socket.id,
      fullActions: drawingState.getFullActions(roomId)
    });

    io.to(roomId).emit('users', rooms.listUsers(roomId));
  });

  // REAL-TIME STROKE PROGRESS
  socket.on('clientStrokeProgress', ({ roomId, stroke }) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();
    socket.to(roomId).emit('strokeProgress', {
      userId: socket.id,
      stroke
    });
  });

  // USER ENDS A STROKE
  socket.on('clientStrokeEnd', ({ roomId, stroke }) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();

    const action = { type: 'stroke', payload: stroke };

    drawingState.addAction(roomId, action);

    io.to(roomId).emit('action', {
      origin: socket.id,
      payload: action
    });
  });

  // REMOTE CURSOR MOVEMENT (optional)
  socket.on('cursor', ({ roomId, x, y }) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();
    io.to(roomId).emit('cursor', {
      userId: socket.id,
      x, y
    });
  });

  // GLOBAL UNDO
  socket.on('undo', ({ roomId }) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();
    const undone = drawingState.undo(roomId);

    if (undone) {
      io.to(roomId).emit('actionUndo', {
        actionId: undone.payload.id,
        by: socket.id
      });
    }
  });

  // GLOBAL REDO
  socket.on('redo', ({ roomId }) => {
    roomId = (roomId || 'lobby').trim().toLowerCase();
    const redone = drawingState.redo(roomId);

    if (redone) {
      io.to(roomId).emit('action', {
        origin: socket.id,
        payload: redone
      });
    }
  });

  // USER DISCONNECTS
  socket.on('disconnect', () => {
    if (joinedRoom) {
      rooms.removeUser(joinedRoom, socket.id);
      io.to(joinedRoom).emit('users', rooms.listUsers(joinedRoom));
    }
  });
});


// ------------------------------------------
// FIX FOR RENDER DEPLOYMENT
// ------------------------------------------

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log("Server running on port", PORT);

  // Only auto-open browser on LOCAL (port 3000)
  if (PORT === 3000) {
    const open = (await import('open')).default;

    try {
      await open("http://localhost:3000");
    } catch (err) {
      console.error("Could not open browser:", err);
    }
  }
});
