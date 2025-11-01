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

// ==================== GET ALL GROUPS ====================
export const getAllGroups = async (req, res) => {
  try {
    const { topic, location, search } = req.query;

    console.log("📋 Fetching discussion groups with filters:", { topic, location, search });

    let sql = `
      SELECT 
        dg.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.role as creator_role,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT msg.id) as message_count,
        MAX(msg.created_at) as last_activity,
        (SELECT content FROM group_messages WHERE group_id = dg.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = (SELECT user_id FROM group_messages WHERE group_id = dg.id ORDER BY created_at DESC LIMIT 1)) as last_message_user
      FROM discussion_groups dg
      LEFT JOIN users u ON dg.created_by = u.id
      LEFT JOIN group_members gm ON dg.id = gm.group_id
      LEFT JOIN group_messages msg ON dg.id = msg.group_id
      WHERE 1=1
    `;

    const params = [];

    if (topic) {
      sql += " AND dg.topic = ?";
      params.push(topic);
    }

    if (location && location !== 'All States') {
      sql += " AND dg.location = ?";
      params.push(location);
    }

    if (search) {
      sql += " AND (dg.name LIKE ? OR dg.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " GROUP BY dg.id ORDER BY last_activity DESC, dg.created_at DESC";

    const groups = await queryPromise(sql, params);

    console.log(`✅ Found ${groups.length} discussion groups`);

    res.json({ groups });

  } catch (error) {
    console.error("💥 Error fetching groups:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE GROUP ====================
export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📋 Fetching group ${id} for user ${userId}`);

    // Get group details
    const [group] = await queryPromise(`
      SELECT 
        dg.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.role as creator_role,
        u.avatar_url as creator_avatar,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT msg.id) as message_count
      FROM discussion_groups dg
      LEFT JOIN users u ON dg.created_by = u.id
      LEFT JOIN group_members gm ON dg.id = gm.group_id
      LEFT JOIN group_messages msg ON dg.id = msg.group_id
      WHERE dg.id = ?
      GROUP BY dg.id
    `, [id]);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    group.is_member = !!membership;
    group.is_admin = membership?.is_admin || false;

    console.log("✅ Group details loaded");

    res.json({ group });

  } catch (error) {
    console.error("💥 Error fetching group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE GROUP ====================
export const createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, description, icon, topic, location } = req.body;

    console.log("✨ Creating new discussion group:", name);

    // Only Extension Officers can create groups
    if (userRole !== 'Extension Officer') {
      return res.status(403).json({ message: "Only Extension Officers can create groups" });
    }

    if (!name || !topic) {
      return res.status(400).json({ message: "Name and topic are required" });
    }

    // Create group
    const result = await queryPromise(
      `INSERT INTO discussion_groups (name, description, icon, topic, location, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, icon || '💬', topic, location || 'All States', userId]
    );

    const groupId = result.insertId;

    // Auto-join creator as admin
    await queryPromise(
      "INSERT INTO group_members (group_id, user_id, is_admin) VALUES (?, ?, TRUE)",
      [groupId, userId]
    );

    console.log(`✅ Group created with ID: ${groupId}`);

    res.status(201).json({ 
      message: "Group created successfully",
      group_id: groupId 
    });

  } catch (error) {
    console.error("💥 Error creating group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE GROUP ====================
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, icon, topic, location } = req.body;

    console.log(`📝 Updating group ${id}`);

    // Check if user is admin
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [id, userId]
    );

    if (!membership) {
      return res.status(403).json({ message: "Only group admins can update the group" });
    }

    // Update group
    await queryPromise(
      `UPDATE discussion_groups 
       SET name = ?, description = ?, icon = ?, topic = ?, location = ?
       WHERE id = ?`,
      [name, description, icon, topic, location, id]
    );

    console.log("✅ Group updated");

    res.json({ message: "Group updated successfully" });

  } catch (error) {
    console.error("💥 Error updating group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE GROUP ====================
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Deleting group ${id}`);

    // Check if user is admin
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [id, userId]
    );

    if (!membership) {
      return res.status(403).json({ message: "Only group admins can delete the group" });
    }

    // Delete group (cascade will delete messages and members)
    await queryPromise("DELETE FROM discussion_groups WHERE id = ?", [id]);

    console.log("✅ Group deleted");

    res.json({ message: "Group deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET GROUP MESSAGES ====================
export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`💬 Fetching messages for group ${id}`);

    // Check if user is member
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    if (!membership) {
      // Auto-join user when viewing
      await queryPromise(
        "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
        [id, userId]
      );
      console.log(`✅ User ${userId} auto-joined group ${id}`);
    }

    // Get all messages with user info and reaction counts
    const messages = await queryPromise(`
      SELECT 
        msg.id,
        msg.group_id,
        msg.user_id,
        msg.parent_message_id,
        msg.content,
        msg.created_at,
        msg.updated_at,
        u.first_name,
        u.last_name,
        u.role,
        u.avatar_url,
        COUNT(DISTINCT r.id) as reaction_count,
        SUM(CASE WHEN r.user_id = ? THEN 1 ELSE 0 END) as user_has_reacted,
        (SELECT COUNT(*) FROM group_messages WHERE parent_message_id = msg.id) as reply_count
      FROM group_messages msg
      JOIN users u ON msg.user_id = u.id
      LEFT JOIN message_reactions r ON msg.id = r.message_id
      WHERE msg.group_id = ?
      GROUP BY msg.id
      ORDER BY msg.created_at ASC
    `, [userId, id]);

    console.log(`✅ Found ${messages.length} messages`);

    res.json({ messages });

  } catch (error) {
    console.error("💥 Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== POST MESSAGE ====================
export const postMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, parent_message_id } = req.body;

    console.log(`💬 Posting message to group ${id}`);

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Check if user is member
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    if (!membership) {
      return res.status(403).json({ message: "You must join the group first" });
    }

    // If replying, check if parent message exists
    if (parent_message_id) {
      const [parentMsg] = await queryPromise(
        "SELECT * FROM group_messages WHERE id = ? AND group_id = ?",
        [parent_message_id, id]
      );

      if (!parentMsg) {
        return res.status(404).json({ message: "Parent message not found" });
      }
    }

    // Insert message
    const result = await queryPromise(
      "INSERT INTO group_messages (group_id, user_id, parent_message_id, content) VALUES (?, ?, ?, ?)",
      [id, userId, parent_message_id || null, content.trim()]
    );

    // Get the created message with user info
    const [message] = await queryPromise(`
      SELECT 
        msg.*,
        u.first_name,
        u.last_name,
        u.role,
        u.avatar_url
      FROM group_messages msg
      JOIN users u ON msg.user_id = u.id
      WHERE msg.id = ?
    `, [result.insertId]);

    console.log("✅ Message posted");

    res.status(201).json({ message });

  } catch (error) {
    console.error("💥 Error posting message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== REACT TO MESSAGE ====================
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    console.log(`👍 User ${userId} reacting to message ${messageId}`);

    // Check if already reacted
    const [existing] = await queryPromise(
      "SELECT * FROM message_reactions WHERE message_id = ? AND user_id = ?",
      [messageId, userId]
    );

    if (existing) {
      // Remove reaction
      await queryPromise(
        "DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?",
        [messageId, userId]
      );
      console.log("✅ Reaction removed");
      return res.json({ message: "Reaction removed", action: "removed" });
    }

    // Add reaction
    await queryPromise(
      "INSERT INTO message_reactions (message_id, user_id) VALUES (?, ?)",
      [messageId, userId]
    );

    console.log("✅ Reaction added");

    res.json({ message: "Reaction added", action: "added" });

  } catch (error) {
    console.error("💥 Error reacting to message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE MESSAGE ====================
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Deleting message ${messageId}`);

    // Get message details
    const [message] = await queryPromise(
      "SELECT * FROM group_messages WHERE id = ?",
      [messageId]
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is message author or group admin
    const isAuthor = message.user_id === userId;

    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [message.group_id, userId]
    );

    if (!isAuthor && !membership) {
      return res.status(403).json({ message: "Only message author or group admin can delete messages" });
    }

    // Delete message (cascade will delete replies and reactions)
    await queryPromise("DELETE FROM group_messages WHERE id = ?", [messageId]);

    console.log("✅ Message deleted");

    res.json({ message: "Message deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET GROUP MEMBERS ====================
export const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`👥 Fetching members for group ${id}`);

    const members = await queryPromise(`
      SELECT 
        gm.id,
        gm.is_admin,
        gm.joined_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.role,
        u.avatar_url,
        COUNT(DISTINCT msg.id) as message_count
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      LEFT JOIN group_messages msg ON msg.user_id = u.id AND msg.group_id = gm.group_id
      WHERE gm.group_id = ?
      GROUP BY gm.id
      ORDER BY gm.is_admin DESC, gm.joined_at ASC
    `, [id]);

    console.log(`✅ Found ${members.length} members`);

    res.json({ members });

  } catch (error) {
    console.error("💥 Error fetching members:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== JOIN GROUP ====================
export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`👤 User ${userId} joining group ${id}`);

    // Check if already member
    const [existing] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing) {
      return res.status(400).json({ message: "Already a member of this group" });
    }

    // Join group
    await queryPromise(
      "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
      [id, userId]
    );

    console.log("✅ User joined group");

    res.json({ message: "Successfully joined group" });

  } catch (error) {
    console.error("💥 Error joining group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== LEAVE GROUP ====================
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`👋 User ${userId} leaving group ${id}`);

    // Check if user is the only admin
    const [membership] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    if (!membership) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    if (membership.is_admin) {
      const adminCount = await queryPromise(
        "SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND is_admin = TRUE",
        [id]
      );

      if (adminCount[0].count === 1) {
        return res.status(400).json({ message: "Cannot leave: You are the only admin. Make someone else admin first or delete the group." });
      }
    }

    // Leave group
    await queryPromise(
      "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId]
    );

    console.log("✅ User left group");

    res.json({ message: "Successfully left group" });

  } catch (error) {
    console.error("💥 Error leaving group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== REMOVE MEMBER ====================
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    console.log(`🚫 Removing member ${memberId} from group ${id}`);

    // Check if user is admin
    const [adminCheck] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [id, userId]
    );

    if (!adminCheck) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    // Cannot remove yourself
    if (userId == memberId) {
      return res.status(400).json({ message: "Use 'Leave Group' to remove yourself" });
    }

    // Remove member
    await queryPromise(
      "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, memberId]
    );

    console.log("✅ Member removed");

    res.json({ message: "Member removed successfully" });

  } catch (error) {
    console.error("💥 Error removing member:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== MAKE ADMIN ====================
export const makeAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    console.log(`👑 Making member ${memberId} admin in group ${id}`);

    // Check if user is admin
    const [adminCheck] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [id, userId]
    );

    if (!adminCheck) {
      return res.status(403).json({ message: "Only admins can promote members" });
    }

    // Make member admin
    await queryPromise(
      "UPDATE group_members SET is_admin = TRUE WHERE group_id = ? AND user_id = ?",
      [id, memberId]
    );

    console.log("✅ Member promoted to admin");

    res.json({ message: "Member promoted to admin" });

  } catch (error) {
    console.error("💥 Error promoting member:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== REMOVE ADMIN ====================
export const removeAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    console.log(`👤 Removing admin status from member ${memberId} in group ${id}`);

    // Check if user is admin
    const [adminCheck] = await queryPromise(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_admin = TRUE",
      [id, userId]
    );

    if (!adminCheck) {
      return res.status(403).json({ message: "Only admins can demote admins" });
    }

    // Check if trying to demote last admin
    const adminCount = await queryPromise(
      "SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND is_admin = TRUE",
      [id]
    );

    if (adminCount[0].count === 1) {
      return res.status(400).json({ message: "Cannot remove the last admin" });
    }

    // Remove admin status
    await queryPromise(
      "UPDATE group_members SET is_admin = FALSE WHERE group_id = ? AND user_id = ?",
      [id, memberId]
    );

    console.log("✅ Admin status removed");

    res.json({ message: "Admin status removed" });

  } catch (error) {
    console.error("💥 Error removing admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};