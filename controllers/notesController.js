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

// ==================== GET ALL USER NOTES ====================
export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { group_id } = req.query;

    console.log(`📝 Fetching notes for user ${userId}`, group_id ? `in group ${group_id}` : '(all notes)');

    let sql = `SELECT * FROM user_notes WHERE user_id = ?`;
    let params = [userId];

    if (group_id) {
      // Get notes for specific group
      sql += ` AND group_id = ?`;
      params.push(group_id);
    } else {
      // Get only general notes (not group-specific)
      sql += ` AND group_id IS NULL`;
    }

    sql += ` ORDER BY updated_at DESC`;

    const notes = await queryPromise(sql, params);

    console.log(`✅ Found ${notes.length} notes`);

    res.json({ notes });

  } catch (error) {
    console.error("💥 Error fetching notes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE NOTE ====================
export const getNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`📝 Fetching note ${id} for user ${userId}`);

    const [note] = await queryPromise(
      "SELECT * FROM user_notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("✅ Note found");

    res.json({ note });

  } catch (error) {
    console.error("💥 Error fetching note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE NOTE ====================
export const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, group_id } = req.body;

    console.log(`📝 Creating note for user ${userId}`, group_id ? `in group ${group_id}` : '(general)');

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // If group_id provided, verify user is member
    if (group_id) {
      const [membership] = await queryPromise(
        "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
        [group_id, userId]
      );

      if (!membership) {
        return res.status(403).json({ message: "You must be a member of this group to create notes for it" });
      }
    }

    const result = await queryPromise(
      "INSERT INTO user_notes (user_id, title, content, group_id) VALUES (?, ?, ?, ?)",
      [userId, title.trim(), content.trim(), group_id || null]
    );

    const [note] = await queryPromise(
      "SELECT * FROM user_notes WHERE id = ?",
      [result.insertId]
    );

    console.log("✅ Note created:", result.insertId);

    res.status(201).json({ message: "Note created successfully", note });

  } catch (error) {
    console.error("💥 Error creating note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE NOTE ====================
export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content } = req.body;

    console.log(`📝 Updating note ${id} for user ${userId}`);

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Check if note belongs to user
    const [existing] = await queryPromise(
      "SELECT * FROM user_notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update note (don't allow changing group_id)
    await queryPromise(
      "UPDATE user_notes SET title = ?, content = ? WHERE id = ?",
      [title.trim(), content.trim(), id]
    );

    const [note] = await queryPromise(
      "SELECT * FROM user_notes WHERE id = ?",
      [id]
    );

    console.log("✅ Note updated");

    res.json({ message: "Note updated successfully", note });

  } catch (error) {
    console.error("💥 Error updating note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE NOTE ====================
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`📝 Deleting note ${id} for user ${userId}`);

    // Check if note belongs to user
    const [existing] = await queryPromise(
      "SELECT * FROM user_notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete note
    await queryPromise(
      "DELETE FROM user_notes WHERE id = ?",
      [id]
    );

    console.log("✅ Note deleted");

    res.json({ message: "Note deleted successfully" });

  } catch (error) {
    console.error("💥 Error deleting note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};