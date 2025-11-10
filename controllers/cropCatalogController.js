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

// ==================== GET ALL CROPS ====================
export const getAllCrops = async (req, res) => {
  try {
    console.log("🌾 Fetching all crops...");

    const { search, category, season } = req.query;

    let sql = "SELECT * FROM crops WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (season) {
      sql += " AND season = ?";
      params.push(season);
    }

    sql += " ORDER BY name ASC";

    const crops = await queryPromise(sql, params);

    console.log(`✅ Found ${crops.length} crops`);

    res.json({ crops });

  } catch (error) {
    console.error("💥 Error fetching crops:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE CROP ====================
export const getCrop = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🌾 Fetching crop ${id}`);

    const [crop] = await queryPromise("SELECT * FROM crops WHERE id = ?", [id]);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    console.log("✅ Crop found");

    res.json({ crop });

  } catch (error) {
    console.error("💥 Error fetching crop:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET CROP RECOMMENDATIONS ====================
export const getCropRecommendations = async (req, res) => {
  try {
    console.log("🌟 Fetching crop recommendations...");

    const { location } = req.query;
    const user = req.user;

    // Determine current season
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason = '';
    if (currentMonth >= 4 && currentMonth <= 10) {
      currentSeason = 'Wet Season';
    } else {
      currentSeason = 'Dry Season';
    }

    console.log(`📅 Current season: ${currentSeason}`);
    console.log(`📍 User location: ${user?.location || 'Not set'}`);

    // Build query - START WITH SEASON ONLY
    let sql = `
      SELECT * FROM crops 
      WHERE (season = ? OR season = 'All Year')
    `;
    const params = [currentSeason];

    // Prioritize by:
    // 1. Crops suitable for "All regions"
    // 2. Easy difficulty
    // 3. Name
    sql += ` ORDER BY 
      CASE 
        WHEN suitable_for_region = 'All regions' THEN 1
        ELSE 2
      END,
      CASE 
        WHEN difficulty_level = 'Easy' THEN 1
        WHEN difficulty_level = 'Medium' THEN 2
        WHEN difficulty_level = 'Hard' THEN 3
        ELSE 4
      END,
      name ASC
    `;

    const crops = await queryPromise(sql, params);

    console.log(`✅ Found ${crops.length} recommended crops for ${currentSeason}`);

    res.json({ 
      crops: crops,
      recommendations: crops,
      season: currentSeason,
      location: user?.location || 'All regions',
      message: `Showing ${crops.length} crops suitable for ${currentSeason}`
    });

  } catch (error) {
    console.error("💥 Error fetching recommendations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE CROP (Admin only) ====================
export const createCrop = async (req, res) => {
  try {
    console.log("🌾 Creating new crop...");

    const {
      name,
      scientific_name,
      category,
      season,
      climate_type,
      soil_type,
      water_requirement,
      planting_time,
      growing_duration,
      harvest_season,
      spacing,
      common_pests,
      pest_control,
      average_yield,
      market_value,
      description,
      growing_tips,
      image_url,
      suitable_for_region,
      difficulty_level
    } = req.body;

    // Validation
    if (!name || !category || !season || !description) {
      return res.status(400).json({ 
        message: "Name, category, season, and description are required" 
      });
    }

    const result = await queryPromise(
      `INSERT INTO crops (
        name, scientific_name, category, season, climate_type, soil_type,
        water_requirement, planting_time, growing_duration, harvest_season,
        spacing, common_pests, pest_control, average_yield, market_value,
        description, growing_tips, image_url, suitable_for_region, difficulty_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, scientific_name || null, category, season, climate_type || null,
        soil_type || null, water_requirement || null, planting_time || null,
        growing_duration || null, harvest_season || null, spacing || null,
        common_pests || null, pest_control || null, average_yield || null,
        market_value || null, description, growing_tips || null, image_url || null,
        suitable_for_region || null, difficulty_level || 'Medium'
      ]
    );

    console.log("✅ Crop created with ID:", result.insertId);

    res.status(201).json({ 
      message: "Crop created successfully",
      crop_id: result.insertId
    });

  } catch (error) {
    console.error("💥 Error creating crop:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPLOAD CROP IMAGE ====================
export const uploadCropImageController = async (req, res) => {
  try {
    console.log("📸 Uploading crop image...");

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Generate URL for the uploaded image
    const imageUrl = `/uploads/crops/${req.file.filename}`;

    console.log("✅ Image uploaded successfully:", imageUrl);

    res.json({
      message: "Image uploaded successfully",
      imageUrl: `http://localhost:5000${imageUrl}`
    });

  } catch (error) {
    console.error("💥 Error uploading image:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};