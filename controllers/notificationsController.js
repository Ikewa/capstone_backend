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

// ==================== GET USER'S NOTIFICATIONS ====================
export const getNotifications = async (req, res) => {
  try {
    console.log("🔔 Fetching notifications...");
    
    const user_id = req.user.id;
    const { limit = 20, unread_only = false } = req.query;

    let sql = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;

    if (unread_only === 'true') {
      sql += ` AND is_read = FALSE`;
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;

    const notifications = await queryPromise(sql, [user_id, parseInt(limit)]);

    console.log(`✅ Found ${notifications.length} notifications`);

    res.json({
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        relatedId: n.related_id,
        isRead: n.is_read === 1,
        createdAt: n.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
};

// ==================== GET UNREAD COUNT ====================
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;

    const sql = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
    `;

    const result = await queryPromise(sql, [user_id]);

    res.json({ unreadCount: result[0].count });

  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ 
      message: 'Error getting unread count', 
      error: error.message 
    });
  }
};

// ==================== MARK NOTIFICATION AS READ ====================
export const markAsRead = async (req, res) => {
  try {
    console.log("✓ Marking notification as read...");
    
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if notification belongs to user
    const checkSql = `SELECT * FROM notifications WHERE id = ? AND user_id = ?`;
    const notifications = await queryPromise(checkSql, [id, user_id]);

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark as read
    const updateSql = `UPDATE notifications SET is_read = TRUE WHERE id = ?`;
    await queryPromise(updateSql, [id]);

    console.log("✅ Notification marked as read");

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Error marking notification as read', 
      error: error.message 
    });
  }
};

// ==================== MARK ALL AS READ ====================
export const markAllAsRead = async (req, res) => {
  try {
    console.log("✓ Marking all notifications as read...");
    
    const user_id = req.user.id;

    const sql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`;
    await queryPromise(sql, [user_id]);

    console.log("✅ All notifications marked as read");

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({ 
      message: 'Error marking all as read', 
      error: error.message 
    });
  }
};

// ==================== DELETE NOTIFICATION ====================
export const deleteNotification = async (req, res) => {
  try {
    console.log("🗑️ Deleting notification...");
    
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if notification belongs to user
    const checkSql = `SELECT * FROM notifications WHERE id = ? AND user_id = ?`;
    const notifications = await queryPromise(checkSql, [id, user_id]);

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Delete notification
    const deleteSql = `DELETE FROM notifications WHERE id = ?`;
    await queryPromise(deleteSql, [id]);

    console.log("✅ Notification deleted");

    res.json({ message: 'Notification deleted' });

  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ 
      message: 'Error deleting notification', 
      error: error.message 
    });
  }
};

// ==================== CREATE NOTIFICATION (Helper) ====================
export const createNotification = async (userId, type, title, message, link = null, relatedId = null) => {
  try {
    const sql = `
      INSERT INTO notifications (user_id, type, title, message, link, related_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await queryPromise(sql, [userId, type, title, message, link, relatedId]);
    console.log(`✅ Notification created for user ${userId}`);

  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};