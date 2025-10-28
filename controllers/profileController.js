import db from "../config/db.js";
import bcrypt from "bcryptjs";

// Helper function for promises
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ==================== GET USER PROFILE BY ID ====================
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("👤 Fetching user profile:", id);

    // Get user basic info
    const [user] = await queryPromise(
      `SELECT 
        id, first_name, last_name, email, role, location, 
        bio, phone, avatar_url, created_at
      FROM users 
      WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's questions
    const questions = await queryPromise(
      `SELECT 
        q.id, q.title, q.description, q.category, q.created_at,
        COUNT(DISTINCT a.id) as answer_count,
        COUNT(DISTINCT qv.id) as vote_count
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN question_votes qv ON q.id = qv.question_id AND qv.vote_type = 'upvote'
      WHERE q.user_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT 10`,
      [id]
    );

    // Get user's answers
    const answers = await queryPromise(
      `SELECT 
        a.id, a.content, a.created_at,
        q.id as question_id, q.title as question_title,
        COUNT(DISTINCT av.id) as vote_count
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      LEFT JOIN answer_votes av ON a.id = av.answer_id AND av.vote_type = 'upvote'
      WHERE a.user_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT 10`,
      [id]
    );

    // Get user's events (if officer)
    let events = [];
    if (user.role === 'Extension Officer') {
      events = await queryPromise(
        `SELECT 
          e.id, e.title, e.event_date, e.location,
          COUNT(DISTINCT er.id) as registration_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
        WHERE e.user_id = ?
        GROUP BY e.id
        ORDER BY e.event_date DESC
        LIMIT 5`,
        [id]
      );
    }

    // Get statistics
    const [stats] = await queryPromise(
      `SELECT 
        (SELECT COUNT(*) FROM questions WHERE user_id = ?) as total_questions,
        (SELECT COUNT(*) FROM answers WHERE user_id = ?) as total_answers,
        (SELECT COUNT(*) FROM question_votes qv 
         JOIN questions q ON qv.question_id = q.id 
         WHERE q.user_id = ? AND qv.vote_type = 'upvote') as question_upvotes,
        (SELECT COUNT(*) FROM answer_votes av 
         JOIN answers a ON av.answer_id = a.id 
         WHERE a.user_id = ? AND av.vote_type = 'upvote') as answer_upvotes`,
      [id, id, id, id]
    );

    console.log("✅ Profile fetched successfully");

    res.json({
      user,
      questions,
      answers,
      events,
      stats
    });

  } catch (error) {
    console.error("💥 Error fetching user profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET MY PROFILE ====================
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("👤 Fetching my profile:", userId);

    const [user] = await queryPromise(
      `SELECT 
        id, first_name, last_name, email, role, location, 
        bio, phone, avatar_url, created_at
      FROM users 
      WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ My profile fetched");

    res.json({ user });

  } catch (error) {
    console.error("💥 Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, location, bio, phone } = req.body;

    console.log("✏️ Updating profile for user:", userId);

    // Validation
    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, location = ?, bio = ?, phone = ?
      WHERE id = ?
    `;

    await queryPromise(sql, [
      first_name,
      last_name,
      location || null,
      bio || null,
      phone || null,
      userId
    ]);

    console.log("✅ Profile updated successfully");

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("💥 Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    console.log("🔒 Changing password for user:", userId);

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Get current password hash
    const [user] = await queryPromise(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await queryPromise(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    console.log("✅ Password changed successfully");

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("💥 Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE AVATAR ====================
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar_url } = req.body;

    console.log("🖼️ Updating avatar for user:", userId);

    if (!avatar_url) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    await queryPromise(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatar_url, userId]
    );

    console.log("✅ Avatar updated successfully");

    res.json({ message: "Avatar updated successfully", avatar_url });

  } catch (error) {
    console.error("💥 Error updating avatar:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};