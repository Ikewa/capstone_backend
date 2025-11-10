import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function for promises
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database (including is_admin field)
    const users = await queryPromise(
      "SELECT id, email, first_name, last_name, role, location, is_admin FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    // Attach user to request (including is_admin)
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      location: user.location,
      is_admin: user.is_admin || false
    };

    next();

  } catch (err) {
    console.error("❌ Auth middleware error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Token expired. Please login again." });
    }
    
    return res.status(403).json({ message: "Sign In to access this resource" });
  }
};