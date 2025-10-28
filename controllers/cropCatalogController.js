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

// ==================== GET CROP RECOMMENDATIONS ====================
export const getCropRecommendations = async (req, res) => {
  try {
    console.log("🌾 Fetching crop recommendations...");
    
    const { location, season } = req.query;
    const user_location = location || req.user?.location;

    // Build query
    let sql = `SELECT * FROM crops WHERE 1=1`;
    const params = [];

    // Filter by location if provided
    if (user_location) {
      sql += ` AND suitable_regions LIKE ?`;
      params.push(`%${user_location}%`);
    }

    // Filter by season if provided
    if (season && season !== 'All') {
      sql += ` AND (best_seasons LIKE ? OR best_seasons = 'All Year')`;
      params.push(`%${season}%`);
    }

    sql += ` ORDER BY crop_name`;

    const crops = await queryPromise(sql, params);

    console.log(`✅ Found ${crops.length} crop recommendations`);

    res.json({
      location: user_location,
      season: season || 'All',
      count: crops.length,
      crops: crops
    });

  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    res.status(500).json({ 
      message: 'Error fetching crop recommendations', 
      error: error.message 
    });
  }
};

// ==================== GET ALL CROPS ====================
export const getAllCrops = async (req, res) => {
  try {
    console.log("🌾 Fetching all crops...");
    
    const sql = `SELECT * FROM crops ORDER BY crop_name`;
    const crops = await queryPromise(sql);

    console.log(`✅ Found ${crops.length} crops`);

    res.json({
      count: crops.length,
      crops: crops
    });

  } catch (error) {
    console.error('❌ Error fetching crops:', error);
    res.status(500).json({ 
      message: 'Error fetching crops', 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE CROP ====================
export const getCropById = async (req, res) => {
  try {
    console.log("🌾 Fetching crop details...");
    
    const { id } = req.params;

    const sql = `SELECT * FROM crops WHERE id = ?`;
    const crops = await queryPromise(sql, [id]);

    if (crops.length === 0) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    console.log("✅ Crop found");

    res.json({
      crop: crops[0]
    });

  } catch (error) {
    console.error('❌ Error fetching crop:', error);
    res.status(500).json({ 
      message: 'Error fetching crop', 
      error: error.message 
    });
  }
};