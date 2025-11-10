// Admin-only access middleware
export const adminOnly = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is admin
    if (!req.user.is_admin) {
      console.log(`❌ Access denied for user ${req.user.id} - Not an admin`);
      return res.status(403).json({ message: "Admin access only" });
    }

    console.log(`✅ Admin access granted for user ${req.user.id}`);
    next();

  } catch (error) {
    console.error("❌ Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};