// Socket.io chat and group discussion handler
const userSockets = new Map(); // Map userId to socketId

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // ==================== USER CONNECTION ====================
    // User joins with their ID
    socket.on('join', (userId) => {
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      userSockets.set(userId.toString(), socket.id);
      socket.userId = userId;
    });

    // ==================== PRIVATE CHAT MESSAGES ====================
    // Send private message
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

    // ==================== GROUP DISCUSSION MESSAGES ====================
    // Join a discussion group room
    socket.on('join_group', (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`👥 User ${socket.userId} joined group ${groupId}`);
    });

    // Leave a discussion group room
    socket.on('leave_group', (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`👋 User ${socket.userId} left group ${groupId}`);
    });

    // Send message to group
    socket.on('send_group_message', (data) => {
      const { group_id, message } = data;
      console.log(`💬 Group message from user ${socket.userId} in group ${group_id}`);
      
      // Broadcast to all users in the group room
      io.to(`group_${group_id}`).emit('new_group_message', message);
      console.log(`✅ Message broadcast to group ${group_id}`);
    });

    // Message reaction in group
    socket.on('message_reaction', (data) => {
      const { group_id, message_id, action } = data;
      console.log(`👍 Reaction ${action} on message ${message_id} in group ${group_id}`);
      
      // Broadcast reaction update to group
      io.to(`group_${group_id}`).emit('message_reaction', {
        message_id,
        action,
        user_id: socket.userId
      });
    });

    // User typing in group
    socket.on('group_typing', (data) => {
      const { group_id, user_name } = data;
      socket.to(`group_${group_id}`).emit('user_typing_in_group', {
        user_id: socket.userId,
        user_name,
        group_id
      });
    });

    // User stop typing in group
    socket.on('group_stop_typing', (data) => {
      const { group_id } = data;
      socket.to(`group_${group_id}`).emit('user_stop_typing_in_group', {
        user_id: socket.userId,
        group_id
      });
    });

    // ==================== PRIVATE CHAT TYPING INDICATORS ====================
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

    // ==================== READ RECEIPTS ====================
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

    // ==================== DISCONNECT ====================
    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      if (socket.userId) {
        userSockets.delete(socket.userId.toString());
      }
    });
  });
};