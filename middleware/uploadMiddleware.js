import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directories
const directories = {
  crops: './uploads/crops',
  requests: './uploads/crop-requests',
  questions: './uploads/questions',
  answers: './uploads/answers',
  profiles: './uploads/profiles',
  events: './uploads/events'
};

// Create all directories
Object.values(directories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Generic storage function
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, directories[folder]);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${folder}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};

// Create multer instances for different upload types
export const uploadCropImage = multer({
  storage: createStorage('crops'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export const uploadRequestImages = multer({
  storage: createStorage('requests'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export const uploadQuestionImages = multer({
  storage: createStorage('questions'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export const uploadAnswerImages = multer({
  storage: createStorage('answers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export const uploadProfilePicture = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for profile pics
  fileFilter: fileFilter
});

export const uploadEventImages = multer({
  storage: createStorage('events'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});