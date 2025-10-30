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

// ==================== GET OR CREATE CONVERSATION ====================
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { other_user_id } = req.body;

    console.log("💬 Getting/creating conversation between", userId, "and", other_user_id);

    if (!other_user_id) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    if (userId == other_user_id) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check if conversation exists
    const [existingConversation] = await queryPromise(
      `SELECT * FROM conversations 
       WHERE (user1_id = ? AND user2_id = ?) 
          OR (user1_id = ? AND user2_id = ?)`,
      [userId, other_user_id, other_user_id, userId]
    );

    if (existingConversation) {
      console.log("✅ Conversation exists:", existingConversation.id);
      return res.json({ conversation_id: existingConversation.id });
    }

    // Create new conversation
    const result = await queryPromise(
      "INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)",
      [Math.min(userId, other_user_id), Math.max(userId, other_user_id)]
    );

    console.log("✅ New conversation created:", result.insertId);

    res.json({ conversation_id: result.insertId });

  } catch (error) {
    console.error("💥 Error getting/creating conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET ALL CONVERSATIONS ====================
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("💬 Fetching conversations for user:", userId);

    const conversations = await queryPromise(
      `SELECT 
        c.id,
        c.updated_at,
        CASE 
          WHEN c.user1_id = ? THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN c.user1_id = ? THEN u2.first_name
          ELSE u1.first_name
        END as other_user_first_name,
        CASE 
          WHEN c.user1_id = ? THEN u2.last_name
          ELSE u1.last_name
        END as other_user_last_name,
        CASE 
          WHEN c.user1_id = ? THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        CASE 
          WHEN c.user1_id = ? THEN u2.role
          ELSE u1.role
        END as other_user_role,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId]
    );

    console.log(`✅ Found ${conversations.length} conversations`);

    res.json({ conversations });

  } catch (error) {
    console.error("💥 Error fetching conversations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ==================== GET UNREAD COUNT ====================
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await queryPromise(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE",
      [userId]
    );

    res.json({ unread_count: result.count });

  } catch (error) {
    console.error("💥 Error getting unread count:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== BLOCK USER ====================
export const blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_id } = req.body;

    console.log("🚫 Blocking user:", user_id);

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId == user_id) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    // Check if already blocked
    const [existing] = await queryPromise(
      "SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
      [userId, user_id]
    );

    if (existing) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Block user
    await queryPromise(
      "INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)",
      [userId, user_id]
    );

    console.log("✅ User blocked successfully");

    res.json({ message: "User blocked successfully" });

  } catch (error) {
    console.error("💥 Error blocking user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UNBLOCK USER ====================
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_id } = req.body;

    console.log("✅ Unblocking user:", user_id);

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Unblock user
    await queryPromise(
      "DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
      [userId, user_id]
    );

    console.log("✅ User unblocked successfully");

    res.json({ message: "User unblocked successfully" });

  } catch (error) {
    console.error("💥 Error unblocking user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET BLOCKED USERS ====================
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🚫 Fetching blocked users for:", userId);

    const blockedUsers = await queryPromise(
      `SELECT 
        bu.id,
        bu.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.role
      FROM blocked_users bu
      JOIN users u ON bu.blocked_id = u.id
      WHERE bu.blocker_id = ?
      ORDER BY bu.created_at DESC`,
      [userId]
    );

    console.log(`✅ Found ${blockedUsers.length} blocked users`);

    res.json({ blocked_users: blockedUsers });

  } catch (error) {
    console.error("💥 Error fetching blocked users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CHECK IF BLOCKED ====================
export const checkIfBlocked = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_id } = req.params;

    // Check both directions
    const [blocked] = await queryPromise(
      `SELECT * FROM blocked_users 
       WHERE (blocker_id = ? AND blocked_id = ?) 
          OR (blocker_id = ? AND blocked_id = ?)`,
      [userId, user_id, user_id, userId]
    );

    const isBlocked = !!blocked;
    const blockedByMe = blocked && blocked.blocker_id == userId;
    const blockedByThem = blocked && blocked.blocker_id == user_id;

    res.json({ 
      is_blocked: isBlocked,
      blocked_by_me: blockedByMe,
      blocked_by_them: blockedByThem
    });

  } catch (error) {
    console.error("💥 Error checking block status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE CONVERSATION ====================
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversation_id } = req.params;

    console.log("🗑️ Deleting conversation:", conversation_id);

    // Verify user is part of conversation
    const [conversation] = await queryPromise(
      "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
      [conversation_id, userId, userId]
    );

    if (!conversation) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete conversation (messages will cascade delete)
    await queryPromise(
      "DELETE FROM conversations WHERE id = ?",
      [conversation_id]
    );

    console.log("✅ Conversation deleted successfully");

    res.json({ message: "Conversation deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE getMessages - CHECK BLOCKING ====================
// Replace the existing getMessages function with this updated version:
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversation_id } = req.params;

    console.log("💬 Fetching messages for conversation:", conversation_id);

    // Verify user is part of conversation
    const [conversation] = await queryPromise(
      "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
      [conversation_id, userId, userId]
    );

    if (!conversation) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get other user ID
    const otherUserId = conversation.user1_id == userId ? conversation.user2_id : conversation.user1_id;

    // Check if blocked
    const [blocked] = await queryPromise(
      `SELECT * FROM blocked_users 
       WHERE (blocker_id = ? AND blocked_id = ?) 
          OR (blocker_id = ? AND blocked_id = ?)`,
      [userId, otherUserId, otherUserId, userId]
    );

    if (blocked) {
      return res.status(403).json({ 
        message: "Cannot view messages. User is blocked.",
        is_blocked: true
      });
    }

    // Get messages
    const messages = await queryPromise(
      `SELECT 
        m.*,
        s.first_name as sender_first_name,
        s.last_name as sender_last_name,
        s.avatar_url as sender_avatar,
        r.first_name as receiver_first_name,
        r.last_name as receiver_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC`,
      [conversation_id]
    );

    // Mark messages as read
    await queryPromise(
      "UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND receiver_id = ?",
      [conversation_id, userId]
    );

    console.log(`✅ Found ${messages.length} messages`);

    res.json({ messages });

  } catch (error) {
    console.error("💥 Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE sendMessage - CHECK BLOCKING ====================
// Replace the existing sendMessage function with this updated version:
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversation_id, receiver_id, content } = req.body;

    console.log("💬 Sending message in conversation:", conversation_id);

    if (!content || !conversation_id || !receiver_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify user is part of conversation
    const [conversation] = await queryPromise(
      "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
      [conversation_id, userId, userId]
    );

    if (!conversation) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if blocked
    const [blocked] = await queryPromise(
      `SELECT * FROM blocked_users 
       WHERE (blocker_id = ? AND blocked_id = ?) 
          OR (blocker_id = ? AND blocked_id = ?)`,
      [userId, receiver_id, receiver_id, userId]
    );

    if (blocked) {
      return res.status(403).json({ 
        message: "Cannot send message. User is blocked.",
        is_blocked: true
      });
    }

    // Insert message
    const result = await queryPromise(
      "INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)",
      [conversation_id, userId, receiver_id, content]
    );

    // Update conversation timestamp
    await queryPromise(
      "UPDATE conversations SET updated_at = NOW() WHERE id = ?",
      [conversation_id]
    );

    // Get the created message with user info
    const [message] = await queryPromise(
      `SELECT 
        m.*,
        s.first_name as sender_first_name,
        s.last_name as sender_last_name,
        s.avatar_url as sender_avatar
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      WHERE m.id = ?`,
      [result.insertId]
    );

    console.log("✅ Message sent:", result.insertId);

    res.json({ message });

  } catch (error) {
    console.error("💥 Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};