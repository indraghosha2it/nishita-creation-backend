
// code 2
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Barcode = require('../models/Barcode');
const RestockLog = require('../models/RestockLog');

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      return publicId;
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }
  return null;
};

// ============================================================
// HELPER: Assign barcode to product in Barcode collection
// ============================================================
const assignBarcodeToProduct = async (barcodeNumber, product, userId) => {
  if (!barcodeNumber) return null;

  try {
    let barcodeDoc = await Barcode.findOne({ barcodeNumber });

    if (barcodeDoc) {
      // Update existing barcode record
      barcodeDoc.productId = product._id;
      barcodeDoc.productSku = product.skuCode || '';
      barcodeDoc.productName = product.productName;
      barcodeDoc.status = 'assigned';
      await barcodeDoc.save();
      return barcodeDoc;
    } else {
      // Create new barcode record
      const { generateAndUploadBarcodeImage } = require('../utils/generateBarcodeImage');
      let barcodeImageUrl = '';
      let barcodeImagePublicId = '';

      try {
        const result = await generateAndUploadBarcodeImage(barcodeNumber);
        barcodeImageUrl = result.url;
        barcodeImagePublicId = result.publicId;
      } catch (imgError) {
        console.error('Failed to generate barcode image:', imgError);
      }

      barcodeDoc = await Barcode.create({
        barcodeNumber,
        format: 'CODE-128',
        productId: product._id,
        productSku: product.skuCode || '',
        productName: product.productName,
        status: 'assigned',
        generatedBy: userId,
        barcodeImageUrl,
        barcodeImagePublicId,
        metadata: {
          sequence: parseInt(barcodeNumber.slice(1, 9)) || 0
        }
      });
      return barcodeDoc;
    }
  } catch (error) {
    console.error('Error assigning barcode:', error);
    return null;
  }
};

// ============================================================
// HELPER: Release barcode from product
// ============================================================
const releaseBarcodeFromProduct = async (barcodeNumber) => {
  if (!barcodeNumber) return null;

  try {
    const barcodeDoc = await Barcode.findOne({ barcodeNumber });
    if (barcodeDoc) {
      barcodeDoc.productId = null;
      barcodeDoc.productSku = '';
      barcodeDoc.productName = '';
      barcodeDoc.status = 'available';
      await barcodeDoc.save();
      return barcodeDoc;
    }
  } catch (error) {
    console.error('Error releasing barcode:', error);
    return null;
  }
};

const updateEmbeddedProductInCategory = async (categoryId, productId, updateData) => {
  try {
    await Category.findOneAndUpdate(
      {
        _id: categoryId,
        'products.productId': productId
      },
      {
        $set: {
          'products.$.productName': updateData.productName,
          'products.$.shortDescription': updateData.shortDescription,
          'products.$.fullDescription': updateData.fullDescription,
          'products.$.brand': updateData.brand,
          'products.$.regularPrice': updateData.regularPrice,
          'products.$.discountPrice': updateData.discountPrice,
          'products.$.costPerItem': updateData.costPerItem,
          'products.$.buyingPrice': updateData.buyingPrice,
          'products.$.packagingCost': updateData.packagingCost,
          'products.$.deliveryCost': updateData.deliveryCost,
          'products.$.stockQuantity': updateData.stockQuantity,
          'products.$.stockAlertQuantity': updateData.stockAlertQuantity,
          'products.$.skuCode': updateData.skuCode,
          'products.$.unit': updateData.unit,
          'products.$.colors': updateData.colors,
          'products.$.deliveryInfo': updateData.deliveryInfo,
          'products.$.tags': updateData.tags,
          'products.$.isFeatured': updateData.isFeatured,
          'products.$.showOnBanner': updateData.showOnBanner,
          'products.$.comingSoon': updateData.comingSoon,
          'products.$.isActive': updateData.isActive,
          'products.$.rating': updateData.rating,
          'products.$.additionalInfo': updateData.additionalInfo,
          'products.$.faqs': updateData.faqs,
          'products.$.images': updateData.images,
          'products.$.subcategoryId': updateData.subcategoryId,
          'products.$.subcategoryName': updateData.subcategoryName,
          'products.$.childSubcategoryId': updateData.childSubcategoryId,
          'products.$.childSubcategoryName': updateData.childSubcategoryName,
          'products.$.updatedBy': updateData.updatedBy,
          'products.$.lastUpdatedAt': updateData.lastUpdatedAt,
          'products.$.updatedAt': new Date()
        }
      }
    );
  } catch (error) {
    console.error('Error updating embedded product:', error);
    throw error;
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================
const createProduct = async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('Body:', req.body);

    const {
      productName,
      slug,
      shortDescription,
      fullDescription,
      category,
      subcategory,
      childSubcategory,
      brand,
      stockQuantity,
      stockAlertQuantity,
      skuCode,
      regularPrice,
      discountPrice,
      buyingPrice,
      packagingCost,
      deliveryCost,
      unit,
      customUnit,
      colors,
      deliveryInfo,
      tags,
      isFeatured,
      showOnBanner,
      comingSoon,
      isActive,
      rating,
      additionalInfo,
      faqs,
      metaSettings,
      images,
      barcode,
      videoUrl,
      videoPublicId,
      videoType,
      // NEW FIELDS
      hasVariants,
      variants,
      addOnes
    } = req.body;

    // Check permissions
    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can create products.'
      });
    }

    // ============================================
    // BUYING PRICE - Only super_admin and admin can set
    // ============================================
    let finalBuyingPrice = 0;
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      finalBuyingPrice = buyingPrice ? Number(buyingPrice) : 0;
    }

    // ============================================
    // PACKAGING & DELIVERY COSTS
    // ============================================
    let finalPackagingCost = packagingCost ? Number(packagingCost) : 0;
    let finalDeliveryCost = deliveryCost ? Number(deliveryCost) : 0;

    // ============================================
    // AUTO-CALCULATE COST PER ITEM
    // ============================================
    const calculatedCostPerItem = finalBuyingPrice + finalPackagingCost + finalDeliveryCost;

    // Validation
    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName}$`, 'i') }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: `Product name "${productName}" already exists. Please use a different product name.`
      });
    }

    // ============================================
    // SLUG VALIDATION
    // ============================================
    let finalSlug = slug;
    if (slug) {
      finalSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existingSlug = await Product.findOne({ slug: finalSlug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          error: `Slug "${finalSlug}" is already taken. Please use a different slug.`
        });
      }
    }

    // ============================================
    // BARCODE VALIDATION
    // ============================================
    if (barcode) {
      // Check if barcode is used by any product
      const existingProductWithBarcode = await Product.findOne({ barcode });
      if (existingProductWithBarcode) {
        return res.status(400).json({
          success: false,
          error: `Barcode "${barcode}" is already assigned to product: ${existingProductWithBarcode.productName}`
        });
      }

      // Check if barcode exists in Barcode collection and is already assigned
      const barcodeDoc = await Barcode.findOne({ barcodeNumber: barcode });
      if (barcodeDoc && barcodeDoc.status === 'assigned') {
        return res.status(400).json({
          success: false,
          error: `Barcode "${barcode}" is already assigned to another product`
        });
      }

      // Validate barcode format
      if (!/^[0-9]{8,13}$/.test(barcode)) {
        return res.status(400).json({
          success: false,
          error: 'Barcode must be 8-13 digits only'
        });
      }
    }

    if (!fullDescription || fullDescription === '<p></p>') {
      return res.status(400).json({ success: false, error: 'Full description is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (regularPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Regular price must be greater than 0' });
    }
    if (discountPrice > regularPrice) {
      return res.status(400).json({ success: false, error: 'Discount price cannot exceed regular price' });
    }
    if (!unit) {
      return res.status(400).json({ success: false, error: 'Unit is required' });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one product image is required' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    let categoryName = categoryExists.name;
    let subcategoryName = '';
    let childSubcategoryName = '';

    if (subcategory) {
      const subcategoryDoc = categoryExists.subcategories.id(subcategory);
      if (subcategoryDoc) {
        subcategoryName = subcategoryDoc.name;
      }
    }

    if (childSubcategory && subcategory) {
      const subcategoryDoc = categoryExists.subcategories.id(subcategory);
      if (subcategoryDoc) {
        const childDoc = subcategoryDoc.children.id(childSubcategory);
        if (childDoc) {
          childSubcategoryName = childDoc.name;
        }
      }
    }

    // Get brand name from brand ID (if provided)
    let brandName = brand;
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      try {
        const Brand = require('../models/Brand');
        const brandDoc = await Brand.findById(brand);
        if (brandDoc) {
          brandName = brandDoc.name;
        } else {
          brandName = brand;
        }
      } catch (brandError) {
        console.error('Error fetching brand:', brandError);
        brandName = brand;
      }
    }

    // Process images
    const processedImages = images.map((url, index) => ({
      url: url,
      publicId: extractPublicIdFromUrl(url),
      isPrimary: index === 0
    }));

    // Process additional info
    let processedAdditionalInfo = [];
    if (additionalInfo && Array.isArray(additionalInfo)) {
      processedAdditionalInfo = additionalInfo;
    }

    // Process FAQs
    let processedFaqs = [];
    if (faqs && Array.isArray(faqs)) {
      processedFaqs = faqs.filter(faq =>
        faq.question && faq.question.trim() &&
        faq.answer && faq.answer.trim()
      );
    }

    // Process meta settings
    let processedMetaSettings = {};
    if (metaSettings) {
      processedMetaSettings = {
        metaTitle: metaSettings.metaTitle || '',
        metaDescription: metaSettings.metaDescription || '',
        metaKeywords: metaSettings.metaKeywords || []
      };
    }

    // Validate tags (only one tag)
    if (tags && tags.length > 1) {
      return res.status(400).json({
        success: false,
        error: 'Only one tag can be selected per product'
      });
    }

    // ============================================
    // PROCESS VARIANTS
    // ============================================
    let processedVariants = [];
    let finalHasVariants = false;

    if (hasVariants && variants && Array.isArray(variants) && variants.length > 0) {
      finalHasVariants = true;

      let idCounter = 0;
      processedVariants = variants.map(vt => {
        const processedVariantType = {
          id: vt.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
          type: vt.type,
          variants: []
        };

        if (vt.variants && Array.isArray(vt.variants)) {
          processedVariantType.variants = vt.variants.map(v => {
            const variant = {
              id: v.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
              name: v.name || '',
              color: v.color || '',
              regularPrice: Number(v.regularPrice) || 0,
              discountPrice: Number(v.discountPrice) || 0,
              buyingPrice: Number(v.buyingPrice) || 0,
              packagingCost: Number(v.packagingCost) || 0,
              deliveryCost: Number(v.deliveryCost) || 0,
              costPerItem: 0,
              stockQuantity: Number(v.stockQuantity) || 0,
              images: v.images || [null, null, null, null],
              imagePreviews: v.imagePreviews || [null, null, null, null],
              subVariants: []
            };

            variant.costPerItem = variant.buyingPrice + variant.packagingCost + variant.deliveryCost;

            if (v.subVariants && Array.isArray(v.subVariants)) {
              variant.subVariants = v.subVariants.map(sv => ({
                id: sv.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
                name: sv.name || '',
                color: sv.color || '',
                regularPrice: Number(sv.regularPrice) || 0,
                discountPrice: Number(sv.discountPrice) || 0,
                buyingPrice: Number(sv.buyingPrice) || 0,
                packagingCost: Number(sv.packagingCost) || 0,
                deliveryCost: Number(sv.deliveryCost) || 0,
                costPerItem: 0,
                stockQuantity: Number(sv.stockQuantity) || 0,
                images: sv.images || [null, null, null, null],
                imagePreviews: sv.imagePreviews || [null, null, null, null]
              }));

              variant.subVariants.forEach(sv => {
                sv.costPerItem = sv.buyingPrice + sv.packagingCost + sv.deliveryCost;
              });
            }

            return variant;
          });
        }

        return processedVariantType;
      });
    }

    // ============================================
    // PROCESS ADD-ONES
    // ============================================
    let processedAddOnes = [];
    if (addOnes && Array.isArray(addOnes) && addOnes.length > 0) {
      const addOnProductIds = addOnes.map(id => new mongoose.Types.ObjectId(id));

      const addOnProducts = await Product.find({
        _id: { $in: addOnProductIds },
        isActive: true
      }).select('productName slug regularPrice discountPrice images brand skuCode stockQuantity');

      processedAddOnes = addOnProducts.map(p => ({
        productId: p._id,
        productName: p.productName,
        slug: p.slug,
        regularPrice: p.regularPrice,
        discountPrice: p.discountPrice || 0,
        images: p.images || [],
        brand: p.brand || '',
        skuCode: p.skuCode || '',
        stockQuantity: p.stockQuantity || 0
      }));
    }

    // ============================================
    // CREATE PRODUCT
    // ============================================
    const product = await Product.create({
      productName,
      slug: finalSlug || undefined,
      shortDescription: shortDescription || '',
      fullDescription,
      category,
      categoryName,
      subcategory: subcategory || null,
      subcategoryName,
      childSubcategory: childSubcategory || null,
      childSubcategoryName,
      brand: brandName || '',
      stockQuantity: stockQuantity || 0,
      stockAlertQuantity: stockAlertQuantity || 0,
      regularPrice: Number(regularPrice),
      costPerItem: calculatedCostPerItem,
      discountPrice: Number(discountPrice) || 0,
      buyingPrice: finalBuyingPrice,
      packagingCost: finalPackagingCost,
      deliveryCost: finalDeliveryCost,
      unit: unit || 'pcs',
      customUnit: customUnit || '',
      colors: colors || [],
      deliveryInfo: deliveryInfo || '',
      tags: tags || [],
      isFeatured: isFeatured || false,
      showOnBanner: showOnBanner || false,
      comingSoon: comingSoon || false,
      isActive: isActive !== undefined ? isActive : true,
      rating: rating || 0,
      additionalInfo: processedAdditionalInfo,
      faqs: processedFaqs,
      metaSettings: processedMetaSettings,
      images: processedImages,
      videoUrl: videoUrl || '',
      videoPublicId: videoPublicId || '',
      videoType: videoType || 'upload',
      barcode: barcode || undefined,
      skuCode: skuCode || undefined,
      hasVariants: finalHasVariants,
      variantTypes: processedVariants,
      addOnes: processedAddOnes,
      createdBy: req.user.id,
      updatedBy: null,
      lastUpdatedAt: null
    });

    // ============================================
    // ASSIGN BARCODE IN BARCODE COLLECTION
    // ============================================
    if (barcode) {
      await assignBarcodeToProduct(barcode, product, req.user.id);
    }

    // ============================================
    // PREPARE EMBEDDED PRODUCT DATA FOR CATEGORY
    // ============================================
    const embeddedProductData = {
      productId: product._id,
      productName: product.productName,
      slug: product.slug,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      brand: product.brand || '',
      images: processedImages,
      regularPrice: product.regularPrice,
      discountPrice: product.discountPrice,
      costPerItem: product.costPerItem,
      buyingPrice: product.buyingPrice,
      packagingCost: product.packagingCost,
      deliveryCost: product.deliveryCost,
      stockQuantity: product.stockQuantity,
      stockAlertQuantity: product.stockAlertQuantity,
      skuCode: product.skuCode,
      unit: product.unit,
      colors: product.colors,
      deliveryInfo: product.deliveryInfo,
      tags: product.tags,
      isFeatured: product.isFeatured,
      showOnBanner: product.showOnBanner,
      comingSoon: product.comingSoon || false,
      isActive: product.isActive,
      rating: product.rating,
      additionalInfo: processedAdditionalInfo,
      faqs: processedFaqs,
      subcategoryId: subcategory || null,
      subcategoryName: subcategoryName,
      childSubcategoryId: childSubcategory || null,
      childSubcategoryName: childSubcategoryName,
      createdBy: req.user.id,
      updatedBy: null,
      lastUpdatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add product to category's products array
    await Category.findByIdAndUpdate(
      category,
      {
        $push: { products: embeddedProductData },
        $inc: { productCount: 1 }
      },
      { new: true }
    );

    // If subcategory is selected, increment product count
    if (subcategory && subcategoryName) {
      await Category.findOneAndUpdate(
        {
          _id: category,
          'subcategories._id': subcategory
        },
        {
          $inc: { 'subcategories.$.productCount': 1 }
        }
      );
    }

    // If child subcategory is selected, increment product count
    if (childSubcategory && childSubcategoryName && subcategory) {
      await Category.findOneAndUpdate(
        {
          _id: category,
          'subcategories._id': subcategory,
          'subcategories.children._id': childSubcategory
        },
        {
          $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 }
        },
        {
          arrayFilters: [
            { 'sub._id': subcategory },
            { 'child._id': childSubcategory }
          ]
        }
      );
    }

    // Populate references for response
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'tags', select: 'name image' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'updatedBy', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);

    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({
          success: false,
          error: `Slug "${req.body.slug || req.body.productName}" already exists. Please use a different slug.`
        });
      }
      if (error.keyPattern && error.keyPattern.skuCode) {
        return res.status(400).json({
          success: false,
          error: `SKU code already exists. Please try again.`
        });
      }
      if (error.keyPattern && error.keyPattern.barcode) {
        return res.status(400).json({
          success: false,
          error: `Barcode already exists. Please use a different barcode.`
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry found. Please check your data and try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating product'
    });
  }
};

// ============================================================
// GET PRODUCTS (PUBLIC)
// ============================================================
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      childSubcategory,
      brand,
      minPrice,
      maxPrice,
      tags,
      isFeatured,
      showOnBanner,
      comingSoon,
      unit,
      search,
      sort = '-createdAt',
      minRating,
      minStock,
      maxStock,
      isActive
    } = req.query;

    let query = {};

    if (isActive === 'false') {
      query.isActive = false;
    } else {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (childSubcategory) {
      query.childSubcategory = childSubcategory;
    }

    if (brand) {
      if (typeof brand === 'string' && !brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = { $regex: brand, $options: 'i' };
      } else {
        query.brand = brand;
      }
    }

    if (minPrice || maxPrice) {
      query.$or = [
        { regularPrice: {} },
        { discountPrice: {} }
      ];
      if (minPrice) {
        query.$or[0].regularPrice.$gte = parseFloat(minPrice);
        query.$or[1].discountPrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.$or[0].regularPrice.$lte = parseFloat(maxPrice);
        query.$or[1].discountPrice.$lte = parseFloat(maxPrice);
      }
    }

    // if (tags) {
    //   const tagArray = Array.isArray(tags) ? tags : [tags];
    //   query.tags = { $in: tagArray };
    // }

    if (tags) {
  const rawTags = Array.isArray(tags) ? tags : [tags];

  // Split: valid ObjectIds go straight to query,
  // non-ObjectIds are treated as slugs and resolved to IDs
  const objectIds = [];
  const slugs = [];

  rawTags.forEach((t) => {
    if (mongoose.Types.ObjectId.isValid(t)) {
      objectIds.push(t);
    } else if (typeof t === 'string' && t.trim()) {
      slugs.push(t.trim());
    }
  });

  // Resolve slugs → tag ObjectIds
  if (slugs.length > 0) {
    const Tag = require('../models/Tag');
    const slugTags = await Tag.find({
      slug: { $in: slugs.map(s => s.toLowerCase()) },
      isActive: true,
    }).select('_id');

    slugTags.forEach(t => objectIds.push(t._id.toString()));
  }

  query.tags = { $in: objectIds };
}

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (showOnBanner === 'true') {
      query.showOnBanner = true;
    }

    if (comingSoon === 'true') {
      query.comingSoon = true;
    } else if (comingSoon === 'false') {
      query.comingSoon = false;
    }

    if (unit) {
      query.unit = unit;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (minStock) {
      query.stockQuantity = { $gte: parseFloat(minStock) };
    }
    if (maxStock) {
      query.stockQuantity = { ...query.stockQuantity, $lte: parseFloat(maxStock) };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { productName: searchRegex },
        { brand: searchRegex },
        { fullDescription: searchRegex },
        { skuCode: searchRegex },
        { barcode: searchRegex }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { regularPrice: 1 };
        break;
      case 'price_desc':
        sortOption = { regularPrice: -1 };
        break;
      case 'rating_desc':
        sortOption = { rating: -1 };
        break;
      case 'name_asc':
        sortOption = { productName: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { purchaseCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const products = await Product.find(query)
      .select('productName slug regularPrice discountPrice images rating stockQuantity unit tags brand category subcategory childSubcategory createdAt fullDescription shortDescription hasVariants variantTypes addOnes comingSoon isActive')
      .populate({
        path: 'category',
        select: 'name slug'
      })
      .populate({
        path: 'tags',
        select: 'name image'
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean({
        virtuals: true,
        getters: true
      });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching products'
    });
  }
};

// ============================================================
// GET ADMIN PRODUCTS
// ============================================================
const getAdminProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      childSubcategory,
      brand,
      minPrice,
      maxPrice,
      tags,
      isFeatured,
      showOnBanner,
      comingSoon,
      unit,
      search,
      sort = '-createdAt',
      minRating,
      minStock,
      maxStock,
      isActive
    } = req.query;

    let query = {};

    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (childSubcategory) {
      query.childSubcategory = childSubcategory;
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.$or = [
        { regularPrice: {} },
        { discountPrice: {} }
      ];
      if (minPrice) {
        query.$or[0].regularPrice.$gte = parseFloat(minPrice);
        query.$or[1].discountPrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.$or[0].regularPrice.$lte = parseFloat(maxPrice);
        query.$or[1].discountPrice.$lte = parseFloat(maxPrice);
      }
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (showOnBanner === 'true') {
      query.showOnBanner = true;
    }

    if (comingSoon === 'true') {
      query.comingSoon = true;
    } else if (comingSoon === 'false') {
      query.comingSoon = false;
    }

    if (unit) {
      query.unit = unit;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (minStock) {
      query.stockQuantity = { $gte: parseFloat(minStock) };
    }
    if (maxStock) {
      query.stockQuantity = { ...query.stockQuantity, $lte: parseFloat(maxStock) };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { productName: regex },
        { brand: regex },
        { fullDescription: regex },
        { skuCode: regex },
        { barcode: regex }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { regularPrice: 1 };
        break;
      case 'price_desc':
        sortOption = { regularPrice: -1 };
        break;
      case 'rating_desc':
        sortOption = { rating: -1 };
        break;
      case 'name_asc':
        sortOption = { productName: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { purchaseCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('tags', 'name image')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('tags', 'name image')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('addOnes.productId', 'productName slug regularPrice discountPrice images brand skuCode stockQuantity');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // ✅ Fetch barcode image URL from Barcode collection
    let barcodeImageUrl = '';
    let barcodeImagePublicId = '';
    if (product.barcode) {
      try {
        const barcodeDoc = await Barcode.findOne({ barcodeNumber: product.barcode });
        if (barcodeDoc) {
          barcodeImageUrl = barcodeDoc.barcodeImageUrl || '';
          barcodeImagePublicId = barcodeDoc.barcodeImagePublicId || '';
        }
      } catch (barcodeErr) {
        console.error('Error fetching barcode image:', barcodeErr);
      }
    }

    // Increment view count
    product.views += 1;
    await product.save();

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(8)
      .populate('category', 'name slug')
      .populate('tags', 'name image')
      .select('productName slug regularPrice discountPrice images rating stockQuantity tags category categoryName subcategoryName childSubcategoryName brand unit hasVariants variantTypes comingSoon');

    // ✅ Convert to plain object and add barcode image
    const productObj = product.toObject();
    productObj.barcodeImageUrl = barcodeImageUrl;
    productObj.barcodeImagePublicId = barcodeImagePublicId;

    res.json({
      success: true,
      data: {
        product: productObj,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching product'
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
// const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ success: false, error: 'Product not found' });
//     }
//     // ✅ Capture the base stock BEFORE any mutation, for restock logging
// const previousBaseStock = Number(product.stockQuantity) || 0;

//     if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Permission denied. Only super admins, admins, and moderators can update products.'
//       });
//     }

//     const {
//       productName,
//       slug,
//       shortDescription,
//       fullDescription,
//       category,
//       subcategory,
//       childSubcategory,
//       brand,
//       stockQuantity,
//       stockAlertQuantity,
//       skuCode,
//       regularPrice,
//       discountPrice,
//       buyingPrice,
//       packagingCost,
//       deliveryCost,
//       unit,
//       customUnit,
//       colors,
//       deliveryInfo,
//       tags,
//       isFeatured,
//       showOnBanner,
//       comingSoon,
//       isActive,
//       rating,
//       additionalInfo,
//       faqs,
//       metaSettings,
//       images,
//       barcode,
//       videoUrl,
//       videoPublicId,
//       videoType,
//       hasVariants,
//       variants,
//       addOnes
//     } = req.body;

//     // ============================================
//     // BUYING PRICE - Only super_admin and admin can update
//     // ============================================
//     let finalBuyingPrice = product.buyingPrice || 0;
//     if (req.user.role === 'super_admin' || req.user.role === 'admin') {
//       if (buyingPrice !== undefined) {
//         finalBuyingPrice = buyingPrice ? Number(buyingPrice) : 0;
//       }
//     }

//     let finalPackagingCost = product.packagingCost || 0;
//     if (packagingCost !== undefined) {
//       finalPackagingCost = packagingCost ? Number(packagingCost) : 0;
//     }

//     let finalDeliveryCost = product.deliveryCost || 0;
//     if (deliveryCost !== undefined) {
//       finalDeliveryCost = deliveryCost ? Number(deliveryCost) : 0;
//     }

//     // Auto-calculate cost per item
//     const calculatedCostPerItem = finalBuyingPrice + finalPackagingCost + finalDeliveryCost;

//     // ============================================
//     // SLUG VALIDATION
//     // ============================================
//     let finalSlug = product.slug;
//     if (slug !== undefined && slug !== product.slug) {
//       if (slug) {
//         finalSlug = slug
//           .toLowerCase()
//           .trim()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/(^-|-$)+/g, '');

//         const existingSlug = await Product.findOne({
//           slug: finalSlug,
//           _id: { $ne: product._id }
//         });
//         if (existingSlug) {
//           return res.status(400).json({
//             success: false,
//             error: `Slug "${finalSlug}" is already taken. Please use a different slug.`
//           });
//         }
//       } else {
//         finalSlug = productName
//           ? productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
//           : product.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//       }
//     }

//     // ============================================
//     // BARCODE VALIDATION
//     // ============================================
//     let newBarcode = product.barcode;
//     let shouldUpdateBarcode = false;

//     if (barcode !== undefined && barcode !== product.barcode) {
//       shouldUpdateBarcode = true;

//       if (barcode === '' || barcode === null) {
//         newBarcode = undefined;
//       } else {
//         // Validate format
//         if (!/^[0-9]{8,13}$/.test(barcode)) {
//           return res.status(400).json({
//             success: false,
//             error: 'Barcode must be 8-13 digits only'
//           });
//         }

//         // Check if barcode is used by another product
//         const existingProductWithBarcode = await Product.findOne({
//           barcode: barcode,
//           _id: { $ne: product._id }
//         });
//         if (existingProductWithBarcode) {
//           return res.status(400).json({
//             success: false,
//             error: `Barcode "${barcode}" is already assigned to product: ${existingProductWithBarcode.productName}`
//           });
//         }

//         // Check Barcode collection
//         const barcodeDoc = await Barcode.findOne({ barcodeNumber: barcode });
//         if (barcodeDoc && barcodeDoc.status === 'assigned' && barcodeDoc.productId?.toString() !== product._id.toString()) {
//           return res.status(400).json({
//             success: false,
//             error: `Barcode "${barcode}" is already assigned to another product`
//           });
//         }

//         newBarcode = barcode;
//       }
//     }

//     // Get brand name from brand ID (if provided)
//     let brandName = brand;
//     if (brand && mongoose.Types.ObjectId.isValid(brand)) {
//       try {
//         const Brand = require('../models/Brand');
//         const brandDoc = await Brand.findById(brand);
//         if (brandDoc) {
//           brandName = brandDoc.name;
//         } else {
//           brandName = brand;
//         }
//       } catch (brandError) {
//         console.error('Error fetching brand:', brandError);
//         brandName = brand;
//       }
//     }

//     // Store old values for count updates
//     const oldCategory = product.category.toString();
//     const oldSubcategoryId = product.subcategory ? product.subcategory.toString() : null;
//     const oldChildSubcategoryId = product.childSubcategory ? product.childSubcategory.toString() : null;

//     const newCategory = category || oldCategory;
//     let newSubcategoryId = subcategory || null;
//     let newSubcategoryName = '';
//     let newChildSubcategoryId = childSubcategory || null;
//     let newChildSubcategoryName = '';

//     if (category && category !== oldCategory) {
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//         return res.status(400).json({ success: false, error: 'Invalid category' });
//       }
//     }

//     if (newSubcategoryId) {
//       const categoryDoc = await Category.findById(newCategory);
//       if (categoryDoc) {
//         const subcategoryDoc = categoryDoc.subcategories.id(newSubcategoryId);
//         if (subcategoryDoc) {
//           newSubcategoryName = subcategoryDoc.name;

//           if (newChildSubcategoryId) {
//             const childDoc = subcategoryDoc.children.id(newChildSubcategoryId);
//             if (childDoc) {
//               newChildSubcategoryName = childDoc.name;
//             }
//           }
//         }
//       }
//     }

//     // Process images if provided
//     let processedImages = product.images;
//     if (images && Array.isArray(images) && images.length > 0) {
//       processedImages = images.map((url, index) => ({
//         url: url,
//         publicId: extractPublicIdFromUrl(url),
//         isPrimary: index === 0
//       }));
//     }

//     // Process additional info
//     let processedAdditionalInfo = product.additionalInfo;
//     if (additionalInfo && Array.isArray(additionalInfo)) {
//       processedAdditionalInfo = additionalInfo;
//     }

//     // Process FAQs
//     let processedFaqs = product.faqs || [];
//     if (faqs !== undefined) {
//       if (Array.isArray(faqs)) {
//         processedFaqs = faqs.filter(faq =>
//           faq.question && faq.question.trim() &&
//           faq.answer && faq.answer.trim()
//         );
//       } else {
//         processedFaqs = [];
//       }
//     }

//     // Process meta settings
//     let processedMetaSettings = product.metaSettings;
//     if (metaSettings) {
//       processedMetaSettings = {
//         metaTitle: metaSettings.metaTitle || product.metaSettings?.metaTitle || '',
//         metaDescription: metaSettings.metaDescription || product.metaSettings?.metaDescription || '',
//         metaKeywords: metaSettings.metaKeywords || product.metaSettings?.metaKeywords || []
//       };
//     }

//     // Validate tags (only one tag)
//     if (tags && tags.length > 1) {
//       return res.status(400).json({
//         success: false,
//         error: 'Only one tag can be selected per product'
//       });
//     }

//     // ============================================
//     // PROCESS VARIANTS
//     // ============================================
//     let processedVariants = product.variantTypes || [];
//     let finalHasVariants = hasVariants !== undefined ? hasVariants : product.hasVariants;

//     if (variants !== undefined && Array.isArray(variants)) {
//       if (variants.length > 0) {
//         finalHasVariants = true;

//         let idCounter = 0;

//         processedVariants = variants.map(vt => {
//           const processedVariantType = {
//             id: vt.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
//             type: vt.type,
//             variants: []
//           };

//           if (vt.variants && Array.isArray(vt.variants)) {
//             processedVariantType.variants = vt.variants.map(v => {
//               const variant = {
//                 id: v.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
//                 name: v.name || '',
//                 color: v.color || '',
//                 regularPrice: Number(v.regularPrice) || 0,
//                 discountPrice: Number(v.discountPrice) || 0,
//                 buyingPrice: Number(v.buyingPrice) || 0,
//                 packagingCost: Number(v.packagingCost) || 0,
//                 deliveryCost: Number(v.deliveryCost) || 0,
//                 costPerItem: 0,
//                 stockQuantity: Number(v.stockQuantity) || 0,
//                 images: v.images || [null, null, null, null],
//                 imagePreviews: v.imagePreviews || [null, null, null, null],
//                 subVariants: []
//               };

//               variant.costPerItem = variant.buyingPrice + variant.packagingCost + variant.deliveryCost;

//               if (v.subVariants && Array.isArray(v.subVariants)) {
//                 variant.subVariants = v.subVariants.map(sv => ({
//                   id: sv.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
//                   name: sv.name || '',
//                   color: sv.color || '',
//                   regularPrice: Number(sv.regularPrice) || 0,
//                   discountPrice: Number(sv.discountPrice) || 0,
//                   buyingPrice: Number(sv.buyingPrice) || 0,
//                   packagingCost: Number(sv.packagingCost) || 0,
//                   deliveryCost: Number(sv.deliveryCost) || 0,
//                   costPerItem: 0,
//                   stockQuantity: Number(sv.stockQuantity) || 0,
//                   images: sv.images || [null, null, null, null],
//                   imagePreviews: sv.imagePreviews || [null, null, null, null]
//                 }));

//                 variant.subVariants.forEach(sv => {
//                   sv.costPerItem = sv.buyingPrice + sv.packagingCost + sv.deliveryCost;
//                 });
//               }

//               return variant;
//             });
//           }

//           return processedVariantType;
//         });
//       } else {
//         finalHasVariants = false;
//         processedVariants = [];
//       }
//     }

//     // ============================================
//     // PROCESS ADD-ONES
//     // ============================================
//     let processedAddOnes = product.addOnes || [];
//     if (addOnes !== undefined) {
//       if (Array.isArray(addOnes) && addOnes.length > 0) {
//         const addOnProductIds = addOnes.map(id => new mongoose.Types.ObjectId(id));

//         const addOnProducts = await Product.find({
//           _id: { $in: addOnProductIds },
//           isActive: true
//         }).select('productName slug regularPrice discountPrice images brand skuCode stockQuantity');

//         processedAddOnes = addOnProducts.map(p => ({
//           productId: p._id,
//           productName: p.productName,
//           slug: p.slug,
//           regularPrice: p.regularPrice,
//           discountPrice: p.discountPrice || 0,
//           images: p.images || [],
//           brand: p.brand || '',
//           skuCode: p.skuCode || '',
//           stockQuantity: p.stockQuantity || 0
//         }));
//       } else {
//         processedAddOnes = [];
//       }
//     }

//     // ============================================
//     // UPDATE PRODUCT FIELDS
//     // ============================================
//     if (productName) product.productName = productName;
//     if (slug !== undefined) product.slug = finalSlug;
//     if (shortDescription !== undefined) product.shortDescription = shortDescription || '';
//     if (fullDescription && fullDescription !== '<p></p>') product.fullDescription = fullDescription;
//     if (brandName !== undefined) product.brand = brandName || '';
//     if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
//     if (stockAlertQuantity !== undefined) product.stockAlertQuantity = stockAlertQuantity || 0;
//     if (skuCode) product.skuCode = skuCode;
//     if (regularPrice !== undefined) product.regularPrice = regularPrice;

//     product.costPerItem = calculatedCostPerItem;

//     if (discountPrice !== undefined) product.discountPrice = discountPrice;
//     if (buyingPrice !== undefined) product.buyingPrice = finalBuyingPrice;
//     if (packagingCost !== undefined) product.packagingCost = finalPackagingCost;
//     if (deliveryCost !== undefined) product.deliveryCost = finalDeliveryCost;
//     if (unit) product.unit = unit;
//     if (customUnit !== undefined) product.customUnit = customUnit || '';
//     if (colors !== undefined) product.colors = colors || [];
//     if (deliveryInfo !== undefined) product.deliveryInfo = deliveryInfo || '';
//     if (tags) product.tags = tags;
//     if (isFeatured !== undefined) product.isFeatured = isFeatured;
//     if (showOnBanner !== undefined) product.showOnBanner = showOnBanner;
//     if (comingSoon !== undefined) product.comingSoon = comingSoon;
//     if (isActive !== undefined) product.isActive = isActive;
//     if (rating !== undefined) product.rating = rating;
//     if (additionalInfo) product.additionalInfo = processedAdditionalInfo;
//     if (faqs !== undefined) product.faqs = processedFaqs;
//     if (metaSettings) product.metaSettings = processedMetaSettings;
//     if (images && Array.isArray(images) && images.length > 0) product.images = processedImages;
//     if (videoUrl !== undefined) product.videoUrl = videoUrl || '';
//     if (videoPublicId !== undefined) product.videoPublicId = videoPublicId || '';
//     if (videoType !== undefined) product.videoType = videoType || 'upload';

//     product.hasVariants = finalHasVariants;
//     product.variantTypes = processedVariants;
//     product.addOnes = processedAddOnes;

//     // Tracking
//     product.updatedBy = req.user.id;
//     product.lastUpdatedAt = new Date();

//     // ============================================
//     // HANDLE BARCODE UPDATE
//     // ============================================
//     if (shouldUpdateBarcode) {
//       // Release old barcode
//       if (product.barcode && product.barcode !== newBarcode) {
//         await releaseBarcodeFromProduct(product.barcode);
//       }

//       // Assign new barcode
//       if (newBarcode) {
//         product.barcode = newBarcode;
//       } else {
//         product.barcode = undefined;
//       }
//     }

//     // Update category if changed
//     if (category && category !== oldCategory) {
//       product.category = category;
//       const categoryExists = await Category.findById(category);
//       if (categoryExists) {
//         product.categoryName = categoryExists.name;
//       }
//       product.subcategory = newSubcategoryId;
//       product.subcategoryName = newSubcategoryName;
//       product.childSubcategory = newChildSubcategoryId;
//       product.childSubcategoryName = newChildSubcategoryName;
//     } else {
//       if (subcategory !== undefined) {
//         product.subcategory = newSubcategoryId;
//         product.subcategoryName = newSubcategoryName;
//       }
//       if (childSubcategory !== undefined) {
//         product.childSubcategory = newChildSubcategoryId;
//         product.childSubcategoryName = newChildSubcategoryName;
//       }
//     }

//     await product.save();


//     // ============================================
// // LOG STOCK INCREASE FROM EDIT (if any)
// // ============================================
// try {
//   const newBaseStock = Number(product.stockQuantity) || 0;
//   const diff = newBaseStock - previousBaseStock;

//   if (diff > 0) {
//     await RestockLog.create({
//       productId: product._id,
//       productName: product.productName,
//       skuCode: product.skuCode || '',
//       barcode: product.barcode || '',
//       variantId: null,
//       subVariantId: null,
//       variantName: '',
//       subVariantName: '',
//       addQuantity: diff,
//       previousStock: previousBaseStock,
//       newStock: newBaseStock,
//       restockedBy: req.user.id,
//       restockedByName: req.user.name || '',
//       restockedByEmail: req.user.email || '',
//       restockedByRole: req.user.role || '',
//       restockedAt: new Date(),
//       source: 'edit'
//     });
//   }
// } catch (logErr) {
//   console.error('Restock log (edit) error:', logErr);
// }

//     // ============================================
//     // ASSIGN NEW BARCODE AFTER SAVE
//     // ============================================
//     if (shouldUpdateBarcode && newBarcode) {
//       await assignBarcodeToProduct(newBarcode, product, req.user.id);
//     }

//     // ============================================
//     // UPDATE EMBEDDED PRODUCT IN CATEGORY
//     // ============================================
//     const embeddedUpdateData = {
//       productName: product.productName,
//       slug: product.slug,
//       shortDescription: product.shortDescription,
//       fullDescription: product.fullDescription,
//       brand: product.brand || '',
//       images: processedImages,
//       regularPrice: product.regularPrice,
//       discountPrice: product.discountPrice,
//       costPerItem: product.costPerItem,
//       buyingPrice: product.buyingPrice || 0,
//       packagingCost: product.packagingCost || 0,
//       deliveryCost: product.deliveryCost || 0,
//       stockQuantity: product.stockQuantity,
//       stockAlertQuantity: product.stockAlertQuantity,
//       skuCode: product.skuCode,
//       unit: product.unit,
//       colors: product.colors,
//       deliveryInfo: product.deliveryInfo,
//       tags: product.tags,
//       isFeatured: product.isFeatured,
//       showOnBanner: product.showOnBanner,
//       comingSoon: product.comingSoon || false,
//       isActive: product.isActive,
//       rating: product.rating,
//       additionalInfo: processedAdditionalInfo,
//       faqs: processedFaqs,
//       subcategoryId: product.subcategory,
//       subcategoryName: product.subcategoryName,
//       childSubcategoryId: product.childSubcategory,
//       childSubcategoryName: product.childSubcategoryName,
//       updatedBy: req.user.id,
//       lastUpdatedAt: new Date(),
//       updatedAt: new Date()
//     };

//     // Handle category change
//     if (category && category !== oldCategory) {
//       await Category.findByIdAndUpdate(
//         oldCategory,
//         {
//           $pull: { products: { productId: product._id } },
//           $inc: { productCount: -1 }
//         }
//       );

//       if (oldSubcategoryId) {
//         await Category.findOneAndUpdate(
//           {
//             _id: oldCategory,
//             'subcategories._id': oldSubcategoryId
//           },
//           { $inc: { 'subcategories.$.productCount': -1 } }
//         );
//       }

//       if (oldChildSubcategoryId && oldSubcategoryId) {
//         await Category.findOneAndUpdate(
//           {
//             _id: oldCategory,
//             'subcategories._id': oldSubcategoryId,
//             'subcategories.children._id': oldChildSubcategoryId
//           },
//           { $inc: { 'subcategories.$[sub].children.$[child].productCount': -1 } },
//           {
//             arrayFilters: [
//               { 'sub._id': oldSubcategoryId },
//               { 'child._id': oldChildSubcategoryId }
//             ]
//           }
//         );
//       }

//       const newEmbeddedProduct = {
//         productId: product._id,
//         ...embeddedUpdateData,
//         createdBy: req.user.id,
//         createdAt: product.createdAt
//       };

//       await Category.findByIdAndUpdate(
//         newCategory,
//         {
//           $push: { products: newEmbeddedProduct },
//           $inc: { productCount: 1 }
//         }
//       );

//       if (newSubcategoryId) {
//         await Category.findOneAndUpdate(
//           {
//             _id: newCategory,
//             'subcategories._id': newSubcategoryId
//           },
//           { $inc: { 'subcategories.$.productCount': 1 } }
//         );
//       }

//       if (newChildSubcategoryId && newSubcategoryId) {
//         await Category.findOneAndUpdate(
//           {
//             _id: newCategory,
//             'subcategories._id': newSubcategoryId,
//             'subcategories.children._id': newChildSubcategoryId
//           },
//           { $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 } },
//           {
//             arrayFilters: [
//               { 'sub._id': newSubcategoryId },
//               { 'child._id': newChildSubcategoryId }
//             ]
//           }
//         );
//       }
//     } else {
//       await updateEmbeddedProductInCategory(oldCategory, product._id, embeddedUpdateData);

//       if (oldSubcategoryId !== newSubcategoryId) {
//         if (oldSubcategoryId) {
//           await Category.findOneAndUpdate(
//             {
//               _id: oldCategory,
//               'subcategories._id': oldSubcategoryId
//             },
//             { $inc: { 'subcategories.$.productCount': -1 } }
//           );
//         }
//         if (newSubcategoryId) {
//           await Category.findOneAndUpdate(
//             {
//               _id: oldCategory,
//               'subcategories._id': newSubcategoryId
//             },
//             { $inc: { 'subcategories.$.productCount': 1 } }
//           );
//         }
//       }

//       if (oldChildSubcategoryId !== newChildSubcategoryId) {
//         if (oldChildSubcategoryId && oldSubcategoryId) {
//           await Category.findOneAndUpdate(
//             {
//               _id: oldCategory,
//               'subcategories._id': oldSubcategoryId,
//               'subcategories.children._id': oldChildSubcategoryId
//             },
//             { $inc: { 'subcategories.$[sub].children.$[child].productCount': -1 } },
//             {
//               arrayFilters: [
//                 { 'sub._id': oldSubcategoryId },
//                 { 'child._id': oldChildSubcategoryId }
//               ]
//             }
//           );
//         }
//         if (newChildSubcategoryId && newSubcategoryId) {
//           await Category.findOneAndUpdate(
//             {
//               _id: oldCategory,
//               'subcategories._id': newSubcategoryId,
//               'subcategories.children._id': newChildSubcategoryId
//             },
//             { $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 } },
//             {
//               arrayFilters: [
//                 { 'sub._id': newSubcategoryId },
//                 { 'child._id': newChildSubcategoryId }
//               ]
//             }
//           );
//         }
//       }
//     }

//     // Populate references for response
//     await product.populate([
//       { path: 'category', select: 'name slug' },
//       { path: 'tags', select: 'name image' },
//       { path: 'createdBy', select: 'name email role' },
//       { path: 'updatedBy', select: 'name email role' },
//       { path: 'addOnes.productId', select: 'productName slug regularPrice discountPrice images brand skuCode stockQuantity' }
//     ]);

//     res.json({
//       success: true,
//       data: product,
//       message: 'Product updated successfully'
//     });

//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating product'
//     });
//   }
// };

// ============================================================
// UPDATE PRODUCT
// ============================================================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // ✅ Capture base stock BEFORE mutation
    const previousBaseStock = Number(product.stockQuantity) || 0;

    // ✅ Snapshot variant + sub-variant stocks BEFORE mutation
    // Key format:
    //   v:<variantId>                → variant-level stock
    //   s:<variantId>:<subVariantId> → sub-variant-level stock
    const previousStockSnapshots = new Map();

    (product.variantTypes || []).forEach((vt) => {
      (vt.variants || []).forEach((v) => {
        const vId = v.id || (v._id ? v._id.toString() : null);
        if (!vId) return;

        previousStockSnapshots.set(`v:${vId}`, {
          stock: Number(v.stockQuantity) || 0,
          variantName: v.name || '',
          subVariantName: '',
          skuCode: v.skuCode || '',
          barcode: v.barcode || '',
        });

        (v.subVariants || []).forEach((sv) => {
          const svId = sv.id || (sv._id ? sv._id.toString() : null);
          if (!svId) return;

          previousStockSnapshots.set(`s:${vId}:${svId}`, {
            stock: Number(sv.stockQuantity) || 0,
            variantName: v.name || '',
            subVariantName: sv.name || '',
            skuCode: sv.skuCode || '',
            barcode: sv.barcode || '',
          });
        });
      });
    });

    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can update products.'
      });
    }

    const {
      productName,
      slug,
      shortDescription,
      fullDescription,
      category,
      subcategory,
      childSubcategory,
      brand,
      stockQuantity,
      stockAlertQuantity,
      skuCode,
      regularPrice,
      discountPrice,
      buyingPrice,
      packagingCost,
      deliveryCost,
      unit,
      customUnit,
      colors,
      deliveryInfo,
      tags,
      isFeatured,
      showOnBanner,
      comingSoon,
      isActive,
      rating,
      additionalInfo,
      faqs,
      metaSettings,
      images,
      barcode,
      videoUrl,
      videoPublicId,
      videoType,
      hasVariants,
      variants,
      addOnes
    } = req.body;

    let finalBuyingPrice = product.buyingPrice || 0;
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      if (buyingPrice !== undefined) {
        finalBuyingPrice = buyingPrice ? Number(buyingPrice) : 0;
      }
    }

    let finalPackagingCost = product.packagingCost || 0;
    if (packagingCost !== undefined) {
      finalPackagingCost = packagingCost ? Number(packagingCost) : 0;
    }

    let finalDeliveryCost = product.deliveryCost || 0;
    if (deliveryCost !== undefined) {
      finalDeliveryCost = deliveryCost ? Number(deliveryCost) : 0;
    }

    const calculatedCostPerItem =
      finalBuyingPrice + finalPackagingCost + finalDeliveryCost;

    let finalSlug = product.slug;
    if (slug !== undefined && slug !== product.slug) {
      if (slug) {
        finalSlug = slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const existingSlug = await Product.findOne({
          slug: finalSlug,
          _id: { $ne: product._id }
        });
        if (existingSlug) {
          return res.status(400).json({
            success: false,
            error: `Slug "${finalSlug}" is already taken. Please use a different slug.`
          });
        }
      } else {
        finalSlug = productName
          ? productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
          : product.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
    }

    let newBarcode = product.barcode;
    let shouldUpdateBarcode = false;

    if (barcode !== undefined && barcode !== product.barcode) {
      shouldUpdateBarcode = true;

      if (barcode === '' || barcode === null) {
        newBarcode = undefined;
      } else {
        if (!/^[0-9]{8,13}$/.test(barcode)) {
          return res.status(400).json({
            success: false,
            error: 'Barcode must be 8-13 digits only'
          });
        }

        const existingProductWithBarcode = await Product.findOne({
          barcode: barcode,
          _id: { $ne: product._id }
        });
        if (existingProductWithBarcode) {
          return res.status(400).json({
            success: false,
            error: `Barcode "${barcode}" is already assigned to product: ${existingProductWithBarcode.productName}`
          });
        }

        const barcodeDoc = await Barcode.findOne({ barcodeNumber: barcode });
        if (
          barcodeDoc &&
          barcodeDoc.status === 'assigned' &&
          barcodeDoc.productId?.toString() !== product._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            error: `Barcode "${barcode}" is already assigned to another product`
          });
        }

        newBarcode = barcode;
      }
    }

    let brandName = brand;
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      try {
        const Brand = require('../models/Brand');
        const brandDoc = await Brand.findById(brand);
        if (brandDoc) {
          brandName = brandDoc.name;
        } else {
          brandName = brand;
        }
      } catch (brandError) {
        console.error('Error fetching brand:', brandError);
        brandName = brand;
      }
    }

    const oldCategory = product.category.toString();
    const oldSubcategoryId = product.subcategory ? product.subcategory.toString() : null;
    const oldChildSubcategoryId = product.childSubcategory ? product.childSubcategory.toString() : null;

    const newCategory = category || oldCategory;
    let newSubcategoryId = subcategory || null;
    let newSubcategoryName = '';
    let newChildSubcategoryId = childSubcategory || null;
    let newChildSubcategoryName = '';

    if (category && category !== oldCategory) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, error: 'Invalid category' });
      }
    }

    if (newSubcategoryId) {
      const categoryDoc = await Category.findById(newCategory);
      if (categoryDoc) {
        const subcategoryDoc = categoryDoc.subcategories.id(newSubcategoryId);
        if (subcategoryDoc) {
          newSubcategoryName = subcategoryDoc.name;

          if (newChildSubcategoryId) {
            const childDoc = subcategoryDoc.children.id(newChildSubcategoryId);
            if (childDoc) {
              newChildSubcategoryName = childDoc.name;
            }
          }
        }
      }
    }

    let processedImages = product.images;
    if (images && Array.isArray(images) && images.length > 0) {
      processedImages = images.map((url, index) => ({
        url: url,
        publicId: extractPublicIdFromUrl(url),
        isPrimary: index === 0
      }));
    }

    let processedAdditionalInfo = product.additionalInfo;
    if (additionalInfo && Array.isArray(additionalInfo)) {
      processedAdditionalInfo = additionalInfo;
    }

    let processedFaqs = product.faqs || [];
    if (faqs !== undefined) {
      if (Array.isArray(faqs)) {
        processedFaqs = faqs.filter(
          faq => faq.question && faq.question.trim() && faq.answer && faq.answer.trim()
        );
      } else {
        processedFaqs = [];
      }
    }

    let processedMetaSettings = product.metaSettings;
    if (metaSettings) {
      processedMetaSettings = {
        metaTitle: metaSettings.metaTitle || product.metaSettings?.metaTitle || '',
        metaDescription: metaSettings.metaDescription || product.metaSettings?.metaDescription || '',
        metaKeywords: metaSettings.metaKeywords || product.metaSettings?.metaKeywords || []
      };
    }

    if (tags && tags.length > 1) {
      return res.status(400).json({
        success: false,
        error: 'Only one tag can be selected per product'
      });
    }

    // ============================================
    // PROCESS VARIANTS
    // ============================================
    let processedVariants = product.variantTypes || [];
    let finalHasVariants = hasVariants !== undefined ? hasVariants : product.hasVariants;

    if (variants !== undefined && Array.isArray(variants)) {
      if (variants.length > 0) {
        finalHasVariants = true;
        let idCounter = 0;

        processedVariants = variants.map(vt => {
          const processedVariantType = {
            id: vt.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
            type: vt.type,
            variants: []
          };

          if (vt.variants && Array.isArray(vt.variants)) {
            processedVariantType.variants = vt.variants.map(v => {
              const variant = {
                id: v.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
                name: v.name || '',
                color: v.color || '',
                regularPrice: Number(v.regularPrice) || 0,
                discountPrice: Number(v.discountPrice) || 0,
                buyingPrice: Number(v.buyingPrice) || 0,
                packagingCost: Number(v.packagingCost) || 0,
                deliveryCost: Number(v.deliveryCost) || 0,
                costPerItem: 0,
                stockQuantity: Number(v.stockQuantity) || 0,
                images: v.images || [null, null, null, null],
                imagePreviews: v.imagePreviews || [null, null, null, null],
                subVariants: []
              };

              variant.costPerItem =
                variant.buyingPrice + variant.packagingCost + variant.deliveryCost;

              if (v.subVariants && Array.isArray(v.subVariants)) {
                variant.subVariants = v.subVariants.map(sv => ({
                  id: sv.id || `${Date.now()}_${idCounter++}_${Math.random().toString(36).substr(2, 6)}`,
                  name: sv.name || '',
                  color: sv.color || '',
                  regularPrice: Number(sv.regularPrice) || 0,
                  discountPrice: Number(sv.discountPrice) || 0,
                  buyingPrice: Number(sv.buyingPrice) || 0,
                  packagingCost: Number(sv.packagingCost) || 0,
                  deliveryCost: Number(sv.deliveryCost) || 0,
                  costPerItem: 0,
                  stockQuantity: Number(sv.stockQuantity) || 0,
                  images: sv.images || [null, null, null, null],
                  imagePreviews: sv.imagePreviews || [null, null, null, null]
                }));

                variant.subVariants.forEach(sv => {
                  sv.costPerItem = sv.buyingPrice + sv.packagingCost + sv.deliveryCost;
                });
              }

              return variant;
            });
          }

          return processedVariantType;
        });
      } else {
        finalHasVariants = false;
        processedVariants = [];
      }
    }

    // ============================================
    // PROCESS ADD-ONES
    // ============================================
    let processedAddOnes = product.addOnes || [];
    if (addOnes !== undefined) {
      if (Array.isArray(addOnes) && addOnes.length > 0) {
        const addOnProductIds = addOnes.map(id => new mongoose.Types.ObjectId(id));

        const addOnProducts = await Product.find({
          _id: { $in: addOnProductIds },
          isActive: true
        }).select('productName slug regularPrice discountPrice images brand skuCode stockQuantity');

        processedAddOnes = addOnProducts.map(p => ({
          productId: p._id,
          productName: p.productName,
          slug: p.slug,
          regularPrice: p.regularPrice,
          discountPrice: p.discountPrice || 0,
          images: p.images || [],
          brand: p.brand || '',
          skuCode: p.skuCode || '',
          stockQuantity: p.stockQuantity || 0
        }));
      } else {
        processedAddOnes = [];
      }
    }

    // ============================================
    // UPDATE PRODUCT FIELDS
    // ============================================
    if (productName) product.productName = productName;
    if (slug !== undefined) product.slug = finalSlug;
    if (shortDescription !== undefined) product.shortDescription = shortDescription || '';
    if (fullDescription && fullDescription !== '<p></p>') product.fullDescription = fullDescription;
    if (brandName !== undefined) product.brand = brandName || '';
    // For variant products, root stock is derived from variant stock.
    // The submitted root value is only used for products without variants.
    if (finalHasVariants) {
      product.stockQuantity = processedVariants.reduce(
        (total, variantType) => total + (variantType.variants || []).reduce(
          (variantTotal, variant) => variantTotal + (Number(variant.stockQuantity) || 0),
          0
        ),
        0
      );
    } else if (stockQuantity !== undefined) {
      product.stockQuantity = stockQuantity;
    }
    if (stockAlertQuantity !== undefined) product.stockAlertQuantity = stockAlertQuantity || 0;
    if (skuCode) product.skuCode = skuCode;
    if (regularPrice !== undefined) product.regularPrice = regularPrice;

    product.costPerItem = calculatedCostPerItem;

    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (buyingPrice !== undefined) product.buyingPrice = finalBuyingPrice;
    if (packagingCost !== undefined) product.packagingCost = finalPackagingCost;
    if (deliveryCost !== undefined) product.deliveryCost = finalDeliveryCost;
    if (unit) product.unit = unit;
    if (customUnit !== undefined) product.customUnit = customUnit || '';
    if (colors !== undefined) product.colors = colors || [];
    if (deliveryInfo !== undefined) product.deliveryInfo = deliveryInfo || '';
    if (tags) product.tags = tags;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (showOnBanner !== undefined) product.showOnBanner = showOnBanner;
    if (comingSoon !== undefined) product.comingSoon = comingSoon;
    if (isActive !== undefined) product.isActive = isActive;
    if (rating !== undefined) product.rating = rating;
    if (additionalInfo) product.additionalInfo = processedAdditionalInfo;
    if (faqs !== undefined) product.faqs = processedFaqs;
    if (metaSettings) product.metaSettings = processedMetaSettings;
    if (images && Array.isArray(images) && images.length > 0) product.images = processedImages;
    if (videoUrl !== undefined) product.videoUrl = videoUrl || '';
    if (videoPublicId !== undefined) product.videoPublicId = videoPublicId || '';
    if (videoType !== undefined) product.videoType = videoType || 'upload';

    product.hasVariants = finalHasVariants;
    product.variantTypes = processedVariants;
    product.addOnes = processedAddOnes;

    product.updatedBy = req.user.id;
    product.lastUpdatedAt = new Date();

    if (shouldUpdateBarcode) {
      if (product.barcode && product.barcode !== newBarcode) {
        await releaseBarcodeFromProduct(product.barcode);
      }

      if (newBarcode) {
        product.barcode = newBarcode;
      } else {
        product.barcode = undefined;
      }
    }

    if (category && category !== oldCategory) {
      product.category = category;
      const categoryExists = await Category.findById(category);
      if (categoryExists) {
        product.categoryName = categoryExists.name;
      }
      product.subcategory = newSubcategoryId;
      product.subcategoryName = newSubcategoryName;
      product.childSubcategory = newChildSubcategoryId;
      product.childSubcategoryName = newChildSubcategoryName;
    } else {
      if (subcategory !== undefined) {
        product.subcategory = newSubcategoryId;
        product.subcategoryName = newSubcategoryName;
      }
      if (childSubcategory !== undefined) {
        product.childSubcategory = newChildSubcategoryId;
        product.childSubcategoryName = newChildSubcategoryName;
      }
    }

    await product.save();

    // ============================================
    // ✅ LOG STOCK INCREASES FROM EDIT (base + variants + sub-variants)
    // ============================================
    try {
      const logsToInsert = [];

      // ---- Base product ----
      const newBaseStock = Number(product.stockQuantity) || 0;
      const baseDiff = newBaseStock - previousBaseStock;
      if (!finalHasVariants && baseDiff > 0) {
        logsToInsert.push({
          productId: product._id,
          productName: product.productName,
          skuCode: product.skuCode || '',
          barcode: product.barcode || '',
          variantId: null,
          subVariantId: null,
          variantName: '',
          subVariantName: '',
          addQuantity: baseDiff,
          previousStock: previousBaseStock,
          newStock: newBaseStock,
          restockedBy: req.user.id,
          restockedByName: req.user.name || '',
          restockedByEmail: req.user.email || '',
          restockedByRole: req.user.role || '',
          restockedAt: new Date(),
          source: 'edit',
        });
      }

      // ---- Variants + sub-variants ----
      (product.variantTypes || []).forEach((vt) => {
        (vt.variants || []).forEach((v) => {
          const vId = v.id || (v._id ? v._id.toString() : null);
          if (!vId) return;

          const newVStock = Number(v.stockQuantity) || 0;
          const prevV = previousStockSnapshots.get(`v:${vId}`);

          if (prevV) {
            const diff = newVStock - prevV.stock;
            if (diff > 0) {
              logsToInsert.push({
                productId: product._id,
                productName: product.productName,
                skuCode: v.skuCode || product.skuCode || '',
                barcode: v.barcode || product.barcode || '',
                variantId: vId,
                subVariantId: null,
                variantName: v.name || '',
                subVariantName: '',
                addQuantity: diff,
                previousStock: prevV.stock,
                newStock: newVStock,
                restockedBy: req.user.id,
                restockedByName: req.user.name || '',
                restockedByEmail: req.user.email || '',
                restockedByRole: req.user.role || '',
                restockedAt: new Date(),
                source: 'edit',
              });
            }
          }

          (v.subVariants || []).forEach((sv) => {
            const svId = sv.id || (sv._id ? sv._id.toString() : null);
            if (!svId) return;

            const newSvStock = Number(sv.stockQuantity) || 0;
            const prevSv = previousStockSnapshots.get(`s:${vId}:${svId}`);

            if (prevSv) {
              const diff = newSvStock - prevSv.stock;
              if (diff > 0) {
                logsToInsert.push({
                  productId: product._id,
                  productName: product.productName,
                  skuCode: sv.skuCode || v.skuCode || product.skuCode || '',
                  barcode: sv.barcode || v.barcode || product.barcode || '',
                  variantId: vId,
                  subVariantId: svId,
                  variantName: v.name || '',
                  subVariantName: sv.name || '',
                  addQuantity: diff,
                  previousStock: prevSv.stock,
                  newStock: newSvStock,
                  restockedBy: req.user.id,
                  restockedByName: req.user.name || '',
                  restockedByEmail: req.user.email || '',
                  restockedByRole: req.user.role || '',
                  restockedAt: new Date(),
                  source: 'edit',
                });
              }
            }
          });
        });
      });

      if (logsToInsert.length > 0) {
        try {
          await RestockLog.insertMany(logsToInsert, { ordered: false });
        } catch (insertErr) {
          // insertMany with ordered:false continues on duplicate key errors
          if (insertErr.writeErrors) {
            insertErr.writeErrors.forEach((we) => {
              if (we.err?.code === 11000) {
                console.warn('Duplicate edit log skipped');
              } else {
                console.error('Edit log insert error:', we.err);
              }
            });
          } else {
            console.error('Restock log (edit, insertMany) error:', insertErr);
          }
        }
      }
    } catch (logErr) {
      console.error('Restock log (edit) outer error:', logErr);
    }

    if (shouldUpdateBarcode && newBarcode) {
      await assignBarcodeToProduct(newBarcode, product, req.user.id);
    }

    const embeddedUpdateData = {
      productName: product.productName,
      slug: product.slug,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      brand: product.brand || '',
      images: processedImages,
      regularPrice: product.regularPrice,
      discountPrice: product.discountPrice,
      costPerItem: product.costPerItem,
      buyingPrice: product.buyingPrice || 0,
      packagingCost: product.packagingCost || 0,
      deliveryCost: product.deliveryCost || 0,
      stockQuantity: product.stockQuantity,
      stockAlertQuantity: product.stockAlertQuantity,
      skuCode: product.skuCode,
      unit: product.unit,
      colors: product.colors,
      deliveryInfo: product.deliveryInfo,
      tags: product.tags,
      isFeatured: product.isFeatured,
      showOnBanner: product.showOnBanner,
      comingSoon: product.comingSoon || false,
      isActive: product.isActive,
      rating: product.rating,
      additionalInfo: processedAdditionalInfo,
      faqs: processedFaqs,
      subcategoryId: product.subcategory,
      subcategoryName: product.subcategoryName,
      childSubcategoryId: product.childSubcategory,
      childSubcategoryName: product.childSubcategoryName,
      updatedBy: req.user.id,
      lastUpdatedAt: new Date(),
      updatedAt: new Date()
    };

    if (category && category !== oldCategory) {
      await Category.findByIdAndUpdate(oldCategory, {
        $pull: { products: { productId: product._id } },
        $inc: { productCount: -1 }
      });

      if (oldSubcategoryId) {
        await Category.findOneAndUpdate(
          { _id: oldCategory, 'subcategories._id': oldSubcategoryId },
          { $inc: { 'subcategories.$.productCount': -1 } }
        );
      }

      if (oldChildSubcategoryId && oldSubcategoryId) {
        await Category.findOneAndUpdate(
          {
            _id: oldCategory,
            'subcategories._id': oldSubcategoryId,
            'subcategories.children._id': oldChildSubcategoryId
          },
          { $inc: { 'subcategories.$[sub].children.$[child].productCount': -1 } },
          {
            arrayFilters: [
              { 'sub._id': oldSubcategoryId },
              { 'child._id': oldChildSubcategoryId }
            ]
          }
        );
      }

      const newEmbeddedProduct = {
        productId: product._id,
        ...embeddedUpdateData,
        createdBy: req.user.id,
        createdAt: product.createdAt
      };

      await Category.findByIdAndUpdate(newCategory, {
        $push: { products: newEmbeddedProduct },
        $inc: { productCount: 1 }
      });

      if (newSubcategoryId) {
        await Category.findOneAndUpdate(
          { _id: newCategory, 'subcategories._id': newSubcategoryId },
          { $inc: { 'subcategories.$.productCount': 1 } }
        );
      }

      if (newChildSubcategoryId && newSubcategoryId) {
        await Category.findOneAndUpdate(
          {
            _id: newCategory,
            'subcategories._id': newSubcategoryId,
            'subcategories.children._id': newChildSubcategoryId
          },
          { $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 } },
          {
            arrayFilters: [
              { 'sub._id': newSubcategoryId },
              { 'child._id': newChildSubcategoryId }
            ]
          }
        );
      }
    } else {
      await updateEmbeddedProductInCategory(oldCategory, product._id, embeddedUpdateData);

      if (oldSubcategoryId !== newSubcategoryId) {
        if (oldSubcategoryId) {
          await Category.findOneAndUpdate(
            { _id: oldCategory, 'subcategories._id': oldSubcategoryId },
            { $inc: { 'subcategories.$.productCount': -1 } }
          );
        }
        if (newSubcategoryId) {
          await Category.findOneAndUpdate(
            { _id: oldCategory, 'subcategories._id': newSubcategoryId },
            { $inc: { 'subcategories.$.productCount': 1 } }
          );
        }
      }

      if (oldChildSubcategoryId !== newChildSubcategoryId) {
        if (oldChildSubcategoryId && oldSubcategoryId) {
          await Category.findOneAndUpdate(
            {
              _id: oldCategory,
              'subcategories._id': oldSubcategoryId,
              'subcategories.children._id': oldChildSubcategoryId
            },
            { $inc: { 'subcategories.$[sub].children.$[child].productCount': -1 } },
            {
              arrayFilters: [
                { 'sub._id': oldSubcategoryId },
                { 'child._id': oldChildSubcategoryId }
              ]
            }
          );
        }
        if (newChildSubcategoryId && newSubcategoryId) {
          await Category.findOneAndUpdate(
            {
              _id: newCategory,
              'subcategories._id': newSubcategoryId,
              'subcategories.children._id': newChildSubcategoryId
            },
            { $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 } },
            {
              arrayFilters: [
                { 'sub._id': newSubcategoryId },
                { 'child._id': newChildSubcategoryId }
              ]
            }
          );
        }
      }
    }

    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'tags', select: 'name image' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'updatedBy', select: 'name email role' },
      { path: 'addOnes.productId', select: 'productName slug regularPrice discountPrice images brand skuCode stockQuantity' }
    ]);

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating product'
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can delete products.'
      });
    }

    const categoryId = product.category;
    const subcategoryId = product.subcategory;
    const childSubcategoryId = product.childSubcategory;

    // Remove from category's products array
    await Category.findByIdAndUpdate(
      categoryId,
      {
        $pull: { products: { productId: product._id } },
        $inc: { productCount: -1 }
      }
    );

    if (subcategoryId) {
      await Category.findOneAndUpdate(
        {
          _id: categoryId,
          'subcategories._id': subcategoryId
        },
        { $inc: { 'subcategories.$.productCount': -1 } }
      );
    }

    if (childSubcategoryId && subcategoryId) {
      await Category.findOneAndUpdate(
        {
          _id: categoryId,
          'subcategories._id': subcategoryId,
          'subcategories.children._id': childSubcategoryId
        },
        { $inc: { 'subcategories.$[sub].children.$[child].productCount': -1 } },
        {
          arrayFilters: [
            { 'sub._id': subcategoryId },
            { 'child._id': childSubcategoryId }
          ]
        }
      );
    }

    // Release barcode
    if (product.barcode) {
      await releaseBarcodeFromProduct(product.barcode);
    }

    // Delete the product
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting product'
    });
  }
};

// ============================================================
// ADD PRODUCT REVIEW
// ============================================================
const addProductReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.some(
      review => review.userId && review.userId.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'Product already reviewed' });
    }

    const review = {
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: true,
      createdAt: new Date()
    };

    product.reviews.push(review);

    const totalReviews = product.reviews.length;
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    product.rating = Math.round(avgRating * 10) / 10;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    product.reviews.forEach(r => {
      distribution[r.rating]++;
    });
    product.reviewStats = {
      averageRating: product.rating,
      totalReviews,
      ratingDistribution: distribution
    };

    await product.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully'
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while adding review'
    });
  }
};

// ============================================================
// GET FEATURED PRODUCTS
// ============================================================
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      isActive: true
    })
      .limit(parseInt(limit))
      .select('productName slug regularPrice discountPrice images rating unit tags hasVariants variantTypes addOnes comingSoon');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================
// GET BANNER PRODUCTS
// ============================================================
const getBannerProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const products = await Product.find({
      showOnBanner: true,
      isActive: true
    })
      .limit(parseInt(limit))
      .select('productName slug regularPrice discountPrice images rating unit tags hasVariants variantTypes addOnes comingSoon');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get banner products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================
// GET FLASH SALE PRODUCTS
// ============================================================
const getFlashSaleProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      tags: 'Flash Sale',
      isActive: true,
      discountPrice: { $gt: 0 }
    })
      .populate('category', 'name slug')
      .limit(parseInt(limit))
      .select('productName slug regularPrice discountPrice images rating stockQuantity category unit tags hasVariants variantTypes addOnes comingSoon');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get flash sale products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================
// GET TRENDING PRODUCTS
// ============================================================
const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isActive: true })
      .sort({ purchaseCount: -1, views: -1 })
      .limit(parseInt(limit))
      .select('productName slug regularPrice discountPrice images rating purchaseCount unit tags hasVariants variantTypes addOnes comingSoon');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================
// GET COMING SOON PRODUCTS (NEW)
// ============================================================
const getComingSoonProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const products = await Product.find({
      comingSoon: true,
      isActive: true
    })
      .populate('category', 'name slug')
      .populate('tags', 'name image')
      .limit(parseInt(limit))
      .select('productName slug regularPrice discountPrice images rating unit tags hasVariants variantTypes comingSoon category');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get coming soon products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================
// TOGGLE PRODUCT STATUS
// ============================================================
// const toggleProductStatus = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ success: false, error: 'Product not found' });
//     }

//     if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Permission denied. Only super admins, admins, and moderators can change product status.'
//       });
//     }

//     product.isActive = !product.isActive;
//     await product.save();

//     // Update embedded product in category
//     await Category.findOneAndUpdate(
//       {
//         _id: product.category,
//         'products.productId': product._id
//       },
//       {
//         $set: {
//           'products.$.isActive': product.isActive,
//           'products.$.updatedAt': new Date()
//         }
//       }
//     );

//     if (product.subcategory) {
//       await Category.findOneAndUpdate(
//         {
//           _id: product.category,
//           'subcategories._id': product.subcategory,
//           'subcategories.products.productId': product._id
//         },
//         {
//           $set: {
//             'subcategories.$[sub].products.$[prod].isActive': product.isActive,
//             'subcategories.$[sub].products.$[prod].updatedAt': new Date()
//           }
//         },
//         {
//           arrayFilters: [
//             { 'sub._id': product.subcategory },
//             { 'prod.productId': product._id }
//           ]
//         }
//       );
//     }

//     res.json({
//       success: true,
//       data: product,
//       message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
//     });

//   } catch (error) {
//     console.error('Toggle product status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling product status'
//     });
//   }
// };

const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can change product status.'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    // Update the embedded product in the top-level category.products array
    await Category.findOneAndUpdate(
      {
        _id: product.category,
        'products.productId': product._id
      },
      {
        $set: {
          'products.$.isActive': product.isActive,
          'products.$.updatedAt': new Date()
        }
      }
    );

    res.json({
      success: true,
      data: product,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling product status'
    });
  }
};

// ============================================================
// GET UNIQUE UNITS
// ============================================================
const getUniqueUnits = async (req, res) => {
  try {
    const units = await Product.distinct('unit', { isActive: true });

    const filteredUnits = units
      .filter(unit => unit && unit.trim() !== '')
      .sort();

    const unitLabels = {
      'pcs': 'Pieces (pcs)',
      'ton': 'Ton (ton)'
    };

    const formattedUnits = filteredUnits.map(unit => ({
      value: unit,
      label: unitLabels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1)
    }));

    res.json({
      success: true,
      data: formattedUnits
    });

  } catch (error) {
    console.error('Get unique units error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching units'
    });
  }
};

// ============================================================
// GET COLORS BY IDS
// ============================================================
const getColorsByIds = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.json({ success: true, data: {} });
    }

    const products = await Product.find(
      { _id: { $in: productIds }, isActive: true },
      { colors: 1 }
    ).lean();

    const colorMap = {};
    products.forEach(p => {
      colorMap[p._id.toString()] = p.colors || [];
    });

    res.json({ success: true, data: colorMap });

  } catch (error) {
    console.error('Get colors by IDs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// DUPLICATE PRODUCT
// ============================================================
const duplicateProduct = async (req, res) => {
  try {
    const sourceProduct = await Product.findById(req.params.id);

    if (!sourceProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can duplicate products.'
      });
    }

    // ============================================
    // 1. GENERATE NEW PRODUCT NAME (Unique)
    // ============================================
    let newProductName = `${sourceProduct.productName} (Copy)`;
    let counter = 1;
    
    // Keep incrementing until unique
    while (await Product.findOne({
      productName: { $regex: new RegExp(`^${newProductName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    })) {
      counter++;
      newProductName = `${sourceProduct.productName} (Copy ${counter})`;
    }

    // ============================================
    // 2. GENERATE NEW SKU CODE
    // ============================================
    let newSkuCode;
    try {
      const lastProduct = await Product.findOne({
        skuCode: { $regex: /^NC-/ }
      }).sort({ createdAt: -1 });

      let nextSequence = 1001;
      if (lastProduct && lastProduct.skuCode) {
        const parts = lastProduct.skuCode.split('-');
        if (parts.length === 3) {
          const lastSeq = parseInt(parts[2]);
          if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
        }
      }

      const timestamp = Date.now().toString().slice(0, 5);
      newSkuCode = `NC-${timestamp}-${nextSequence}`;

      // Ensure uniqueness
      const existing = await Product.findOne({ skuCode: newSkuCode });
      if (existing) {
        newSkuCode = `NC-${timestamp}-${nextSequence}-${Math.floor(Math.random() * 100)}`;
      }
    } catch (skuError) {
      console.error('Error generating SKU:', skuError);
      newSkuCode = `NC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // ============================================
    // 3. GENERATE NEW SLUG
    // ============================================
    let baseSlug = newProductName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    let newSlug = baseSlug;
    let slugCounter = 1;
    while (await Product.findOne({ slug: newSlug })) {
      slugCounter++;
      newSlug = `${baseSlug}-${slugCounter}`;
    }

    // ============================================
    // 4. BUILD NEW PRODUCT DATA
    // ============================================
    const newProductData = {
      // Basic info
      productName: newProductName,
      slug: newSlug,
      skuCode: newSkuCode,
      shortDescription: sourceProduct.shortDescription || '',
      fullDescription: sourceProduct.fullDescription || '',

      // Categories
      category: sourceProduct.category,
      categoryName: sourceProduct.categoryName || '',
      subcategory: sourceProduct.subcategory || null,
      subcategoryName: sourceProduct.subcategoryName || '',
      childSubcategory: sourceProduct.childSubcategory || null,
      childSubcategoryName: sourceProduct.childSubcategoryName || '',

      // Brand
      brand: sourceProduct.brand || '',

      // Pricing
      regularPrice: sourceProduct.regularPrice,
      discountPrice: sourceProduct.discountPrice || 0,
      buyingPrice: sourceProduct.buyingPrice || 0,
      packagingCost: sourceProduct.packagingCost || 0,
      deliveryCost: sourceProduct.deliveryCost || 0,
      costPerItem: sourceProduct.costPerItem || 0,

      // Inventory
      stockQuantity: sourceProduct.stockQuantity || 0,
      stockAlertQuantity: sourceProduct.stockAlertQuantity || 0,

      // ✅ BARCODE - EMPTY (as per request)
      barcode: undefined,

      // Unit
      unit: sourceProduct.unit || 'pcs',
      customUnit: sourceProduct.customUnit || '',

      // Colors
      colors: sourceProduct.colors || [],

      // Delivery
      deliveryInfo: sourceProduct.deliveryInfo || '',

      // Media
      images: sourceProduct.images || [],

      // Video
      videoUrl: sourceProduct.videoUrl || '',
      videoPublicId: sourceProduct.videoPublicId || '',
      videoType: sourceProduct.videoType || 'upload',

      // Tags
      tags: sourceProduct.tags || [],

      // ✅ VARIANTS - Copy as-is (with fresh IDs to avoid conflicts)
      hasVariants: sourceProduct.hasVariants || false,
      variantTypes: (sourceProduct.variantTypes || []).map(vt => ({
        id: vt.id || `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: vt.type,
        variants: (vt.variants || []).map(v => ({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: v.name || '',
          color: v.color || '',
          regularPrice: v.regularPrice || 0,
          discountPrice: v.discountPrice || 0,
          buyingPrice: v.buyingPrice || 0,
          packagingCost: v.packagingCost || 0,
          deliveryCost: v.deliveryCost || 0,
          costPerItem: v.costPerItem || 0,
          stockQuantity: v.stockQuantity || 0,
          images: v.images || [null, null, null, null],
          imagePreviews: v.imagePreviews || [null, null, null, null],
          subVariants: (v.subVariants || []).map(sv => ({
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: sv.name || '',
            color: sv.color || '',
            regularPrice: sv.regularPrice || 0,
            discountPrice: sv.discountPrice || 0,
            buyingPrice: sv.buyingPrice || 0,
            packagingCost: sv.packagingCost || 0,
            deliveryCost: sv.deliveryCost || 0,
            costPerItem: sv.costPerItem || 0,
            stockQuantity: sv.stockQuantity || 0,
            images: sv.images || [null, null, null, null],
            imagePreviews: sv.imagePreviews || [null, null, null, null]
          }))
        }))
      })),

      // ✅ ADD-ONES - Copy as-is
      addOnes: sourceProduct.addOnes || [],

      // Status flags
      isFeatured: sourceProduct.isFeatured || false,
      showOnBanner: sourceProduct.showOnBanner || false,
      comingSoon: sourceProduct.comingSoon || false,
      isActive: false, // ✅ New duplicate starts INACTIVE (safe default)

      // Rating
      rating: 0, // ✅ Reset rating for new product

      // Additional info
      additionalInfo: sourceProduct.additionalInfo || [],

      // ✅ FAQS - EMPTY (as per request)
      faqs: [],

      // Meta settings
      metaSettings: sourceProduct.metaSettings || {},

      // Reviews - empty
      reviews: [],
      reviewStats: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },

      // Tracking
      createdBy: req.user.id,
      updatedBy: null,
      lastUpdatedAt: null,

      // Meta
      views: 0,
      purchaseCount: 0
    };

    // ============================================
    // 5. CREATE THE NEW PRODUCT
    // ============================================
    const newProduct = await Product.create(newProductData);

    // ============================================
    // 6. ADD TO CATEGORY (embedded products)
    // ============================================
    const embeddedProductData = {
      productId: newProduct._id,
      productName: newProduct.productName,
      slug: newProduct.slug,
      shortDescription: newProduct.shortDescription,
      fullDescription: newProduct.fullDescription,
      brand: newProduct.brand || '',
      images: newProduct.images,
      regularPrice: newProduct.regularPrice,
      discountPrice: newProduct.discountPrice,
      costPerItem: newProduct.costPerItem,
      buyingPrice: newProduct.buyingPrice,
      packagingCost: newProduct.packagingCost,
      deliveryCost: newProduct.deliveryCost,
      stockQuantity: newProduct.stockQuantity,
      stockAlertQuantity: newProduct.stockAlertQuantity,
      skuCode: newProduct.skuCode,
      unit: newProduct.unit,
      colors: newProduct.colors,
      deliveryInfo: newProduct.deliveryInfo,
      tags: newProduct.tags,
      isFeatured: newProduct.isFeatured,
      showOnBanner: newProduct.showOnBanner,
      comingSoon: newProduct.comingSoon,
      isActive: newProduct.isActive,
      rating: newProduct.rating,
      additionalInfo: newProduct.additionalInfo,
      faqs: newProduct.faqs,
      subcategoryId: newProduct.subcategory || null,
      subcategoryName: newProduct.subcategoryName,
      childSubcategoryId: newProduct.childSubcategory || null,
      childSubcategoryName: newProduct.childSubcategoryName,
      createdBy: req.user.id,
      updatedBy: null,
      lastUpdatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await Category.findByIdAndUpdate(
      newProduct.category,
      {
        $push: { products: embeddedProductData },
        $inc: { productCount: 1 }
      }
    );

    // Increment subcategory count
    if (newProduct.subcategory && newProduct.subcategoryName) {
      await Category.findOneAndUpdate(
        { _id: newProduct.category, 'subcategories._id': newProduct.subcategory },
        { $inc: { 'subcategories.$.productCount': 1 } }
      );
    }

    // Increment child subcategory count
    if (newProduct.childSubcategory && newProduct.childSubcategoryName && newProduct.subcategory) {
      await Category.findOneAndUpdate(
        {
          _id: newProduct.category,
          'subcategories._id': newProduct.subcategory,
          'subcategories.children._id': newProduct.childSubcategory
        },
        { $inc: { 'subcategories.$[sub].children.$[child].productCount': 1 } },
        {
          arrayFilters: [
            { 'sub._id': newProduct.subcategory },
            { 'child._id': newProduct.childSubcategory }
          ]
        }
      );
    }

    // Populate references for response
    await newProduct.populate([
      { path: 'category', select: 'name slug' },
      { path: 'tags', select: 'name image' }
    ]);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: `Product duplicated successfully. New SKU: ${newSkuCode}`,
      info: {
        newSkuCode,
        newProductName,
        newSlug,
        barcodeCleared: true,
        faqsCleared: true
      }
    });

  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while duplicating product'
    });
  }
};





// const restockBulk = async (req, res) => {
//   try {
//     const { items } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, error: 'No items provided' });
//     }

//     if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Permission denied. Only admins and moderators can restock.',
//       });
//     }

//     let updatedCount = 0;
//     const errors = [];
//     const results = [];

//     for (const item of items) {
//       const { productId, variantId, subVariantId, addQuantity } = item;
//       const add = Math.max(0, parseInt(addQuantity, 10) || 0);
//       if (!productId || add <= 0) continue;

//       try {
//         const product = await Product.findById(productId);
//         if (!product) {
//           errors.push({ productId, error: 'Product not found' });
//           continue;
//         }

//         // ---------- Resolve names for log (before mutation) ----------
//         let logVariantName = '';
//         let logSubVariantName = '';
//         let logSkuCode = product.skuCode || '';
//         let logBarcode = product.barcode || '';

//         if (variantId) {
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 logVariantName = v.name || '';

//                 // Prefer variant-level sku/barcode when present
//                 if (v.skuCode) logSkuCode = v.skuCode;
//                 if (v.barcode) logBarcode = v.barcode;

//                 if (subVariantId) {
//                   for (const sv of v.subVariants || []) {
//                     const svId = sv.id || (sv._id ? sv._id.toString() : null);
//                     if (svId === subVariantId) {
//                       logSubVariantName = sv.name || '';
//                       if (sv.skuCode) logSkuCode = sv.skuCode;
//                       if (sv.barcode) logBarcode = sv.barcode;
//                       break;
//                     }
//                   }
//                 }
//                 break;
//               }
//             }
//             if (logVariantName) break;
//           }
//         }

//         // ---------- Capture previous stock for the log ----------
//         let previousStock = 0;
//         let newStock = 0;

//         // ----------- BASE PRODUCT -----------
//         if (!variantId && !subVariantId) {
//           previousStock = Number(product.stockQuantity) || 0;
//           product.stockQuantity = previousStock + add;
//           newStock = product.stockQuantity;
//         }
//         // ----------- VARIANT -----------
//         else if (variantId && !subVariantId) {
//           let found = false;
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 previousStock = Number(v.stockQuantity) || 0;
//                 v.stockQuantity = previousStock + add;
//                 newStock = v.stockQuantity;
//                 found = true;
//                 break;
//               }
//             }
//             if (found) break;
//           }
//           if (!found) {
//             errors.push({ productId, variantId, error: 'Variant not found' });
//             continue;
//           }
//           // ✅ Parent product stock also increases
//           product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
//         }
//         // ----------- SUB-VARIANT -----------
//         else {
//           let found = false;
//           let parentVariant = null;
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 for (const sv of v.subVariants || []) {
//                   const svId = sv.id || (sv._id ? sv._id.toString() : null);
//                   if (svId === subVariantId) {
//                     previousStock = Number(sv.stockQuantity) || 0;
//                     sv.stockQuantity = previousStock + add;
//                     newStock = sv.stockQuantity;
//                     parentVariant = v;
//                     found = true;
//                     break;
//                   }
//                 }
//               }
//               if (found) break;
//             }
//             if (found) break;
//           }
//           if (!found) {
//             errors.push({ productId, subVariantId, error: 'Sub-variant not found' });
//             continue;
//           }
//           // ✅ Parent variant stock also increases
//           if (parentVariant) {
//             parentVariant.stockQuantity =
//               (Number(parentVariant.stockQuantity) || 0) + add;
//           }
//           // ✅ Parent product stock also increases
//           product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
//         }

//         product.updatedBy = req.user.id;
//         product.lastUpdatedAt = new Date();
//         await product.save();

//         updatedCount++;
//         results.push({ productId, variantId, subVariantId, newStock });

//         // ============================================
//         // LOG THE RESTOCK
//         // ============================================
//         try {
//           await RestockLog.create({
//             productId: product._id,
//             productName: product.productName,
//             skuCode: logSkuCode,
//             barcode: logBarcode,
//             variantId: variantId || null,
//             subVariantId: subVariantId || null,
//             variantName: logVariantName,
//             subVariantName: logSubVariantName,
//             addQuantity: add,
//             previousStock,
//             newStock,
//             restockedBy: req.user.id,
//             restockedByName: req.user.name || '',
//             restockedByEmail: req.user.email || '',
//             restockedByRole: req.user.role || '',
//             restockedAt: new Date(),
//             source: (variantId || subVariantId) ? 'bulk' : 'scan'
//           });
//         } catch (logErr) {
//           // Don't fail the restock if logging fails
//           console.error('Restock log error:', logErr);
//         }

//         // Sync embedded category product (base stock)
//         try {
//           await Category.findOneAndUpdate(
//             { _id: product.category, 'products.productId': product._id },
//             { $set: { 'products.$.stockQuantity': product.stockQuantity } }
//           );
//         } catch (syncErr) {
//           console.error('Category sync error:', syncErr);
//         }
//       } catch (itemErr) {
//         console.error('Restock item error:', itemErr);
//         errors.push({ productId, error: itemErr.message });
//       }
//     }

//     res.json({
//       success: true,
//       data: { updatedCount, errors, results },
//       message: `Restocked ${updatedCount} item(s)`,
//     });
//   } catch (error) {
//     console.error('Bulk restock error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while restocking',
//     });
//   }
// };



//working
// const restockBulk = async (req, res) => {
//   try {
//     const { items, requestId } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, error: 'No items provided' });
//     }

//     if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Permission denied. Only admins and moderators can restock.',
//       });
//     }

//     let updatedCount = 0;
//     const errors = [];
//     const results = [];

//     for (const [index, item] of items.entries()) {
//       const { productId, variantId, subVariantId, addQuantity } = item;
//       const add = Math.max(0, parseInt(addQuantity, 10) || 0);
//       if (!productId || add <= 0) continue;

//       // ✅ per-item idempotency key (one per request+index)
//       const idempotencyKey = requestId ? `${requestId}-${index}` : null;

//       // ✅ pre-check — skip already-processed items entirely
//       if (idempotencyKey) {
//         const alreadyProcessed = await RestockLog.findOne({ idempotencyKey });
//         if (alreadyProcessed) {
//           console.warn('Skipping already-processed item:', idempotencyKey);
//           continue;
//         }
//       }

//       try {
//         const product = await Product.findById(productId);
//         if (!product) {
//           errors.push({ productId, error: 'Product not found' });
//           continue;
//         }

//         // ---------- Resolve names for log (before mutation) ----------
//         let logVariantName = '';
//         let logSubVariantName = '';
//         let logSkuCode = product.skuCode || '';
//         let logBarcode = product.barcode || '';

//         if (variantId) {
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 logVariantName = v.name || '';

//                 // Prefer variant-level sku/barcode when present
//                 if (v.skuCode) logSkuCode = v.skuCode;
//                 if (v.barcode) logBarcode = v.barcode;

//                 if (subVariantId) {
//                   for (const sv of v.subVariants || []) {
//                     const svId = sv.id || (sv._id ? sv._id.toString() : null);
//                     if (svId === subVariantId) {
//                       logSubVariantName = sv.name || '';
//                       if (sv.skuCode) logSkuCode = sv.skuCode;
//                       if (sv.barcode) logBarcode = sv.barcode;
//                       break;
//                     }
//                   }
//                 }
//                 break;
//               }
//             }
//             if (logVariantName) break;
//           }
//         }

//         // ---------- Capture previous stock for the log ----------
//         let previousStock = 0;
//         let newStock = 0;

//         // ----------- BASE PRODUCT -----------
//         if (!variantId && !subVariantId) {
//           previousStock = Number(product.stockQuantity) || 0;
//           product.stockQuantity = previousStock + add;
//           newStock = product.stockQuantity;
//         }
//         // ----------- VARIANT -----------
//         else if (variantId && !subVariantId) {
//           let found = false;
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 previousStock = Number(v.stockQuantity) || 0;
//                 v.stockQuantity = previousStock + add;
//                 newStock = v.stockQuantity;
//                 found = true;
//                 break;
//               }
//             }
//             if (found) break;
//           }
//           if (!found) {
//             errors.push({ productId, variantId, error: 'Variant not found' });
//             continue;
//           }
//           // ✅ Parent product stock also increases
//           product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
//         }
//         // ----------- SUB-VARIANT -----------
//         else {
//           let found = false;
//           let parentVariant = null;
//           for (const vt of product.variantTypes || []) {
//             for (const v of vt.variants || []) {
//               const vId = v.id || (v._id ? v._id.toString() : null);
//               if (vId === variantId) {
//                 for (const sv of v.subVariants || []) {
//                   const svId = sv.id || (sv._id ? sv._id.toString() : null);
//                   if (svId === subVariantId) {
//                     previousStock = Number(sv.stockQuantity) || 0;
//                     sv.stockQuantity = previousStock + add;
//                     newStock = sv.stockQuantity;
//                     parentVariant = v;
//                     found = true;
//                     break;
//                   }
//                 }
//               }
//               if (found) break;
//             }
//             if (found) break;
//           }
//           if (!found) {
//             errors.push({ productId, subVariantId, error: 'Sub-variant not found' });
//             continue;
//           }
//           // ✅ Parent variant stock also increases
//           if (parentVariant) {
//             parentVariant.stockQuantity =
//               (Number(parentVariant.stockQuantity) || 0) + add;
//           }
//           // ✅ Parent product stock also increases
//           product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
//         }

//         if (product.hasVariants) {
//           product.stockQuantity = (product.variantTypes || []).reduce(
//             (total, variantType) => total + (variantType.variants || []).reduce(
//               (variantTotal, variant) => variantTotal + (Number(variant.stockQuantity) || 0),
//               0
//             ),
//             0
//           );
//         }

//         product.updatedBy = req.user.id;
//         product.lastUpdatedAt = new Date();
//         await product.save();

//         updatedCount++;
//         results.push({ productId, variantId, subVariantId, newStock });

//         // ============================================
//         // LOG THE RESTOCK
//         // ============================================
//         try {
//           await RestockLog.create({
//             productId: product._id,
//             productName: product.productName,
//             skuCode: logSkuCode,
//             barcode: logBarcode,
//             variantId: variantId || null,
//             subVariantId: subVariantId || null,
//             variantName: logVariantName,
//             subVariantName: logSubVariantName,
//             addQuantity: add,
//             previousStock,
//             newStock,
//             restockedBy: req.user.id,
//             restockedByName: req.user.name || '',
//             restockedByEmail: req.user.email || '',
//             restockedByRole: req.user.role || '',
//             restockedAt: new Date(),
//             source: variantId || subVariantId ? 'bulk' : 'scan',
//             idempotencyKey, // ✅
//           });
//         } catch (logErr) {
//           if (logErr.code === 11000) {
//             // ✅ duplicate submission — the actual stock increment already happened
//             //    for this exact request, so just swallow the error.
//             console.warn('Duplicate restock request ignored:', idempotencyKey);
//           } else {
//             console.error('Restock log error:', logErr);
//           }
//         }

//         // Sync embedded category product (base stock)
//         try {
//           await Category.findOneAndUpdate(
//             { _id: product.category, 'products.productId': product._id },
//             { $set: { 'products.$.stockQuantity': product.stockQuantity } }
//           );
//         } catch (syncErr) {
//           console.error('Category sync error:', syncErr);
//         }
//       } catch (itemErr) {
//         console.error('Restock item error:', itemErr);
//         errors.push({ productId, error: itemErr.message });
//       }
//     }

//     res.json({
//       success: true,
//       data: { updatedCount, errors, results },
//       message: `Restocked ${updatedCount} item(s)`,
//     });
//   } catch (error) {
//     console.error('Bulk restock error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while restocking',
//     });
//   }
// };

const restockBulk = async (req, res) => {
  try {
    const { items, requestId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items provided' });
    }

    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only admins and moderators can restock.',
      });
    }

    let updatedCount = 0;
    const errors = [];
    const results = [];

    for (const [index, item] of items.entries()) {
      const { productId, variantId, subVariantId, addQuantity } = item;
      const add = Math.max(0, parseInt(addQuantity, 10) || 0);
      if (!productId || add <= 0) continue;

      // ✅ per-item idempotency key (one per request+index)
      const idempotencyKey = requestId ? `${requestId}-${index}` : null;

      // ✅ pre-check — skip already-processed items entirely
      if (idempotencyKey) {
        const alreadyProcessed = await RestockLog.findOne({ idempotencyKey });
        if (alreadyProcessed) {
          console.warn('Skipping already-processed item:', idempotencyKey);
          continue;
        }
      }

      try {
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        // ✅ Capture base stock BEFORE any mutation (for the log)
        const baseStockBefore = Number(product.stockQuantity) || 0;

        // ---------- Resolve names for log (before mutation) ----------
        let logVariantName = '';
        let logSubVariantName = '';
        let logSkuCode = product.skuCode || '';
        let logBarcode = product.barcode || '';

        if (variantId) {
          for (const vt of product.variantTypes || []) {
            for (const v of vt.variants || []) {
              const vId = v.id || (v._id ? v._id.toString() : null);
              if (vId === variantId) {
                logVariantName = v.name || '';

                // Prefer variant-level sku/barcode when present
                if (v.skuCode) logSkuCode = v.skuCode;
                if (v.barcode) logBarcode = v.barcode;

                if (subVariantId) {
                  for (const sv of v.subVariants || []) {
                    const svId = sv.id || (sv._id ? sv._id.toString() : null);
                    if (svId === subVariantId) {
                      logSubVariantName = sv.name || '';
                      if (sv.skuCode) logSkuCode = sv.skuCode;
                      if (sv.barcode) logBarcode = sv.barcode;
                      break;
                    }
                  }
                }
                break;
              }
            }
            if (logVariantName) break;
          }
        }

        // ---------- Capture previous stock for the log ----------
        let previousStock = 0;
        let newStock = 0;

        // ----------- BASE PRODUCT -----------
        if (!variantId && !subVariantId) {
          previousStock = Number(product.stockQuantity) || 0;
          product.stockQuantity = previousStock + add;
          newStock = product.stockQuantity;
        }
        // ----------- VARIANT -----------
        else if (variantId && !subVariantId) {
          let found = false;
          for (const vt of product.variantTypes || []) {
            for (const v of vt.variants || []) {
              const vId = v.id || (v._id ? v._id.toString() : null);
              if (vId === variantId) {
                previousStock = Number(v.stockQuantity) || 0;
                v.stockQuantity = previousStock + add;
                newStock = v.stockQuantity;
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) {
            errors.push({ productId, variantId, error: 'Variant not found' });
            continue;
          }
          // ✅ Parent product stock also increases
          product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
        }
        // ----------- SUB-VARIANT -----------
        else {
          let found = false;
          let parentVariant = null;
          for (const vt of product.variantTypes || []) {
            for (const v of vt.variants || []) {
              const vId = v.id || (v._id ? v._id.toString() : null);
              if (vId === variantId) {
                for (const sv of v.subVariants || []) {
                  const svId = sv.id || (sv._id ? sv._id.toString() : null);
                  if (svId === subVariantId) {
                    previousStock = Number(sv.stockQuantity) || 0;
                    sv.stockQuantity = previousStock + add;
                    newStock = sv.stockQuantity;
                    parentVariant = v;
                    found = true;
                    break;
                  }
                }
              }
              if (found) break;
            }
            if (found) break;
          }
          if (!found) {
            errors.push({ productId, subVariantId, error: 'Sub-variant not found' });
            continue;
          }
          // ✅ Parent variant stock also increases
          if (parentVariant) {
            parentVariant.stockQuantity =
              (Number(parentVariant.stockQuantity) || 0) + add;
          }
          // ✅ Parent product stock also increases
          product.stockQuantity = (Number(product.stockQuantity) || 0) + add;
        }

        if (product.hasVariants) {
          product.stockQuantity = (product.variantTypes || []).reduce(
            (total, variantType) =>
              total +
              (variantType.variants || []).reduce(
                (variantTotal, variant) =>
                  variantTotal + (Number(variant.stockQuantity) || 0),
                0
              ),
            0
          );
        }

        product.updatedBy = req.user.id;
        product.lastUpdatedAt = new Date();
        await product.save();

        updatedCount++;
        results.push({ productId, variantId, subVariantId, newStock });

        // ============================================
        // LOG THE RESTOCK
        // ============================================
        try {
          await RestockLog.create({
            productId: product._id,
            productName: product.productName,
            skuCode: logSkuCode,
            barcode: logBarcode,
            variantId: variantId || null,
            subVariantId: subVariantId || null,
            variantName: logVariantName,
            subVariantName: logSubVariantName,
            addQuantity: add,
            previousStock,
            newStock,
            // ✅ Base product snapshot (already recomputed above)
            baseStockBefore,
            baseStockAfter: Number(product.stockQuantity) || 0,
            restockedBy: req.user.id,
            restockedByName: req.user.name || '',
            restockedByEmail: req.user.email || '',
            restockedByRole: req.user.role || '',
            restockedAt: new Date(),
            source: variantId || subVariantId ? 'bulk' : 'scan',
            idempotencyKey, // ✅
          });
        } catch (logErr) {
          if (logErr.code === 11000) {
            console.warn('Duplicate restock request ignored:', idempotencyKey);
          } else {
            console.error('Restock log error:', logErr);
          }
        }

        // Sync embedded category product (base stock)
        try {
          await Category.findOneAndUpdate(
            { _id: product.category, 'products.productId': product._id },
            { $set: { 'products.$.stockQuantity': product.stockQuantity } }
          );
        } catch (syncErr) {
          console.error('Category sync error:', syncErr);
        }
      } catch (itemErr) {
        console.error('Restock item error:', itemErr);
        errors.push({ productId, error: itemErr.message });
      }
    }

    res.json({
      success: true,
      data: { updatedCount, errors, results },
      message: `Restocked ${updatedCount} item(s)`,
    });
  } catch (error) {
    console.error('Bulk restock error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while restocking',
    });
  }
};

const getProductByBarcode = async (req, res) => {
  try {
    const { barcodeNumber } = req.params;
    const product = await Product.findOne({ barcode: barcodeNumber })
      // .select('productName slug images regularPrice discountPrice stockQuantity rating isActive');
        .select('productName slug skuCode barcode images regularPrice discountPrice stockQuantity rating isActive hasVariants variantTypes');
    if (!product) {
      return res.status(404).json({ success: false, error: 'No product found for this barcode' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// GET RESTOCK HISTORY FOR A PRODUCT
// ============================================================
const getProductRestockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const RestockLog = require('../models/RestockLog');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      RestockLog.find({ productId: id })
        .sort({ restockedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('restockedBy', 'name email role')
        .lean(),
      RestockLog.countDocuments({ productId: id })
    ]);

    // Aggregate summary
    const summary = await RestockLog.aggregate([
      { $match: { productId: new (require('mongoose').Types.ObjectId)(id) } },
      {
        $group: {
          _id: null,
          totalRestocked: { $sum: '$addQuantity' },
          totalEvents: { $sum: 1 },
          lastRestock: { $max: '$restockedAt' }
        }
      }
    ]);

    res.json({
      success: true,
      data: logs,
      summary: summary[0] || {
        totalRestocked: 0,
        totalEvents: 0,
        lastRestock: null
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get restock history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// ============================================================
// DELETE A SINGLE RESTOCK LOG (admin / super_admin only)
// ============================================================

// const getAllRestockLogs = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 20,
//       productId,
//       userId,
//       from,
//       to,
//       search,
//     } = req.query;

//     // ---------- Build match stage ----------
//     const match = {};
//     if (productId) match.productId = new mongoose.Types.ObjectId(productId);
//     if (userId) match.restockedBy = new mongoose.Types.ObjectId(userId);
//     if (from || to) {
//       match.restockedAt = {};
//       if (from) match.restockedAt.$gte = new Date(from);
//       if (to) {
//         const end = new Date(to);
//         end.setHours(23, 59, 59, 999);
//         match.restockedAt.$lte = end;
//       }
//     }
//     if (search && search.trim()) {
//       const re = new RegExp(
//         search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
//         'i'
//       );
//       match.$or = [
//         { productName: re },
//         { skuCode: re },
//         { barcode: re },
//         { restockedByEmail: re },
//         { restockedByName: re },
//       ];
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const limitNum = parseInt(limit);

//     // ---------- Pipeline ----------
//     const pipeline = [
//       { $match: match },
//       { $sort: { restockedAt: -1 } },
//       {
//         $group: {
//           _id: {
//             productId: '$productId',
//             variantId: '$variantId',
//             subVariantId: '$subVariantId',
//           },
//           // ✅ newest log's real Mongo _id → used for accurate delete
//           lastLogId: { $first: '$_id' },
//           productId: { $first: '$productId' },
//           productName: { $first: '$productName' },
//           skuCode: { $first: '$skuCode' },
//           barcode: { $first: '$barcode' },
//           variantId: { $first: '$variantId' },
//           subVariantId: { $first: '$subVariantId' },
//           variantName: { $first: '$variantName' },
//           subVariantName: { $first: '$subVariantName' },
//           addQuantity: { $first: '$addQuantity' },
//           previousStock: { $first: '$previousStock' },
//           newStock: { $first: '$newStock' },
//           restockedAt: { $first: '$restockedAt' },
//           restockedByName: { $first: '$restockedByName' },
//           restockedByEmail: { $first: '$restockedByEmail' },
//           source: { $first: '$source' },
//           totalRestocked: { $sum: '$addQuantity' },
//           totalEvents: { $sum: 1 },
//         },
//       },
//       { $sort: { restockedAt: -1 } },
//       {
//         // ✅ strip compound _id, stringify productId, keep lastLogId
//         $project: {
//           _id: 0,
//           lastLogId: 1,
//           productId: { $toString: '$_id.productId' },
//           variantId: '$_id.variantId',
//           subVariantId: '$_id.subVariantId',
//           productName: 1,
//           skuCode: 1,
//           barcode: 1,
//           variantName: 1,
//           subVariantName: 1,
//           addQuantity: 1,
//           previousStock: 1,
//           newStock: 1,
//           restockedAt: 1,
//           restockedByName: 1,
//           restockedByEmail: 1,
//           source: 1,
//           totalRestocked: 1,
//           totalEvents: 1,
//         },
//       },
//     ];

//     const countPipeline = [
//       { $match: match },
//       {
//         $group: {
//           _id: {
//             productId: '$productId',
//             variantId: '$variantId',
//             subVariantId: '$subVariantId',
//           },
//         },
//       },
//       { $count: 'total' },
//     ];

//     const [results, countResult] = await Promise.all([
//       RestockLog.aggregate([
//         ...pipeline,
//         { $skip: skip },
//         { $limit: limitNum },
//       ]),
//       RestockLog.aggregate(countPipeline),
//     ]);

//     const total = countResult[0]?.total || 0;

//     res.json({
//       success: true,
//       data: results,
//       pagination: {
//         total,
//         page: parseInt(page),
//         pages: Math.ceil(total / limitNum),
//         limit: limitNum,
//       },
//     });
//   } catch (error) {
//     console.error('Get all restock logs error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const getAllRestockLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      userId,
      from,
      to,
      search,
    } = req.query;

    // ---------- Build match stage ----------
    const match = {};
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);
    if (userId) match.restockedBy = new mongoose.Types.ObjectId(userId);
    if (from || to) {
      match.restockedAt = {};
      if (from) match.restockedAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        match.restockedAt.$lte = end;
      }
    }
    if (search && search.trim()) {
      const re = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      match.$or = [
        { productName: re },
        { skuCode: re },
        { barcode: re },
        { restockedByEmail: re },
        { restockedByName: re },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // ---------- Grouped rows: one per (product, variant, subVariant) ----------
    const pipeline = [
      { $match: match },
      { $sort: { restockedAt: -1 } },
      {
        $group: {
          _id: {
            productId: '$productId',
            variantId: '$variantId',
            subVariantId: '$subVariantId',
          },
          lastLogId: { $first: '$_id' },
          productId: { $first: '$productId' },
          productName: { $first: '$productName' },
          skuCode: { $first: '$skuCode' },
          barcode: { $first: '$barcode' },
          variantId: { $first: '$variantId' },
          subVariantId: { $first: '$subVariantId' },
          variantName: { $first: '$variantName' },
          subVariantName: { $first: '$subVariantName' },
          addQuantity: { $first: '$addQuantity' },
          previousStock: { $first: '$previousStock' },
          newStock: { $first: '$newStock' },
          baseStockBefore: { $first: '$baseStockBefore' },
          baseStockAfter: { $first: '$baseStockAfter' },
          restockedAt: { $first: '$restockedAt' },
          restockedByName: { $first: '$restockedByName' },
          restockedByEmail: { $first: '$restockedByEmail' },
          source: { $first: '$source' },
          totalRestocked: { $sum: '$addQuantity' },
          totalEvents: { $sum: 1 },
        },
      },
      { $sort: { restockedAt: -1 } },
      {
        $project: {
          _id: 0,
          lastLogId: 1,
          productId: { $toString: '$_id.productId' },
          variantId: '$_id.variantId',
          subVariantId: '$_id.subVariantId',
          productName: 1,
          skuCode: 1,
          barcode: 1,
          variantName: 1,
          subVariantName: 1,
          addQuantity: 1,
          previousStock: 1,
          newStock: 1,
          baseStockBefore: 1,
          baseStockAfter: 1,
          restockedAt: 1,
          restockedByName: 1,
          restockedByEmail: 1,
          source: 1,
          totalRestocked: 1,
          totalEvents: 1,
        },
      },
    ];

    // ---------- Count pipeline ----------
    const countPipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            productId: '$productId',
            variantId: '$variantId',
            subVariantId: '$subVariantId',
          },
        },
      },
      { $count: 'total' },
    ];

    const [results, countResult] = await Promise.all([
      RestockLog.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limitNum },
      ]),
      RestockLog.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get all restock logs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// const deleteRestockLog = async (req, res) => {
//   try {
//     if (!['super_admin', 'admin'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Permission denied. Only admins and super admins can delete restock history.',
//       });
//     }

//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, error: 'Invalid log ID' });
//     }

//     const log = await RestockLog.findById(id);
//     if (!log) {
//       return res.status(404).json({ success: false, error: 'Restock log not found' });
//     }

//     await log.deleteOne();

//     res.json({
//       success: true,
//       message: 'Restock log deleted successfully',
//       deletedId: id,
//     });
//   } catch (error) {
//     console.error('Delete restock log error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const deleteRestockLog = async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error:
          'Permission denied. Only admins and super admins can delete restock history.',
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid log ID' });
    }

    const log = await RestockLog.findById(id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: 'Restock log not found' });
    }

    await log.deleteOne();

    res.json({
      success: true,
      message: 'Restock log deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete restock log error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// GET STOCK ALERT PRODUCTS (base-product-only logic)
// A product appears if:
//   - stockQuantity <= 0                              → Out of Stock
//   - 0 < stockQuantity <= stockAlertQuantity (> 0)   → Low Stock
// Variants are ignored for the alert decision, but their current stock
// is included in the response so the admin sees the full picture.
// ============================================================
const getStockAlertProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      alertType = 'all',   // 'all' | 'out' | 'low'
      sort = 'lowest',     // 'lowest' | 'highest' | 'name_asc' | 'newest'
    } = req.query;

    // ---------- Build base query ----------
    const query = {
      isActive: true,
      stockAlertQuantity: { $gt: 0 }, // only products with alert threshold set
    };

    if (category) query.category = new mongoose.Types.ObjectId(category);
    if (brand) query.brand = { $regex: brand, $options: 'i' };

    if (search && search.trim()) {
      const re = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      query.$or = [
        { productName: re },
        { skuCode: re },
        { barcode: re },
        { brand: re },
      ];
    }

    // ---------- Apply alert-type filter on base stock ----------
    if (alertType === 'out') {
      query.stockQuantity = { $lte: 0 };
    } else if (alertType === 'low') {
      query.stockQuantity = {
        $gt: 0,
        $lte: query.stockAlertQuantity.$gt, // will be replaced below
      };
      // Proper $expr for "0 < stock <= alertAlert"
      delete query.stockQuantity;
      query.$expr = {
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', '$stockAlertQuantity'] },
        ],
      };
    } else {
      // 'all' → out OR low
      query.$expr = {
        $or: [
          { $lte: ['$stockQuantity', 0] },
          {
            $and: [
              { $gt: ['$stockQuantity', 0] },
              { $lte: ['$stockQuantity', '$stockAlertQuantity'] },
            ],
          },
        ],
      };
    }

    // ---------- Sort ----------
    let sortOption = { stockQuantity: 1, productName: 1 };
    if (sort === 'highest') sortOption = { stockQuantity: -1, productName: 1 };
    else if (sort === 'name_asc') sortOption = { productName: 1 };
    else if (sort === 'newest') sortOption = { updatedAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // ---------- Fetch paginated + total ----------
    const [products, total] = await Promise.all([
      Product.find(query)
        .select(
          'productName slug skuCode barcode brand images regularPrice ' +
          'discountPrice stockQuantity stockAlertQuantity unit hasVariants ' +
          'variantTypes isActive updatedAt'
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    // ---------- Compute alertLevel + variant breakdown for display ----------
    const data = products.map((p) => {
      const baseStock = Number(p.stockQuantity) || 0;
      const alertQty = Number(p.stockAlertQuantity) || 0;

      let alertLevel = 'low';
      if (baseStock <= 0) alertLevel = 'out';
      else if (alertQty > 0 && baseStock <= alertQty) alertLevel = 'low';

      // For display only: flatten variant + sub-variant stocks
      const alertVariants = [];
      if (p.hasVariants && Array.isArray(p.variantTypes)) {
        p.variantTypes.forEach((vt) => {
          (vt.variants || []).forEach((v) => {
            const vStock = Number(v.stockQuantity) || 0;
            const subs = v.subVariants || [];

            if (subs.length > 0) {
              subs.forEach((sv) => {
                const svStock = Number(sv.stockQuantity) || 0;
                alertVariants.push({
                  id: sv.id,
                  name: `${v.name || ''} / ${sv.name || ''}`.trim(),
                  stockQuantity: svStock,
                  skuCode: sv.skuCode || '',
                  barcode: sv.barcode || '',
                  isOut: svStock <= 0,
                });
              });
            } else {
              alertVariants.push({
                id: v.id,
                name: v.name || '',
                stockQuantity: vStock,
                skuCode: v.skuCode || '',
                barcode: v.barcode || '',
                isOut: vStock <= 0,
              });
            }
          });
        });
      }

      return {
        _id: p._id,
        productName: p.productName,
        slug: p.slug,
        skuCode: p.skuCode,
        barcode: p.barcode,
        brand: p.brand,
        images: p.images,
        regularPrice: p.regularPrice,
        discountPrice: p.discountPrice,
        unit: p.unit,
        hasVariants: p.hasVariants,
        isActive: p.isActive,
        updatedAt: p.updatedAt,
        stockQuantity: baseStock,
        stockAlertQuantity: alertQty,
        alertLevel,
        alertVariants,
      };
    });

    // ---------- Summary counts (same filter, no pagination) ----------
    const summaryAgg = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: ['$stockQuantity', 0] },
              'out',
              'low',
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = { outOfStock: 0, lowStock: 0, total: 0 };
    summaryAgg.forEach((s) => {
      if (s._id === 'out') summary.outOfStock = s.count;
      if (s._id === 'low') summary.lowStock = s.count;
    });
    summary.total = summary.outOfStock + summary.lowStock;

    res.json({
      success: true,
      data,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get stock alert products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// EXPORT
// ============================================================
module.exports = {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  getFeaturedProducts,
  getBannerProducts,
  getFlashSaleProducts,
  getTrendingProducts,
  getComingSoonProducts,
  toggleProductStatus,
  getUniqueUnits,
  getColorsByIds,
   duplicateProduct,
     restockBulk,
     getProductByBarcode,
      getProductRestockHistory,
  getAllRestockLogs,
  deleteRestockLog, 
  getStockAlertProducts
};