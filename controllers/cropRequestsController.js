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

// ==================== SUBMIT CROP REQUEST (WITH IMAGES) ====================
export const submitCropRequest = async (req, res) => {
  try {
    console.log("🌾 Submitting crop request...");
    
    const {
      location,
      soilType,
      season,
      landSize,
      landSizeUnit,
      previousCrops,
      challenges,
      additionalInfo,
      images
    } = req.body;

    const farmer_id = req.user.id;

    // Validation
    if (!location || !soilType || !season || !landSize || !challenges) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    if (landSize <= 0) {
      return res.status(400).json({ 
        message: 'Land size must be greater than 0' 
      });
    }

    // Store images as JSON string
    const imagesJson = images ? JSON.stringify(images) : null;

    const sql = `
      INSERT INTO crop_requests 
      (farmer_id, location, soil_type, season, land_size, land_size_unit, 
       previous_crops, challenges, additional_info, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      farmer_id,
      location,
      soilType,
      season,
      landSize,
      landSizeUnit || 'Hectares',
      previousCrops || '',
      challenges,
      additionalInfo || '',
      imagesJson
    ];

    const result = await queryPromise(sql, params);

    console.log("✅ Crop request submitted successfully");

    res.status(201).json({
      message: 'Crop recommendation request submitted successfully',
      requestId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error submitting crop request:', error);
    res.status(500).json({ 
      message: 'Error submitting request', 
      error: error.message 
    });
  }
};

// ==================== GET FARMER'S REQUESTS ====================
export const getMyRequests = async (req, res) => {
  try {
    console.log("📋 Fetching farmer's crop requests...");
    
    const farmer_id = req.user.id;

    const sql = `
      SELECT 
        cr.*,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        u.email as officer_email,
        u.phone_number as officer_phone
      FROM crop_requests cr
      LEFT JOIN users u ON cr.officer_id = u.id
      WHERE cr.farmer_id = ?
      ORDER BY cr.created_at DESC
    `;

    const requests = await queryPromise(sql, [farmer_id]);

    console.log(`✅ Found ${requests.length} requests`);

    res.json({
      count: requests.length,
      requests: requests.map(req => ({
        _id: req.id,
        location: req.location,
        soilType: req.soil_type,
        season: req.season,
        landSize: req.land_size,
        landSizeUnit: req.land_size_unit,
        previousCrops: req.previous_crops,
        challenges: req.challenges,
        additionalInfo: req.additional_info,
        images: req.images ? JSON.parse(req.images) : [],
        status: req.status,
        officer: req.officer_id ? {
          name: `${req.officer_first_name} ${req.officer_last_name}`,
          email: req.officer_email,
          phoneNumber: req.officer_phone || ''
        } : null,
        createdAt: req.created_at,
        respondedAt: req.responded_at
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    res.status(500).json({ 
      message: 'Error fetching requests', 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE REQUEST ====================
export const getRequestById = async (req, res) => {
  try {
    console.log("🔍 Fetching crop request details...");
    
    const { id } = req.params;
    const user_id = req.user.id;

    // Get request details
    const requestSql = `
      SELECT 
        cr.*,
        f.first_name as farmer_first_name,
        f.last_name as farmer_last_name,
        f.email as farmer_email,
        f.phone_number as farmer_phone,
        o.first_name as officer_first_name,
        o.last_name as officer_last_name,
        o.email as officer_email,
        o.phone_number as officer_phone
      FROM crop_requests cr
      LEFT JOIN users f ON cr.farmer_id = f.id
      LEFT JOIN users o ON cr.officer_id = o.id
      WHERE cr.id = ?
    `;

    const requests = await queryPromise(requestSql, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    // Check authorization - HANDLE MULTIPLE ROLE FORMATS
    const isOfficer = 
      req.user.role === 'officer' || 
      req.user.role === 'Officer' || 
      req.user.role === 'Extension Officer' ||
      req.user.role === 'admin';

    if (request.farmer_id !== user_id && !isOfficer) {
      return res.status(403).json({ 
        message: 'Not authorized to view this request' 
      });
    }

    // Get recommended crops
    const cropsSql = `
      SELECT * FROM recommended_crops 
      WHERE crop_request_id = ?
      ORDER BY id
    `;

    const crops = await queryPromise(cropsSql, [id]);

    console.log("✅ Request found");

    res.json({
      _id: request.id,
      location: request.location,
      soilType: request.soil_type,
      season: request.season,
      landSize: parseFloat(request.land_size),
      landSizeUnit: request.land_size_unit,
      previousCrops: request.previous_crops || '',
      challenges: request.challenges,
      additionalInfo: request.additional_info || '',
      images: request.images ? JSON.parse(request.images) : [],
      status: request.status,
      farmer: {
        _id: request.farmer_id,
        name: `${request.farmer_first_name} ${request.farmer_last_name}`,
        email: request.farmer_email,
        phoneNumber: request.farmer_phone || ''
      },
      officer: request.officer_id ? {
        _id: request.officer_id,
        name: `${request.officer_first_name} ${request.officer_last_name}`,
        email: request.officer_email,
        phoneNumber: request.officer_phone || ''
      } : null,
      recommendedCrops: crops.map(crop => ({
        cropName: crop.crop_name,
        reason: crop.reason || '',
        plantingTips: crop.planting_tips || '',
        expectedYield: crop.expected_yield || '',
        marketValue: crop.market_value || ''
      })),
      officerNotes: request.officer_notes || '',
      createdAt: request.created_at,
      respondedAt: request.responded_at
    });

  } catch (error) {
    console.error('❌ Error fetching request:', error);
    res.status(500).json({ 
      message: 'Error fetching request', 
      error: error.message 
    });
  }
};

// ==================== GET PENDING REQUESTS (OFFICERS) ====================
export const getPendingRequests = async (req, res) => {
  try {
    console.log("📋 Fetching pending crop requests...");
    console.log("👤 User role:", req.user.role);
    console.log("👤 User ID:", req.user.id);
    
    // Check if user is officer - HANDLE BOTH ROLE FORMATS
    const isOfficer = 
      req.user.role === 'officer' || 
      req.user.role === 'Officer' || 
      req.user.role === 'Extension Officer' ||
      req.user.role === 'admin';

    if (!isOfficer) {
      console.log("❌ User is not an officer. Role:", req.user.role);
      return res.status(403).json({ 
        message: 'Only officers can access pending requests' 
      });
    }

    const sql = `
      SELECT 
        cr.*,
        u.first_name as farmer_first_name,
        u.last_name as farmer_last_name,
        u.email as farmer_email,
        u.phone_number as farmer_phone,
        u.location as farmer_location
      FROM crop_requests cr
      LEFT JOIN users u ON cr.farmer_id = u.id
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `;

    const requests = await queryPromise(sql);

    console.log(`✅ Found ${requests.length} pending requests`);

    res.json({
      count: requests.length,
      requests: requests.map(req => ({
        _id: req.id,
        location: req.location,
        soilType: req.soil_type,
        season: req.season,
        landSize: req.land_size,
        landSizeUnit: req.land_size_unit,
        previousCrops: req.previous_crops,
        challenges: req.challenges,
        additionalInfo: req.additional_info,
        images: req.images ? JSON.parse(req.images) : [],
        farmer: {
          name: `${req.farmer_first_name} ${req.farmer_last_name}`,
          email: req.farmer_email,
          phoneNumber: req.farmer_phone || '',
          location: req.farmer_location
        },
        createdAt: req.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching pending requests:', error);
    res.status(500).json({ 
      message: 'Error fetching pending requests', 
      error: error.message 
    });
  }
};

// ==================== OFFICER PROVIDES RECOMMENDATION ====================
export const provideRecommendation = async (req, res) => {
  try {
    console.log("✍️ Officer providing recommendation...");
    
    // HANDLE BOTH ROLE FORMATS
    const isOfficer = 
      req.user.role === 'officer' || 
      req.user.role === 'Officer' || 
      req.user.role === 'Extension Officer' ||
      req.user.role === 'admin';

    if (!isOfficer) {
      return res.status(403).json({ 
        message: 'Only officers can provide recommendations' 
      });
    }

    const { id } = req.params;
    const { recommendedCrops, officerNotes } = req.body;
    const officer_id = req.user.id;

    if (!recommendedCrops || recommendedCrops.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide at least one crop recommendation' 
      });
    }

    // Check if request exists
    const checkSql = `
      SELECT cr.*, u.location as farmer_location 
      FROM crop_requests cr
      LEFT JOIN users u ON cr.farmer_id = u.id
      WHERE cr.id = ?
    `;
    const requests = await queryPromise(checkSql, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (requests[0].status === 'responded') {
      return res.status(400).json({ 
        message: 'This request has already been responded to' 
      });
    }

    const request = requests[0];

    // Update crop request
    const updateSql = `
      UPDATE crop_requests 
      SET status = 'responded', 
          officer_id = ?, 
          officer_notes = ?, 
          responded_at = NOW()
      WHERE id = ?
    `;

    await queryPromise(updateSql, [officer_id, officerNotes || '', id]);

    // Insert recommended crops
    for (const crop of recommendedCrops) {
      const insertCropSql = `
        INSERT INTO recommended_crops 
        (crop_request_id, crop_name, reason, planting_tips, expected_yield, market_value)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await queryPromise(insertCropSql, [
        id,
        crop.cropName,
        crop.reason || '',
        crop.plantingTips || '',
        crop.expectedYield || '',
        crop.marketValue || ''
      ]);
    }

    console.log("✅ Recommendation provided successfully");

    // Create notification for farmer
    const officerSql = `SELECT first_name, last_name FROM users WHERE id = ?`;
    const officers = await queryPromise(officerSql, [officer_id]);
    const officer = officers[0];

    await createNotification(
      request.farmer_id,
      'crop_response',
      'Crop Recommendation Ready',
      `${officer.first_name} ${officer.last_name} has responded to your crop recommendation request for ${request.location}`,
      `/crop-requests/${id}`,
      parseInt(id)
    );
    console.log("🔔 Notification sent to farmer");

    res.json({
      message: 'Recommendation provided successfully'
    });

  } catch (error) {
    console.error('❌ Error providing recommendation:', error);
    res.status(500).json({ 
      message: 'Error providing recommendation', 
      error: error.message 
    });
  }
};

// ==================== DELETE REQUEST ====================
export const deleteRequest = async (req, res) => {
  try {
    console.log("🗑️ Deleting crop request...");
    
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if request exists and belongs to user
    const checkSql = `SELECT * FROM crop_requests WHERE id = ?`;
    const requests = await queryPromise(checkSql, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (requests[0].farmer_id !== user_id) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this request' 
      });
    }

    // Delete request
    const deleteSql = `DELETE FROM crop_requests WHERE id = ?`;
    await queryPromise(deleteSql, [id]);

    console.log("✅ Request deleted successfully");

    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting request:', error);
    res.status(500).json({ 
      message: 'Error deleting request', 
      error: error.message 
    });
  }
};

// ==================== UPLOAD CROP REQUEST IMAGES ====================
export const uploadRequestImagesController = async (req, res) => {
  try {
    console.log("📸 Uploading crop request images...");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    // Generate URLs for all uploaded images
    const imageUrls = req.files.map(file => 
      `http://localhost:5000/uploads/crop-requests/${file.filename}`
    );

    console.log(`✅ ${req.files.length} images uploaded successfully`);

    res.json({
      message: "Images uploaded successfully",
      imageUrls: imageUrls
    });

  } catch (error) {
    console.error("💥 Error uploading images:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};