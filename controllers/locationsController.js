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

// ==================== GET ALL LOCATIONS ====================
export const getAllLocations = async (req, res) => {
  try {
    console.log("🗺️ Fetching all locations...");
    
    const { type, state, city, search } = req.query;

    // Build query
    let sql = `SELECT * FROM locations WHERE is_active = TRUE`;
    const params = [];

    // Filter by type
    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    // Filter by state
    if (state) {
      sql += ` AND state LIKE ?`;
      params.push(`%${state}%`);
    }

    // Filter by city
    if (city) {
      sql += ` AND city LIKE ?`;
      params.push(`%${city}%`);
    }

    // Search by name or description
    if (search) {
      sql += ` AND (name LIKE ? OR description LIKE ? OR services LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY state, city, name`;

    const locations = await queryPromise(sql, params);

    console.log(`✅ Found ${locations.length} locations`);

    res.json({
      count: locations.length,
      locations: locations
    });

  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    res.status(500).json({ 
      message: 'Error fetching locations', 
      error: error.message 
    });
  }
};

// ==================== GET NEARBY LOCATIONS ====================
export const getNearbyLocations = async (req, res) => {
  try {
    console.log("📍 Fetching nearby locations...");
    
    const { latitude, longitude, radius = 50, type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Haversine formula to calculate distance
    let sql = `
      SELECT *,
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM locations
      WHERE is_active = TRUE
    `;
    
    const params = [lat, lon, lat];

    // Filter by type if provided
    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` HAVING distance <= ?`;
    params.push(radiusKm);

    sql += ` ORDER BY distance`;

    const locations = await queryPromise(sql, params);

    console.log(`✅ Found ${locations.length} nearby locations`);

    res.json({
      count: locations.length,
      userLocation: { latitude: lat, longitude: lon },
      radius: radiusKm,
      locations: locations
    });

  } catch (error) {
    console.error('❌ Error fetching nearby locations:', error);
    res.status(500).json({ 
      message: 'Error fetching nearby locations', 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE LOCATION ====================
export const getLocationById = async (req, res) => {
  try {
    console.log("🗺️ Fetching location details...");
    
    const { id } = req.params;

    const sql = `SELECT * FROM locations WHERE id = ? AND is_active = TRUE`;
    const locations = await queryPromise(sql, [id]);

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    console.log("✅ Location found");

    res.json({
      location: locations[0]
    });

  } catch (error) {
    console.error('❌ Error fetching location:', error);
    res.status(500).json({ 
      message: 'Error fetching location', 
      error: error.message 
    });
  }
};

// ==================== GET STATES WITH LOCATIONS ====================
export const getStatesWithLocations = async (req, res) => {
  try {
    console.log("🗺️ Fetching states with locations...");
    
    const sql = `
      SELECT DISTINCT state, COUNT(*) as location_count
      FROM locations
      WHERE is_active = TRUE
      GROUP BY state
      ORDER BY state
    `;

    const states = await queryPromise(sql);

    console.log(`✅ Found ${states.length} states`);

    res.json({
      count: states.length,
      states: states
    });

  } catch (error) {
    console.error('❌ Error fetching states:', error);
    res.status(500).json({ 
      message: 'Error fetching states', 
      error: error.message 
    });
  }
};

// ==================== ADD LOCATION (OPTIONAL - FOR OFFICERS) ====================
export const addLocation = async (req, res) => {
  try {
    console.log("➕ Adding new location...");
    
    const {
      name,
      type,
      category,
      address,
      city,
      state,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      description,
      operating_hours,
      services
    } = req.body;

    const created_by = req.user?.id || null;

    // Validation
    if (!name || !type || !address || !city || !state || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const sql = `
      INSERT INTO locations 
      (name, type, category, address, city, state, latitude, longitude, 
       contact_phone, contact_email, description, operating_hours, services, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await queryPromise(sql, [
      name,
      type,
      category || null,
      address,
      city,
      state,
      latitude,
      longitude,
      contact_phone || null,
      contact_email || null,
      description || null,
      operating_hours || null,
      services || null,
      created_by
    ]);

    console.log("✅ Location added:", result.insertId);

    res.status(201).json({
      message: 'Location added successfully',
      locationId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error adding location:', error);
    res.status(500).json({ 
      message: 'Error adding location', 
      error: error.message 
    });
  }
};