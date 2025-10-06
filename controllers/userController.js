import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Sign up 
export const registerUser = (req, res) => {
  const { first_name, last_name, location, password, confirmPassword } = req.body;

  if (!first_name || !last_name || !location || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    const sql = "INSERT INTO users (first_name, last_name, location, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [first_name, last_name, location, hash], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.status(201).json({ message: "Signup successful" });
    });
  });
};

// Login 
export const loginUser = (req, res) => {
  const { first_name, last_name, password, confirmPassword, location } = req.body;

  if (!first_name || !last_name || !password || !confirmPassword || !location) {
    return res.status(400).json({ message: "First name, last name, password, and location are required" });
  }

  const sql = "SELECT * FROM users WHERE first_name = ? AND last_name = ? AND location = ?";
  db.query(sql, [first_name, last_name, location], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign({ id: user.id, first_name: user.first_name }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    });
  });
};


