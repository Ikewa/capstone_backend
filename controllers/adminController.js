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

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Admin: Fetching dashboard stats");

    // Get total users by role
    const [totalUsers] = await queryPromise("SELECT COUNT(*) as count FROM users");
    const [farmers] = await queryPromise("SELECT COUNT(*) as count FROM users WHERE role = 'Farmer'");
    const [officers] = await queryPromise("SELECT COUNT(*) as count FROM users WHERE role = 'Extension Officer'");

    // Get content stats
    const [totalQuestions] = await queryPromise("SELECT COUNT(*) as count FROM questions");
    const [totalAnswers] = await queryPromise("SELECT COUNT(*) as count FROM answers");
    const [totalEvents] = await queryPromise("SELECT COUNT(*) as count FROM events");
    const [totalGroups] = await queryPromise("SELECT COUNT(*) as count FROM discussion_groups");
    const [totalNotes] = await queryPromise("SELECT COUNT(*) as count FROM user_notes");

    // Get activity stats (last 30 days)
    const [activeToday] = await queryPromise(
      "SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE DATE(activity_date) = CURDATE()"
    );
    
    const [activeWeek] = await queryPromise(
      "SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    
    const [activeMonth] = await queryPromise(
      "SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    // Get recent registrations (last 30 days by day)
    const recentRegistrations = await queryPromise(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get popular topics
    const popularTopics = await queryPromise(`
      SELECT topic, COUNT(*) as count 
      FROM discussion_groups 
      GROUP BY topic 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Get top contributors
    const topContributors = await queryPromise(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        u.avatar_url,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT a.id) as answer_count,
        COUNT(DISTINCT q.id) + COUNT(DISTINCT a.id) as total_contributions
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id
      LEFT JOIN answers a ON u.id = a.user_id
      GROUP BY u.id
      ORDER BY total_contributions DESC
      LIMIT 10
    `);

    const stats = {
      users: {
        total: totalUsers.count,
        farmers: farmers.count,
        officers: officers.count
      },
      content: {
        questions: totalQuestions.count,
        answers: totalAnswers.count,
        events: totalEvents.count,
        groups: totalGroups.count,
        notes: totalNotes.count
      },
      activity: {
        today: activeToday.count || 0,
        week: activeWeek.count || 0,
        month: activeMonth.count || 0
      },
      charts: {
        recentRegistrations,
        popularTopics,
        topContributors
      }
    };

    console.log("✅ Dashboard stats loaded");
    res.json({ stats });

  } catch (error) {
    console.error("💥 Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    console.log("👥 Admin: Fetching all users");

    let sql = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        location,
        avatar_url,
        bio,
        is_admin,
        created_at,
        (SELECT COUNT(*) FROM questions WHERE user_id = users.id) as question_count,
        (SELECT COUNT(*) FROM answers WHERE user_id = users.id) as answer_count,
        (SELECT COUNT(*) FROM group_members WHERE user_id = users.id) as group_count
      FROM users
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }

    sql += ` ORDER BY created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const users = await queryPromise(sql, params);

    let countSql = "SELECT COUNT(*) as count FROM users WHERE 1=1";
    const countParams = [];

    if (search) {
      countSql += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      countSql += " AND role = ?";
      countParams.push(role);
    }

    const [{ count: totalCount }] = await queryPromise(countSql, countParams);

    console.log(`✅ Found ${users.length} users out of ${totalCount} total`);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalUsers: totalCount,
        hasMore: offset + users.length < totalCount
      }
    });

  } catch (error) {
    console.error("💥 Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE USER ====================
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`👤 Admin: Fetching user ${id}`);

    const users = await queryPromise("SELECT * FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const [{ count: question_count }] = await queryPromise(
      "SELECT COUNT(*) as count FROM questions WHERE user_id = ?", [id]
    );

    const [{ count: answer_count }] = await queryPromise(
      "SELECT COUNT(*) as count FROM answers WHERE user_id = ?", [id]
    );

    const [{ count: group_count }] = await queryPromise(
      "SELECT COUNT(*) as count FROM group_members WHERE user_id = ?", [id]
    );

    const recentQuestions = await queryPromise(
      "SELECT id, title, created_at FROM questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", [id]
    );

    const recentAnswers = await queryPromise(`
      SELECT a.id, a.content, a.created_at, q.title as question_title
      FROM answers a
      LEFT JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [id]);

    console.log("✅ User details loaded");

    res.json({
      user: { ...user, question_count, answer_count, group_count },
      activity: { recentQuestions, recentAnswers }
    });

  } catch (error) {
    console.error("💥 Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE USER ====================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, location, bio } = req.body;

    console.log(`📝 Admin: Updating user ${id}`);

    const [existing] = await queryPromise("SELECT * FROM users WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    await queryPromise(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, location = ?, bio = ? WHERE id = ?`,
      [first_name, last_name, email, phone || null, role, location, bio || null, id]
    );

    console.log("✅ User updated");
    res.json({ message: "User updated successfully" });

  } catch (error) {
    console.error("💥 Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE USER ====================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting user ${id}`);

    const [existing] = await queryPromise("SELECT * FROM users WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await queryPromise("DELETE FROM users WHERE id = ?", [id]);

    console.log("✅ User deleted");
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== MAKE USER ADMIN ====================
export const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`👑 Admin: Making user ${id} an admin`);

    await queryPromise("UPDATE users SET is_admin = TRUE WHERE id = ?", [id]);

    console.log("✅ User promoted to admin");
    res.json({ message: "User promoted to admin" });

  } catch (error) {
    console.error("💥 Error making admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== REMOVE ADMIN ====================
export const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`👤 Admin: Removing admin status from user ${id}`);

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: "Cannot remove your own admin status" });
    }

    await queryPromise("UPDATE users SET is_admin = FALSE WHERE id = ?", [id]);

    console.log("✅ Admin status removed");
    res.json({ message: "Admin status removed" });

  } catch (error) {
    console.error("💥 Error removing admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE QUESTION ====================
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting question ${id}`);

    await queryPromise("DELETE FROM questions WHERE id = ?", [id]);

    console.log("✅ Question deleted");
    res.json({ message: "Question deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE ANSWER ====================
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting answer ${id}`);

    await queryPromise("DELETE FROM answers WHERE id = ?", [id]);

    console.log("✅ Answer deleted");
    res.json({ message: "Answer deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting answer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE EVENT ====================
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting event ${id}`);

    await queryPromise("DELETE FROM events WHERE id = ?", [id]);

    console.log("✅ Event deleted");
    res.json({ message: "Event deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE DISCUSSION GROUP ====================
export const deleteDiscussionGroup = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting discussion group ${id}`);

    await queryPromise("DELETE FROM discussion_groups WHERE id = ?", [id]);

    console.log("✅ Discussion group deleted");
    res.json({ message: "Discussion group deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting discussion group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE NEW ADMIN ====================
export const createAdmin = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, location } = req.body;

    console.log(`👑 Admin: Creating new admin user`);

    if (!email || !password || !first_name || !last_name || !role || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUsers = await queryPromise("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const result = await queryPromise(
      "INSERT INTO users (first_name, last_name, email, role, location, password, is_admin) VALUES (?, ?, ?, ?, ?, ?, TRUE)",
      [first_name, last_name, email, role, location, hashedPassword]
    );

    console.log("✅ Admin user created with ID:", result.insertId);

    res.status(201).json({ 
      message: "Admin user created successfully",
      userId: result.insertId 
    });

  } catch (error) {
    console.error("💥 Error creating admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET ALL EVENTS FOR ADMIN ====================
export const getAllEvents = async (req, res) => {
  try {
    console.log("📅 Admin: Fetching all events");

    const events = await queryPromise(`
      SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date DESC
    `);

    console.log(`✅ Found ${events.length} events`);

    res.json(events);

  } catch (error) {
    console.error("💥 Error fetching events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET ALL GROUPS FOR ADMIN ====================
export const getAllGroups = async (req, res) => {
  try {
    console.log("👥 Admin: Fetching all groups");

    const groups = await queryPromise(`
      SELECT 
        dg.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as member_count
      FROM discussion_groups dg
      LEFT JOIN users u ON dg.created_by = u.id
      ORDER BY dg.created_at DESC
    `);

    console.log(`✅ Found ${groups.length} groups`);

    res.json(groups);

  } catch (error) {
    console.error("💥 Error fetching groups:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ==================== DELETE CROP ====================
export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin: Deleting crop ${id}`);

    await queryPromise("DELETE FROM crops WHERE id = ?", [id]);

    console.log("✅ Crop deleted");

    res.json({ message: "Crop deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting crop:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET EVENT PARTICIPANTS ====================
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log(`👥 Admin: Fetching participants for event ${eventId}`);

    const participants = await queryPromise(`
      SELECT 
        ep.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.location
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = ?
      ORDER BY ep.registered_at DESC
    `, [eventId]);

    console.log(`✅ Found ${participants.length} participants`);

    res.json({ participants });

  } catch (error) {
    console.error("💥 Error fetching participants:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== REMOVE EVENT PARTICIPANT ====================
export const removeEventParticipant = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    console.log(`🗑️ Admin: Removing user ${userId} from event ${eventId}`);

    await queryPromise(
      "DELETE FROM event_participants WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );

    console.log("✅ Participant removed");

    res.json({ message: "Participant removed successfully" });

  } catch (error) {
    console.error("💥 Error removing participant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};