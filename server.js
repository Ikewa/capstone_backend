import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from "./routes/userRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import eventsRoutes from './routes/eventsRoutes.js';
import cropRequestRoutes from './routes/cropRequestRoutes.js';  
import notificationRoutes from './routes/notificationRoutes.js';
import cropCatalogRoutes from './routes/cropCatalogRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import locationsRoutes from './routes/locationsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { setupChatSocket } from './socket/chatSocket.js';
import discussionGroupRoutes from './routes/discussionGroupRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import ussdRoutes from './routes/ussdRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app); 

// Middleware
app.use(express.json());
app.use(cors());

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

// Chat socket setup
setupChatSocket(io);

// Routes
app.use("/users", userRoutes);
app.use("/protected", protectedRoutes);
app.use('/api', forumRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/crop-requests', cropRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/crop-catalog', cropCatalogRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/discussion-groups', discussionGroupRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api', ussdRoutes);

const PORT = process.env.PORT || 5000;


httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for real-time chat`);
});