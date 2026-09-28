const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      required: [true, 'Logo image is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Subtitle cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    image: {
      type: String,
      required: [true, 'Image is required']
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

achievementSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);