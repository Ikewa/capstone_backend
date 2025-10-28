import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import eventsRoutes from './routes/eventsRoutes.js';
import cropRequestRoutes from './routes/cropRequestRoutes.js';  
import notificationRoutes from './routes/notificationRoutes.js';
import cropCatalogRoutes from './routes/cropCatalogRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import locationsRoutes from './routes/locationsRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));