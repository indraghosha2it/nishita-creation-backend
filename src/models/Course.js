// // models/Course.js
// const mongoose = require('mongoose');

// const courseSchema = new mongoose.Schema({
//   courseName: {
//     type: String,
//     required: [true, 'Course name is required'],
//     trim: true,
//     maxlength: [200, 'Course name cannot exceed 200 characters']
//   },
//   courseDetails: {
//     type: String,
//     required: [true, 'Course details are required'],
//     trim: true
//   },
//   startDate: {
//     type: Date,
//     required: [true, 'Start date is required']
//   },
//   endDate: {
//     type: Date,
//     required: [true, 'End date is required']
//   },
//   classTime: {
//     type: String,
//     required: [true, 'Class time is required'],
//     trim: true
//     // e.g., "10:00 AM - 12:00 PM"
//   },
//   totalClasses: {
//     type: Number,
//     required: [true, 'Total number of classes is required'],
//     min: [1, 'Total classes must be at least 1']
//   },
//   courseFee: {
//     type: Number,
//     required: [true, 'Course fee is required'],
//     min: [0, 'Course fee cannot be negative']
//   },
//   registrationDeadline: {
//     type: Date,
//     required: [true, 'Registration deadline is required']
//   },
//   maxRegistrations: {
//     type: Number,
//     default: null,
//     min: [1, 'Max registrations must be at least 1']
//   },
//   currentRegistrations: {
//     type: Number,
//     default: 0
//   },
//   image: {
//     type: String,
//     default: ''
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Virtual for checking if registration is open
// courseSchema.virtual('isRegistrationOpen').get(function() {
//   const now = new Date();
//   const isBeforeDeadline = now <= this.registrationDeadline;
//   const hasSpace = this.maxRegistrations === null || this.currentRegistrations < this.maxRegistrations;
//   return isBeforeDeadline && hasSpace && this.isActive;
// });

// // Virtual for available spots
// courseSchema.virtual('availableSpots').get(function() {
//   if (this.maxRegistrations === null) return 'Unlimited';
//   return Math.max(0, this.maxRegistrations - this.currentRegistrations);
// });

// // Ensure virtuals are included in JSON
// courseSchema.set('toJSON', { virtuals: true });
// courseSchema.set('toObject', { virtuals: true });

// // Indexes
// courseSchema.index({ isActive: 1 });
// courseSchema.index({ registrationDeadline: 1 });
// courseSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Course', courseSchema);



// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  courseDetails: {
    type: String,
    required: [true, 'Course details are required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  classTime: {
    type: String,
    required: [true, 'Class time is required'],
    trim: true
    // e.g., "10:00 AM - 12:00 PM"
  },
  totalClasses: {
    type: Number,
    required: [true, 'Total number of classes is required'],
    min: [1, 'Total classes must be at least 1']
  },
  courseFee: {
    type: Number,
    required: [true, 'Course fee is required'],
    min: [0, 'Course fee cannot be negative']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  maxRegistrations: {
    type: Number,
    default: null,
    min: [1, 'Max registrations must be at least 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for checking if registration is open
courseSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const isBeforeDeadline = now <= this.registrationDeadline;
  const hasSpace = this.maxRegistrations === null || this.currentRegistrations < this.maxRegistrations;
  return isBeforeDeadline && hasSpace && this.isActive;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  if (this.maxRegistrations === null) return 'Unlimited';
  return Math.max(0, this.maxRegistrations - this.currentRegistrations);
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

// Indexes
courseSchema.index({ isActive: 1 });
courseSchema.index({ registrationDeadline: 1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);