import db from "../config/db.js";

// Helper function for promises
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ==================== HOME ====================
export const getHome = async (req, res) => {
  try {
    console.log("🏠 Protected Home route accessed by user:", req.user.id);

    // Get fresh user data from database (including is_admin)
    const users = await queryPromise(
      "SELECT id, first_name, last_name, email, role, location, avatar_url, bio, is_admin FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.json({ 
      message: "Welcome to Home!",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        location: user.location,
        avatar_url: user.avatar_url,
        bio: user.bio,
        is_admin: user.is_admin || false  // ✅ Include is_admin
      }
    });

  } catch (error) {
    console.error("💥 getHome error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = (req, res) => {
  res.json({ 
    message: "Welcome to Notifications!", 
    user: req.user  // req.user already has is_admin from middleware
  });
};

// ==================== CROP ====================
export const getCrop = (req, res) => {
  res.json({ 
    message: "Welcome to Crop Recommendations!", 
    user: req.user 
  });
};

// ==================== BOOKING ====================
export const getBooking = (req, res) => {
  res.json({ 
    message: "Welcome to Booking!", 
    user: req.user 
  });
};

// ==================== EVENTS ====================
export const getEvents = (req, res) => {
  res.json({ 
    message: "Welcome to Events!", 
    user: req.user 
  });
};

// ==================== MAP ====================
export const getMap = (req, res) => {
  res.json({ 
    message: "Welcome to Map!", 
    user: req.user 
  });
};

// ==================== SETTINGS ====================
export const getSettings = (req, res) => {
  res.json({ 
    message: "Welcome to Settings!", 
    user: req.user 
  });
};