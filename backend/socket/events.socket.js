const User = require('../../database/models/User');

const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-department', async (department) => {
      const user = await User.findById(socket.userId);
      if (user && user.department === department) {
        socket.join(department);
        console.log(`User ${socket.userId} joined department: ${department}`);
      }
    });

    socket.on('leave-department', (department) => {
      socket.leave(department);
      console.log(`User ${socket.userId} left department: ${department}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocketEvents;
