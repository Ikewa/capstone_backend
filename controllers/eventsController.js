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

// ==================== GET ALL EVENTS ====================
export const getAllEvents = async (req, res) => {
  try {
    console.log("📅 Fetching all events...");

    const { search, location, event_type } = req.query;

    let sql = `
      SELECT 
        e.*,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT er.id) as attendee_count
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(e.title LIKE ? OR e.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      conditions.push("e.location = ?");
      params.push(location);
    }

    if (event_type) {
      conditions.push("e.event_type = ?");
      params.push(event_type);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " GROUP BY e.id ORDER BY e.event_date ASC, e.event_time ASC";

    const events = await queryPromise(sql, params);

    console.log("✅ Found", events.length, "events");

    res.json({ events });

  } catch (error) {
    console.error("💥 Error fetching events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE EVENT ====================
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📅 Fetching event", id);

    // Get event with user info
    const [event] = await queryPromise(`
      SELECT 
        e.*,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT er.id) as attendee_count
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get list of attendees
    const attendees = await queryPromise(`
      SELECT 
        u.first_name,
        u.last_name,
        u.role,
        u.location,
        er.registered_at
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ? AND er.status = 'registered'
      ORDER BY er.registered_at DESC
    `, [id]);

    event.attendees = attendees;

    console.log("✅ Event found with", attendees.length, "attendees");

    res.json({ event });

  } catch (error) {
    console.error("💥 Error fetching event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE EVENT (OFFICER) ====================
export const createEvent = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      title,
      description,
      event_date,
      event_time,
      location,
      venue,
      event_type,
      max_attendees,
      image_url
    } = req.body;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can create events' 
      });
    }

    // Validation
    if (!title || !description || !event_date || !event_time || !location) {
      return res.status(400).json({ message: "Title, description, date, time, and location are required" });
    }

    // Insert event
    const result = await queryPromise(
      "INSERT INTO events (user_id, title, description, event_date, event_time, location, venue, event_type, max_attendees, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, title, description, event_date, event_time, location, venue || null, event_type || 'Workshop', max_attendees || null, image_url || null]
    );

    console.log("✅ Event created with ID:", result.insertId);

    res.status(201).json({ 
      message: "Event created successfully",
      event_id: result.insertId
    });

  } catch (error) {
    console.error("💥 Error creating event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET MY EVENTS (OFFICER) ====================
export const getMyEvents = async (req, res) => {
  try {
    console.log("📅 Fetching officer's events...");
    
    const officer_id = req.user.id;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can view their events' 
      });
    }

    const sql = `
      SELECT 
        e.*,
        COUNT(DISTINCT er.id) as registration_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
      WHERE e.user_id = ?
      GROUP BY e.id
      ORDER BY e.event_date DESC, e.event_time DESC
    `;

    const events = await queryPromise(sql, [officer_id]);

    console.log(`✅ Found ${events.length} events`);

    res.json({
      count: events.length,
      events: events
    });

  } catch (error) {
    console.error('❌ Error fetching officer events:', error);
    res.status(500).json({ 
      message: 'Error fetching events', 
      error: error.message 
    });
  }
};

// ==================== GET EVENT REGISTRATIONS (OFFICER) ====================
export const getEventRegistrations = async (req, res) => {
  try {
    console.log("📋 Fetching event registrations...");
    
    const { id } = req.params;
    const officer_id = req.user.id;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can view registrations' 
      });
    }

    // Check if officer created this event
    const eventCheck = await queryPromise(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [id, officer_id]
    );

    if (eventCheck.length === 0) {
      return res.status(403).json({ 
        message: 'You can only view registrations for events you created' 
      });
    }

    const sql = `
      SELECT 
        er.*,
        u.first_name,
        u.last_name,
        u.email,
        u.location as user_location
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ? AND er.status = 'registered'
      ORDER BY er.registered_at DESC
    `;

    const registrations = await queryPromise(sql, [id]);

    console.log(`✅ Found ${registrations.length} registrations`);

    res.json({
      count: registrations.length,
      registrations: registrations
    });

  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    res.status(500).json({ 
      message: 'Error fetching registrations', 
      error: error.message 
    });
  }
};

// ==================== UPDATE EVENT (OFFICER) ====================
export const updateEvent = async (req, res) => {
  try {
    console.log("✏️ Updating event...");
    
    const { id } = req.params;
    const officer_id = req.user.id;

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees,
      event_type
    } = req.body;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can update events' 
      });
    }

    // Check if officer created this event
    const eventCheck = await queryPromise(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [id, officer_id]
    );

    if (eventCheck.length === 0) {
      return res.status(403).json({ 
        message: 'You can only update events you created' 
      });
    }

    const sql = `
      UPDATE events 
      SET title = ?, description = ?, event_date = ?, event_time = ?, 
          location = ?, max_attendees = ?, event_type = ?
      WHERE id = ?
    `;

    await queryPromise(sql, [
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees || null,
      event_type || 'Workshop',
      id
    ]);

    console.log("✅ Event updated");

    res.json({
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({ 
      message: 'Error updating event', 
      error: error.message 
    });
  }
};

// ==================== DELETE EVENT (OFFICER) ====================
export const deleteEvent = async (req, res) => {
  try {
    console.log("🗑️ Deleting event...");
    
    const { id } = req.params;
    const officer_id = req.user.id;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can delete events' 
      });
    }

    // Check if officer created this event
    const eventCheck = await queryPromise(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [id, officer_id]
    );

    if (eventCheck.length === 0) {
      return res.status(403).json({ 
        message: 'You can only delete events you created' 
      });
    }

    // Delete event (registrations will cascade delete if FK is set)
    await queryPromise('DELETE FROM events WHERE id = ?', [id]);

    console.log("✅ Event deleted");

    res.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({ 
      message: 'Error deleting event', 
      error: error.message 
    });
  }
};

// ==================== REGISTER FOR EVENT ====================
export const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    console.log("📝 Registering user", user_id, "for event", event_id);

    // Check if event exists and get event details
    const [event] = await queryPromise(
      "SELECT id, title, event_date, event_time, location, max_attendees FROM events WHERE id = ?", 
      [event_id]
    );
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already registered
    const [existingReg] = await queryPromise(
      "SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?",
      [event_id, user_id]
    );

    if (existingReg && existingReg.status === 'registered') {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    // Check if event is full
    if (event.max_attendees) {
      const [count] = await queryPromise(
        "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = 'registered'",
        [event_id]
      );
      
      if (count.count >= event.max_attendees) {
        return res.status(400).json({ message: "Event is full" });
      }
    }

    // Register or update registration
    if (existingReg) {
      await queryPromise(
        "UPDATE event_registrations SET status = 'registered', registered_at = NOW() WHERE id = ?",
        [existingReg.id]
      );
    } else {
      await queryPromise(
        "INSERT INTO event_registrations (event_id, user_id, status) VALUES (?, ?, 'registered')",
        [event_id, user_id]
      );
    }

    console.log("✅ Registration successful");

    // 🔔 CREATE NOTIFICATION for user (confirmation)
    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await createNotification(
      user_id,
      'event_registration',
      'Event Registration Confirmed',
      `You are registered for "${event.title}" on ${eventDate} at ${event.event_time}`,
      `/events/${event_id}`,
      parseInt(event_id)
    );
    console.log("🔔 Registration confirmation notification sent");

    res.json({ message: "Successfully registered for event" });

  } catch (error) {
    console.error("💥 Error registering for event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CANCEL REGISTRATION ====================
export const cancelRegistration = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    console.log("❌ Cancelling registration for user", user_id, "event", event_id);

    // Check if registered
    const [registration] = await queryPromise(
      "SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'registered'",
      [event_id, user_id]
    );

    if (!registration) {
      return res.status(400).json({ message: "You are not registered for this event" });
    }

    // Cancel registration
    await queryPromise(
      "UPDATE event_registrations SET status = 'cancelled' WHERE id = ?",
      [registration.id]
    );

    console.log("✅ Registration cancelled");

    res.json({ message: "Registration cancelled successfully" });

  } catch (error) {
    console.error("💥 Error cancelling registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UNREGISTER FROM EVENT (by eventId in URL) ====================
export const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user_id = req.user.id;

    console.log(`❌ Unregistering user ${user_id} from event ${eventId}`);

    // Check if registered
    const [registration] = await queryPromise(
      "SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'registered'",
      [eventId, user_id]
    );

    if (!registration) {
      return res.status(400).json({ message: "You are not registered for this event" });
    }

    // Cancel registration
    await queryPromise(
      "UPDATE event_registrations SET status = 'cancelled' WHERE id = ?",
      [registration.id]
    );

    console.log("✅ Unregistration successful");

    res.json({ message: "Successfully unregistered from event" });

  } catch (error) {
    console.error("💥 Error unregistering from event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CHECK REGISTRATION STATUS ====================
export const checkRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user_id = req.user.id;

    console.log(`🔍 Checking registration status for user ${user_id} and event ${eventId}`);

    const [registration] = await queryPromise(
      "SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'registered'",
      [eventId, user_id]
    );

    const isRegistered = !!registration;

    console.log(`✅ Registration status: ${isRegistered ? 'Registered' : 'Not registered'}`);

    res.json({ 
      isRegistered,
      registration: registration || null
    });

  } catch (error) {
    console.error("💥 Error checking registration status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};