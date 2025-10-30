// Socket.io chat handler
const userSockets = new Map(); // Map userId to socketId

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      userSockets.set(userId.toString(), socket.id);
      socket.userId = userId;
    });

    // Send message
    socket.on('send_message', (data) => {
      const { receiver_id, message } = data;
      const receiverSocketId = userSockets.get(receiver_id.toString());
      
      console.log(`💬 Message from ${socket.userId} to ${receiver_id}`);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', message);
        console.log('✅ Message delivered in real-time');
      } else {
        console.log('⏳ Receiver offline, message saved to DB');
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiver_id, conversation_id } = data;
      const receiverSocketId = userSockets.get(receiver_id.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          conversation_id,
          user_id: socket.userId
        });
      }
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { receiver_id, conversation_id } = data;
      const receiverSocketId = userSockets.get(receiver_id.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          conversation_id,
          user_id: socket.userId
        });
      }
    });

    // Mark messages as read
    socket.on('mark_read', (data) => {
      const { receiver_id, conversation_id } = data;
      const receiverSocketId = userSockets.get(receiver_id.toString());
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messages_read', {
          conversation_id,
          reader_id: socket.userId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      if (socket.userId) {
        userSockets.delete(socket.userId.toString());
      }
    });
  });
};