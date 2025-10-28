const mongoose = require('mongoose');

const cropRequestSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Farmer's Input
  location: {
    type: String,
    required: true,
    trim: true
  },
  
  soilType: {
    type: String,
    required: true,
    enum: ['Sandy', 'Clay', 'Loam', 'Silt', 'Peat', 'Chalk', 'Not Sure'],
    default: 'Not Sure'
  },
  
  season: {
    type: String,
    required: true,
    enum: ['Dry Season', 'Rainy Season', 'All Year'],
    default: 'Rainy Season'
  },
  
  landSize: {
    type: Number,
    required: true,
    min: 0
  },
  
  landSizeUnit: {
    type: String,
    enum: ['Hectares', 'Acres', 'Square Meters'],
    default: 'Hectares'
  },
  
  previousCrops: {
    type: String,
    trim: true,
    default: ''
  },
  
  challenges: {
    type: String,
    required: true,
    trim: true
  },
  
  additionalInfo: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Officer's Response
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'responded'],
    default: 'pending'
  },
  
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  recommendedCrops: [{
    cropName: String,
    reason: String,
    plantingTips: String,
    expectedYield: String,
    marketValue: String
  }],
  
  officerNotes: {
    type: String,
    default: ''
  },
  
  respondedAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true
});

// Index for faster queries
cropRequestSchema.index({ farmer: 1, status: 1 });
cropRequestSchema.index({ officer: 1, status: 1 });
cropRequestSchema.index({ createdAt: -1 });

const CropRequest = mongoose.model('CropRequest', cropRequestSchema);

module.exports = CropRequest;