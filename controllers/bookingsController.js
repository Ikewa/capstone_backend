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

// ==================== CREATE BOOKING REQUEST ====================
export const createBooking = async (req, res) => {
  try {
    console.log("📅 Creating booking request...");
    
    const { booking_date, booking_time, purpose, location, farmer_notes } = req.body;
    const farmer_id = req.user.id;

    // Validation
    if (!booking_date || !booking_time || !purpose) {
      return res.status(400).json({ 
        message: 'Please provide booking date, time, and purpose' 
      });
    }

    // Check if user is a farmer
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ 
        message: 'Only farmers can create booking requests' 
      });
    }

    const sql = `
      INSERT INTO bookings 
      (farmer_id, booking_date, booking_time, purpose, location, farmer_notes, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `;

    const result = await queryPromise(sql, [
      farmer_id,
      booking_date,
      booking_time,
      purpose,
      location || null,
      farmer_notes || null
    ]);

    console.log("✅ Booking created:", result.insertId);

    res.status(201).json({
      message: 'Booking request submitted successfully',
      bookingId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking request', 
      error: error.message 
    });
  }
};

// ==================== GET MY BOOKINGS (FARMER) ====================
export const getMyBookings = async (req, res) => {
  try {
    console.log("📅 Fetching farmer's bookings...");
    
    const farmer_id = req.user.id;

    const sql = `
      SELECT 
        b.*,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        u.email as officer_email
      FROM bookings b
      LEFT JOIN users u ON b.officer_id = u.id
      WHERE b.farmer_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const bookings = await queryPromise(sql, [farmer_id]);

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      count: bookings.length,
      bookings: bookings
    });

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

// ==================== GET PENDING BOOKINGS (OFFICER) ====================
export const getPendingBookings = async (req, res) => {
  try {
    console.log("📅 Fetching pending bookings...");
    
    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can view pending bookings' 
      });
    }

    const sql = `
      SELECT 
        b.*,
        u.first_name as farmer_first_name,
        u.last_name as farmer_last_name,
        u.email as farmer_email,
        u.location as farmer_location
      FROM bookings b
      JOIN users u ON b.farmer_id = u.id
      WHERE b.status = 'Pending'
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `;

    const bookings = await queryPromise(sql);

    console.log(`✅ Found ${bookings.length} pending bookings`);

    res.json({
      count: bookings.length,
      bookings: bookings
    });

  } catch (error) {
    console.error('❌ Error fetching pending bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching pending bookings', 
      error: error.message 
    });
  }
};

// ==================== GET MY APPOINTMENTS (OFFICER) ====================
export const getMyAppointments = async (req, res) => {
  try {
    console.log("📅 Fetching officer's appointments...");
    
    const officer_id = req.user.id;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can view appointments' 
      });
    }

    const sql = `
      SELECT 
        b.*,
        u.first_name as farmer_first_name,
        u.last_name as farmer_last_name,
        u.email as farmer_email,
        u.location as farmer_location
      FROM bookings b
      JOIN users u ON b.farmer_id = u.id
      WHERE b.officer_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const appointments = await queryPromise(sql, [officer_id]);

    console.log(`✅ Found ${appointments.length} appointments`);

    res.json({
      count: appointments.length,
      appointments: appointments
    });

  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};

// ==================== ACCEPT BOOKING ====================
export const acceptBooking = async (req, res) => {
  try {
    console.log("✅ Accepting booking...");
    
    const { id } = req.params;
    const officer_id = req.user.id;
    const { officer_notes } = req.body;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can accept bookings' 
      });
    }

    // Check if booking exists and is pending
    const checkSql = `SELECT * FROM bookings WHERE id = ? AND status = 'Pending'`;
    const bookings = await queryPromise(checkSql, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ 
        message: 'Booking not found or already processed' 
      });
    }

    // Accept booking
    const sql = `
      UPDATE bookings 
      SET status = 'Confirmed', officer_id = ?, officer_notes = ?
      WHERE id = ?
    `;

    await queryPromise(sql, [officer_id, officer_notes || null, id]);

    console.log("✅ Booking accepted");

    // TODO: Create notification for farmer

    res.json({
      message: 'Booking confirmed successfully'
    });

  } catch (error) {
    console.error('❌ Error accepting booking:', error);
    res.status(500).json({ 
      message: 'Error accepting booking', 
      error: error.message 
    });
  }
};

// ==================== DECLINE BOOKING ====================
export const declineBooking = async (req, res) => {
  try {
    console.log("❌ Declining booking...");
    
    const { id } = req.params;
    const officer_id = req.user.id;
    const { officer_notes } = req.body;

    // Check if user is an officer
    if (req.user.role !== 'Extension Officer') {
      return res.status(403).json({ 
        message: 'Only extension officers can decline bookings' 
      });
    }

    // Check if booking exists and is pending
    const checkSql = `SELECT * FROM bookings WHERE id = ? AND status = 'Pending'`;
    const bookings = await queryPromise(checkSql, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ 
        message: 'Booking not found or already processed' 
      });
    }

    // Decline booking
    const sql = `
      UPDATE bookings 
      SET status = 'Declined', officer_id = ?, officer_notes = ?
      WHERE id = ?
    `;

    await queryPromise(sql, [officer_id, officer_notes || null, id]);

    console.log("✅ Booking declined");

    // TODO: Create notification for farmer

    res.json({
      message: 'Booking declined'
    });

  } catch (error) {
    console.error('❌ Error declining booking:', error);
    res.status(500).json({ 
      message: 'Error declining booking', 
      error: error.message 
    });
  }
};

// ==================== CANCEL BOOKING (FARMER) ====================
export const cancelBooking = async (req, res) => {
  try {
    console.log("🚫 Cancelling booking...");
    
    const { id } = req.params;
    const farmer_id = req.user.id;

    // Check if booking exists and belongs to farmer
    const checkSql = `
      SELECT * FROM bookings 
      WHERE id = ? AND farmer_id = ? AND status IN ('Pending', 'Confirmed')
    `;
    const bookings = await queryPromise(checkSql, [id, farmer_id]);

    if (bookings.length === 0) {
      return res.status(404).json({ 
        message: 'Booking not found or cannot be cancelled' 
      });
    }

    // Cancel booking
    const sql = `UPDATE bookings SET status = 'Cancelled' WHERE id = ?`;
    await queryPromise(sql, [id]);

    console.log("✅ Booking cancelled");

    // TODO: Create notification for officer if one was assigned

    res.json({
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({ 
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE BOOKING ====================
export const getBookingById = async (req, res) => {
  try {
    console.log("📅 Fetching booking details...");
    
    const { id } = req.params;
    const user_id = req.user.id;

    const sql = `
      SELECT 
        b.*,
        f.first_name as farmer_first_name,
        f.last_name as farmer_last_name,
        f.email as farmer_email,
        f.location as farmer_location,
        o.first_name as officer_first_name,
        o.last_name as officer_last_name,
        o.email as officer_email
      FROM bookings b
      JOIN users f ON b.farmer_id = f.id
      LEFT JOIN users o ON b.officer_id = o.id
      WHERE b.id = ? AND (b.farmer_id = ? OR b.officer_id = ?)
    `;

    const bookings = await queryPromise(sql, [id, user_id, user_id]);

    if (bookings.length === 0) {
      return res.status(404).json({ 
        message: 'Booking not found or you do not have access' 
      });
    }

    console.log("✅ Booking found");

    res.json({
      booking: bookings[0]
    });

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ 
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
};