import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// SIMPLE PROMISE WRAPPER (because your db uses callbacks)
function queryPromise(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ==================== SIGNUP ====================
router.post("/signup", async (req, res) => {
  console.log("🔥 SIGNUP ENDPOINT HIT");
  console.log("📦 Received data:", req.body);

  try {
    const { first_name, last_name, email, role, location, password, confirmPassword } = req.body;

    // Validation - Check all fields
    if (!first_name || !last_name || !email || !role || !location || !password || !confirmPassword) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    if (role !== 'Farmer' && role !== 'Extension Officer') {
      console.log("❌ Invalid role");
      return res.status(400).json({ message: "Role must be either 'Farmer' or 'Extension Officer'" });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      console.log("❌ Passwords don't match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    console.log("✅ Validation passed");

    // Check if user exists (by email)
    const existingUsers = await queryPromise(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Existing users:", existingUsers.length);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user WITH EMAIL AND ROLE
    console.log("💾 Inserting into database...");
    const result = await queryPromise(
      "INSERT INTO users (first_name, last_name, email, role, location, password) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, role, location, hashedPassword]
    );

    console.log("✅✅✅ USER CREATED! ID:", result.insertId);

    res.status(201).json({ 
      message: "User registered successfully! Please login.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("💥💥💥 SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN ENDPOINT HIT");
  console.log("📦 Received data:", req.body);

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    console.log("🔍 Looking for user...");
    const users = await queryPromise(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Found users:", users.length);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("✅ User found, ID:", user.id);

    // Check password
    console.log("🔐 Checking password...");
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("❌ Wrong password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password correct!");

    // Generate token with role
    const token = jwt.sign(
      { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email,
        role: user.role,  // Include role in token
        location: user.location 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅✅✅ LOGIN SUCCESSFUL!");

    res.json({ 
      message: "Login successful!", 
      token,
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email,
        role: user.role,  // Include role in response
        location: user.location 
      }
    });

  } catch (error) {
    console.error("💥💥💥 LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== GET PROFILE ====================
router.get("/profile", protect, async (req, res) => {
  try {
    console.log("🔍 Getting profile for user ID:", req.user.id);

    const users = await queryPromise(
      "SELECT id, first_name, last_name, email, role, location, created_at FROM users WHERE id = ?", 
      [req.user.id]
    );

    if (users.length === 0) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile retrieved:", users[0]);
    res.json({ user: users[0] });
  } catch (error) {
    console.error("💥 Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// ==================== UPDATE PROFILE ====================
router.put("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, role, location } = req.body;

    console.log("🔄 Updating profile for user ID:", userId);
    console.log("📦 New data:", { first_name, last_name, email, role, location });

    // Validation
    if (!first_name || !last_name || !email || !role || !location) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    if (role !== 'Farmer' && role !== 'Extension Officer') {
      console.log("❌ Invalid role");
      return res.status(400).json({ message: "Role must be either 'Farmer' or 'Extension Officer'" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if email is already taken by another user
    const existingUser = await queryPromise(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (existingUser.length > 0) {
      console.log("❌ Email already in use");
      return res.status(400).json({ message: "Email already in use by another account" });
    }

    // Update user
    await queryPromise(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, location = ? WHERE id = ?",
      [first_name, last_name, email, role, location, userId]
    );

    console.log("✅ Profile updated successfully");
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("💥 Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;