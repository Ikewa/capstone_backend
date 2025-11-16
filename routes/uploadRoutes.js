import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  uploadQuestionImages,
  uploadAnswerImages,
  uploadProfilePicture,
  uploadEventImages
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Generic upload handler
const handleImageUpload = (folder) => async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      if (req.file) {
        // Single file upload (profile picture)
        const imageUrl = `/uploads/${folder}/${req.file.filename}`;
        return res.json({
          message: "Image uploaded successfully",
          imageUrl: imageUrl
        });
      }
      return res.status(400).json({ message: "No image files provided" });
    }

    // Multiple files upload
    const imageUrls = req.files.map(file => 
      `/uploads/${folder}/${file.filename}`
    );

    res.json({
      message: "Images uploaded successfully",
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload routes
router.post('/questions', protect, uploadQuestionImages.array('images', 5), (req, res) => {
  req.params.folder = 'questions';
  handleImageUpload('questions')(req, res);
});

router.post('/answers', protect, uploadAnswerImages.array('images', 5), (req, res) => {
  handleImageUpload('answers')(req, res);
});

router.post('/profile', protect, uploadProfilePicture.single('image'), (req, res) => {
  handleImageUpload('profiles')(req, res);
});

router.post('/events', protect, uploadEventImages.array('images', 10), (req, res) => {
  handleImageUpload('events')(req, res);
});

export default router;