const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const SimplePeer = require('simple-peer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // Send the socket id to the client
  socket.emit('your-id', socket.id);

  // Listen for offer and answer messages
  socket.on('offer', data => {
    console.log('Received offer from:', data.from);
    // Create a new peer
    const peer = new SimplePeer({ initiator: false });
    // Signal the offer
    peer.signal(data.offer);
    
    // Listen for data channel
    peer.on('data', data => {
      console.log('Received data:', data.toString());
    });
    
    // Listen for stream
    peer.on('stream', stream => {
      console.log('Received stream from:', data.from);
      // Send stream to the client
      socket.emit('stream', { from: data.from, stream });
    });
  });

  socket.on('answer', data => {
    console.log('Received answer from:', data.from);
    // Find the corresponding peer and signal the answer
    io.to(data.from).emit('peer-answer', data.answer);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
