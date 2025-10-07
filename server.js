import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/users", userRoutes);
app.use("/protected", protectedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
