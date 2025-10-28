import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ==========================================
// SIGNUP CONTROLLER
// ==========================================
export const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, location, password, confirmPassword } = req.body;

    console.log("🔥 SIGNUP ENDPOINT HIT");
    console.log("📦 Received data:", { first_name, last_name, email, location });

    // Validation - Check all fields
    if (!first_name || !last_name || !email || !location || !password || !confirmPassword) {
      console.log("❌ Validation failed: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      console.log("❌ Validation failed: Passwords don't match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password length
    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Validation failed: Invalid email format");
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    console.log("✅ Validation passed");

    // Check if user already exists (by email)
    console.log("🔍 Checking if user exists...");
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log("🔍 Existing users:", existingUser.length);

    if (existingUser.length > 0) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // Insert user into database WITH EMAIL
    console.log("💾 Inserting into database...");
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, location, password) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, location, hashedPassword]
    );

    console.log("✅✅✅ User created successfully! ID:", result.insertId);

    res.status(201).json({ 
      message: "User registered successfully! Please login.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("💥💥💥 SIGNUP ERROR:", error);
    console.error("💥 Error message:", error.message);
    console.error("💥 Error code:", error.code);
    res.status(500).json({ message: "Server error during signup", error: error.message });
  }
};

// ==========================================
// LOGIN CONTROLLER
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔥 LOGIN ENDPOINT HIT");
    console.log("📦 Received data:", { email });

    // Validation
    if (!email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user in database by email
    console.log("🔍 Looking for user in database...");
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Users found:", users.length);

    if (users.length === 0) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("✅ User found, ID:", user.id);

    // Compare password
    console.log("🔐 Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password incorrect");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password correct");

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        location: user.location
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅✅✅ Login successful for user:", user.id);

    res.json({ 
      message: "Login successful!", 
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        location: user.location
      }
    });

  } catch (error) {
    console.error("💥💥💥 LOGIN ERROR:", error);
    console.error("💥 Error message:", error.message);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// ==========================================
// GET USER PROFILE CONTROLLER
// ==========================================
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🔍 Getting profile for user ID:", userId);

    const [users] = await db.query(
      "SELECT id, first_name, last_name, email, location, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile retrieved:", users[0]);
    res.json({ user: users[0] });

  } catch (error) {
    console.error("💥 Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// ==========================================
// UPDATE USER PROFILE CONTROLLER
// ==========================================
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, location } = req.body;

    console.log("🔄 Updating profile for user ID:", userId);
    console.log("📦 New data:", { first_name, last_name, email, location });

    // Validation
    if (!first_name || !last_name || !email || !location) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if email is already taken by another user
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (existingUser.length > 0) {
      console.log("❌ Email already in use");
      return res.status(400).json({ message: "Email already in use by another account" });
    }

    // Update user
    await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, location = ? WHERE id = ?",
      [first_name, last_name, email, location, userId]
    );

    console.log("✅ Profile updated successfully");
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("💥 Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};