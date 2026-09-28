// const mongoose = require('mongoose');

// // Navbar Item Schema
// const navbarItemSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   href: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   icon: {
//     type: String,
//     enum: ['Home', 'Zap', 'MapPin', 'Info', 'Phone', 'Package', 'User', 'Heart'],
//     default: 'Home'
//   },
//   order: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   requiredRole: {
//     type: String,
//     enum: ['all', 'authenticated', 'admin', 'moderator', 'call_center_agent', 'super_admin'],
//     default: 'all'
//   }
// });

// // Main Navbar Schema
// const navbarSchema = new mongoose.Schema({
//   items: [navbarItemSchema],
//   logo: {
//     text: {
//       type: String,
//       default: 'Beauty Bucket'
//     },
//     highlightText: {
//       type: String,
//       default: 'Gadget'
//     },
//     icon: {
//       type: String,
//       default: 'Zap'
//     },
//     logoUrl: {
//       type: String,
//       default: ''
//     }
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// navbarSchema.index({ isActive: 1 });
// navbarSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('Navbar', navbarSchema);



const mongoose = require('mongoose');

// Navbar Item Schema - supports category-based items
const navbarItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  href: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['link', 'category', 'dropdown'],
    default: 'link'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Reference path for subcategory (optional)
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  icon: {
    type: String,
    enum: ['Home', 'Zap', 'MapPin', 'Info', 'Phone', 'Package', 'User', 'Heart', 'Sparkles', 'Flower2', 'ShoppingBag', 'Truck', 'Store'],
    default: 'Home'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showInMobile: {
    type: Boolean,
    default: true
  },
  highlight: {
    type: Boolean,
    default: false
  },
  requiredRole: {
    type: String,
    enum: ['all', 'authenticated', 'admin', 'moderator', 'call_center_agent', 'super_admin'],
    default: 'all'
  }
});

// Outlet/Location Schema
const outletSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Main Outlet'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  googleMapsEmbedUrl: {
    type: String,
    default: ''
  },
  googleMapsLink: {
    type: String,
    default: ''
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Main Navbar Schema
const navbarSchema = new mongoose.Schema({
  items: [navbarItemSchema],
  
 logo: {
  text: {
    type: String,
    default: "Nishat's Creation"    // ← CHANGED
  },
  highlightText: {
    type: String,
    default: 'Creation'
  },
    icon: {
      type: String,
      default: 'Flower2'
    },
    logoUrl: {
      type: String,
      default: ''
    }
  },
  
  // Top bar settings
  topBar: {
    phone: {
      type: String,
      default: '+880 1XXXXXXXXX'
    },
    phoneLink: {
      type: String,
      default: '/contact'
    },
    showTrackOrder: {
      type: Boolean,
      default: true
    },
    trackOrderLink: {
      type: String,
      default: '/track'
    },
    trackOrderText: {
      type: String,
      default: 'Track Order'
    },
    showOutlet: {
      type: Boolean,
      default: true
    },
    outletText: {
      type: String,
      default: 'Our Outlet'
    }
  },
  
  // Outlet information for modal
  outlet: {
    type: outletSchema,
    default: () => ({})
  },
  
  // Search placeholder words
  searchPlaceholders: {
    type: [String],
    default: [
      'Search Products...',
      'Makeup...',
      'Skincare...',
      'Hair Care...',
      'Face cream...',
      'Lipstick...',
      'Serum...',
      'Moisturizer...',
      'Sunscreen...',
      'Face wash...',
      'Perfume...'
    ]
  },
  
  // Styling
  styling: {
    primaryColor: {
      type: String,
      default: '#8B9D83'
    },
    primaryLight: {
      type: String,
      default: '#A8B8A0'
    },
    primaryDark: {
      type: String,
      default: '#6B7D63'
    },
    backgroundColor: {
      type: String,
      default: '#F1EFE3'
    },
    textColor: {
      type: String,
      default: '#292725'
    },
    accentColor: {
      type: String,
      default: '#d83a38'
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
navbarSchema.index({ isActive: 1 });
navbarSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Navbar', navbarSchema);