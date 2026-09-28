

const mongoose = require('mongoose');

const additionalInfoSchema = new mongoose.Schema({
  fieldName: String,
  fieldValue: String
});

// Sub-subcategory schema (nested)
const childSubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Child subcategory name is required'],
    trim: true,
    maxlength: [100, 'Child subcategory name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    maxlength: [100, 'Subcategory name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  children: [childSubcategorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Product embedded schema for category - UPDATED FOR TOY PRODUCTS
const embeddedProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  fullDescription: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ['0-2', '3-5', '6-10', '11-14'],
    default: '3-5'
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: Boolean
  }],
  regularPrice: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  skuCode: {
    type: String,
    trim: true
  },
  deliveryInfo: {
    type: String,
    trim: true
  },
  codAvailable: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    // enum: [
    //   'Best Seller', 'New Arrival', 'Limited Edition', 'Eco-Friendly',
    //   'Educational', 'STEM Toy', 'Montessori', 'Creative Play',
    //   'Outdoor Fun', 'Battery Included', 'Non-Toxic', 'Award Winner',
    //   'Musical Toy', 'Interactive', 'Light Up', 'Remote Control',
    //   'Building Set', 'Puzzle Game', 'Art & Craft', 'Pretend Play'
    // ]
  }],
  promotion: {
    type: String,
    enum: ['flash-sale', 'featured', 'trending', 'clearance', 'holiday-special', 'bundle-deal', 'limited-stock', ''],
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  additionalInfo: [additionalInfoSchema],
  videoUrl: {
    type: String,
    default: ''
  },
  videoPublicId: {
    type: String,
    default: ''
  },
  videoType: {
    type: String,
    enum: ['upload', 'youtube'],
    default: 'upload'
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category.subcategories'
  },
  subcategoryName: {
    type: String,
    trim: true
  },
  childSubcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category.subcategories.children'
  },
  childSubcategoryName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Category image is required']
    },
    publicId: {
      type: String,
      required: true
    }
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
  subcategories: [subcategorySchema],
  products: [embeddedProductSchema],
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from name before saving
// categorySchema.pre('save', function() {
//   if (this.isModified('name')) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');
//   }

//   // Generate slugs for subcategories and their children
//   if (this.isModified('subcategories')) {
//     this.subcategories.forEach(subcat => {
//       if (subcat.isModified('name') || !subcat.slug) {
//         subcat.slug = subcat.name
//           .toLowerCase()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/(^-|-$)+/g, '');
//       }
//       if (subcat.isModified('updatedAt')) {
//         subcat.updatedAt = Date.now();
//       }
      
//       // Generate slugs for children
//       if (subcat.children && subcat.children.length > 0) {
//         subcat.children.forEach(child => {
//           if (child.isModified('name') || !child.slug) {
//             child.slug = child.name
//               .toLowerCase()
//               .replace(/[^a-z0-9]+/g, '-')
//               .replace(/(^-|-$)+/g, '');
//           }
//           if (child.isModified('updatedAt')) {
//             child.updatedAt = Date.now();
//           }
//         });
//       }
//     });
//   }
// });

categorySchema.pre('save', function() {
  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')                        // spaces/underscores → hyphen
      .replace(/[^\p{L}\p{N}\-]+/gu, '')              // keep letters, numbers, hyphens (any language)
      .replace(/\-+/g, '-')                           // collapse multiple hyphens
      .replace(/(^-|-$)+/g, '');                      // trim hyphens
  };

  if (this.isModified('name') || !this.slug) {
    const baseSlug = generateSlug(this.name);
    // ✅ Fallback for empty/unsupported names
    this.slug = baseSlug || `category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  if (this.isModified('subcategories')) {
    this.subcategories.forEach(subcat => {
      if (subcat.isModified('name') || !subcat.slug) {
        const s = generateSlug(subcat.name);
        subcat.slug = s || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      }
      subcat.updatedAt = Date.now();

      if (subcat.children && subcat.children.length > 0) {
        subcat.children.forEach(child => {
          if (child.isModified('name') || !child.slug) {
            const c = generateSlug(child.name);
            child.slug = c || `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          }
          child.updatedAt = Date.now();
        });
      }
    });
  }
});

// Indexes for better query performance
categorySchema.index({ name: 1, isActive: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Category', categorySchema);