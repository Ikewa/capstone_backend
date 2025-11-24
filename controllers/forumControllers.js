import db from "../config/db.js";
import { createNotification } from './notificationsController.js';

// Helper function for promises
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Helper function to convert relative image URLs to absolute
function convertToAbsoluteUrls(images, baseUrl = 'https://agriconnect-backend-x2h4.onrender.com') {
  if (!images) return [];
  
  try {
    const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
    return parsedImages.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    );
  } catch (e) {
    return [];
  }
}

// ==================== GET ALL QUESTIONS ====================
export const getAllQuestions = async (req, res) => {
  try {
    console.log("📋 Fetching all questions...");

    const { search, tag, location } = req.query;

    let sql = `
      SELECT
        q.*,
        u.first_name,
        u.last_name,
        u.role,
        u.location as user_location,
        COUNT(DISTINCT a.id) as answer_count
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(q.title LIKE ? OR q.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      conditions.push("q.location = ?");
      params.push(location);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " GROUP BY q.id ORDER BY q.created_at DESC";

    const questions = await queryPromise(sql, params);

    // Get tags for each question
    for (let question of questions) {
      const tags = await queryPromise(
        "SELECT tag FROM question_tags WHERE question_id = ?",
        [question.id]
      );
      question.tags = tags.map(t => t.tag);

      // Parse images and convert to absolute URLs
      question.images = convertToAbsoluteUrls(question.images);
    }

    console.log("✅ Found", questions.length, "questions");

    res.json({ questions });

  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE QUESTION ====================
export const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📋 Fetching question", id);

    // Increment views
    await queryPromise("UPDATE questions SET views = views + 1 WHERE id = ?", [id]);

    // Get question with user info
    const [question] = await queryPromise(`
      SELECT
        q.*,
        u.first_name,
        u.last_name,
        u.role,
        u.location as user_location
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?
    `, [id]);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Get tags
    const tags = await queryPromise(
      "SELECT tag FROM question_tags WHERE question_id = ?",
      [id]
    );
    question.tags = tags.map(t => t.tag);

    // Parse images and convert to absolute URLs
    question.images = convertToAbsoluteUrls(question.images);

    // Get answers with user info and role
    const answers = await queryPromise(`
      SELECT
        a.*,
        u.first_name,
        u.last_name,
        u.role,
        u.location
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC
    `, [id]);

    // Parse images for each answer and convert to absolute URLs
    for (let answer of answers) {
      answer.images = convertToAbsoluteUrls(answer.images);
    }

    question.answers = answers;

    console.log("✅ Question found with", answers.length, "answers");

    res.json({ question });

  } catch (error) {
    console.error("❌ Error fetching question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE QUESTION ====================
export const createQuestion = async (req, res) => {
  try {
    const { title, description, tags, image_url, images } = req.body;
    const user_id = req.user.id;
    const location = req.user.location;

    console.log("📝 Creating question:", { title, user_id, has_images: !!images });

    // Validation
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (title.length < 10) {
      return res.status(400).json({ message: "Title must be at least 10 characters" });
    }

    // Store images as JSON string
    const imagesJson = images ? JSON.stringify(images) : null;

    // Insert question
    const result = await queryPromise(
      "INSERT INTO questions (user_id, title, description, location, image_url, images) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, title, description, location, image_url || null, imagesJson]
    );

    const question_id = result.insertId;

    // Insert tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (let tag of tags) {
        await queryPromise(
          "INSERT INTO question_tags (question_id, tag) VALUES (?, ?)",
          [question_id, tag]
        );
      }
    }

    console.log("✅ Question created with ID:", question_id);

    res.status(201).json({
      message: "Question created successfully",
      question_id
    });

  } catch (error) {
    console.error("❌ Error creating question:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE ANSWER ====================
export const createAnswer = async (req, res) => {
  try {
    const { question_id, content, image_url, images } = req.body;
    const user_id = req.user.id;

    console.log("📝 Creating answer for question", question_id);

    // Validation
    if (!question_id || !content) {
      return res.status(400).json({ message: "Question ID and content are required" });
    }

    // Check if question exists and get question details
    const [question] = await queryPromise(
      "SELECT id, user_id, title FROM questions WHERE id = ?",
      [question_id]
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Store images as JSON string
    const imagesJson = images ? JSON.stringify(images) : null;

    // Insert answer
    const result = await queryPromise(
      "INSERT INTO answers (question_id, user_id, content, image_url, images) VALUES (?, ?, ?, ?, ?)",      
      [question_id, user_id, content, image_url || null, imagesJson]
    );

    console.log("✅ Answer created with ID:", result.insertId);

    // 🔔 CREATE NOTIFICATION for question author (if not answering own question)
    if (question.user_id !== user_id) {
      // Get answerer's name
      const [answerer] = await queryPromise(
        "SELECT first_name, last_name FROM users WHERE id = ?",
        [user_id]
      );

      if (answerer) {
        await createNotification(
          question.user_id,
          'answer',
          'New Answer to Your Question',
          `${answerer.first_name} ${answerer.last_name} answered your question: "${question.title}"`,       
          `/questions/${question_id}`,
          question_id
        );
        console.log("🔔 Notification sent to question author");
      }
    }

    res.status(201).json({
      message: "Answer created successfully",
      answer_id: result.insertId
    });

  } catch (error) {
    console.error("❌ Error creating answer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== VOTE ====================
export const vote = async (req, res) => {
  try {
    const { votable_type, votable_id, vote_type } = req.body;
    const user_id = req.user.id;

    console.log("🗳️ Vote:", { votable_type, votable_id, vote_type, user_id });

    // Validation
    if (!['question', 'answer'].includes(votable_type)) {
      return res.status(400).json({ message: "Invalid votable type" });
    }

    if (!['up', 'down'].includes(vote_type)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    // Check if user already voted
    const [existingVote] = await queryPromise(
      "SELECT * FROM votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?",
      [user_id, votable_type, votable_id]
    );

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote (toggle off)
        await queryPromise(
          "DELETE FROM votes WHERE id = ?",
          [existingVote.id]
        );

        // Update vote count
        const increment = vote_type === 'up' ? -1 : 1;
        await queryPromise(
          `UPDATE ${votable_type}s SET votes = votes + ? WHERE id = ?`,
          [increment, votable_id]
        );

        return res.json({ message: "Vote removed" });

      } else {
        // Change vote
        await queryPromise(
          "UPDATE votes SET vote_type = ? WHERE id = ?",
          [vote_type, existingVote.id]
        );

        // Update vote count (change from up to down or vice versa is +2 or -2)
        const increment = vote_type === 'up' ? 2 : -2;
        await queryPromise(
          `UPDATE ${votable_type}s SET votes = votes + ? WHERE id = ?`,
          [increment, votable_id]
        );

        return res.json({ message: "Vote changed" });
      }
    }

    // Create new vote
    await queryPromise(
      "INSERT INTO votes (user_id, votable_type, votable_id, vote_type) VALUES (?, ?, ?, ?)",
      [user_id, votable_type, votable_id, vote_type]
    );

    // Update vote count
    const increment = vote_type === 'up' ? 1 : -1;
    await queryPromise(
      `UPDATE ${votable_type}s SET votes = votes + ? WHERE id = ?`,
      [increment, votable_id]
    );

    console.log("✅ Vote recorded");

    res.json({ message: "Vote recorded successfully" });

  } catch (error) {
    console.error("❌ Error voting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== ACCEPT ANSWER ====================
export const acceptAnswer = async (req, res) => {
  try {
    const { answer_id } = req.body;
    const user_id = req.user.id;

    console.log("✅ Accepting answer:", answer_id);

    // Get the answer and question
    const [answer] = await queryPromise("SELECT * FROM answers WHERE id = ?", [answer_id]);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const [question] = await queryPromise("SELECT * FROM questions WHERE id = ?", [answer.question_id]);    

    // Only question author can accept answers
    if (question.user_id !== user_id) {
      return res.status(403).json({ message: "Only question author can accept answers" });
    }

    // Unaccept all other answers for this question
    await queryPromise(
      "UPDATE answers SET is_accepted = FALSE WHERE question_id = ?",
      [answer.question_id]
    );

    // Accept this answer
    await queryPromise(
      "UPDATE answers SET is_accepted = TRUE WHERE id = ?",
      [answer_id]
    );

    console.log("✅ Answer accepted");

    res.json({ message: "Answer accepted successfully" });

  } catch (error) {
    console.error("❌ Error accepting answer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};