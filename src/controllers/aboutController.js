
// // backend/src/controllers/aboutController.js
// const About = require('../models/About');

// // @desc    Get public about data
// // @route   GET /api/about/page
// // @access  Public
// const getPublicAbout = async (req, res) => {
//   try {
//     let about = await About.findOne({ isActive: true });
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     // Filter active items
//     const activeStats = about.stats?.items?.filter(s => s.isActive !== false) || [];
//     const activeImages = about.story?.images?.filter(i => i.isActive !== false) || [];

//     const storyData = {
//       badge: about.story?.badge || 'Our Story',
//       title: about.story?.title || 'A Journey of Beauty & Trust',
//       paragraphs: about.story?.paragraphs?.length > 0 ? about.story.paragraphs : [
//         'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh.',
//         'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves.',
//         'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
//       ],
//       trustIndicators: about.story?.trustIndicators?.length > 0 ? about.story.trustIndicators : [
//         { icon: 'FaCheckCircle', label: 'Quality Assured' },
//         { icon: 'FaShippingFast', label: 'Fast Delivery' },
//         { icon: 'FaGift', label: 'Shipping Across the Country' },
//         { icon: 'FaSmile', label: '100% Satisfaction' }
//       ],
//       images: activeImages.sort((a, b) => a.displayOrder - b.displayOrder)
//     };

//     // Get categories for curatedForYou section
//     const Category = require('../models/Category');
//     const categories = await Category.find({ isActive: true })
//       .select('name slug image productCount')
//       .sort({ name: 1 })
//       .limit(8);

//     res.json({
//       success: true,
//       data: {
//         hero: about.hero || {},
//         stats: {
//           backgroundImage: about.stats?.backgroundImage || '/images/bg5.PNG',
//           items: activeStats.sort((a, b) => a.displayOrder - b.displayOrder)
//         },
//         story: storyData,
//         whyChooseUs: about.whyChooseUs || {},
//         curatedForYou: {
//           ...about.curatedForYou || {},
//           categories: categories || []
//         },
//         cta: about.cta || {}
//       }
//     });
//   } catch (error) {
//     console.error('Get public about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching about data'
//     });
//   }
// };

// // @desc    Get admin about data
// // @route   GET /api/admin/about
// // @access  Private (Admin/Moderator)
// const getAdminAbout = async (req, res) => {
//   try {
//     let about = await About.findOne();
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     res.json({
//       success: true,
//       data: about
//     });
//   } catch (error) {
//     console.error('Get admin about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching about data'
//     });
//   }
// };

// // @desc    Update about data
// // @route   PUT /api/admin/about
// // @access  Private (Admin/Moderator)
// const updateAbout = async (req, res) => {
//   try {
//     let about = await About.findOne();
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     const {
//       hero,
//       stats,
//       story,
//       whyChooseUs,
//       curatedForYou,
//       cta,
//       isActive
//     } = req.body;

//     if (hero) about.hero = hero;
//     if (stats) about.stats = stats;
//     if (story) about.story = story;
//     if (whyChooseUs) about.whyChooseUs = whyChooseUs;
//     if (curatedForYou) about.curatedForYou = curatedForYou;
//     if (cta) about.cta = cta;
//     if (isActive !== undefined) about.isActive = isActive;

//     about.updatedBy = req.user.id;
//     await about.save();

//     const updatedAbout = await About.findById(about._id);

//     res.json({
//       success: true,
//       data: updatedAbout,
//       message: 'About page updated successfully'
//     });
//   } catch (error) {
//     console.error('Update about error:', error);
    
//     if (error.name === 'ValidationError') {
//       const errorMessages = [];
//       for (const [path, err] of Object.entries(error.errors)) {
//         const fieldName = path.split('.').pop().replace(/([A-Z])/g, ' $1').toLowerCase();
//         errorMessages.push(`The "${fieldName}" field is required.`);
//       }
      
//       return res.status(400).json({
//         success: false,
//         error: errorMessages.join(' '),
//         details: errorMessages
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update about page. Please try again.',
//       details: error.message
//     });
//   }
// };

// // @desc    Reset about to default
// // @route   POST /api/admin/about/reset
// // @access  Private (Admin/Moderator)
// const resetAbout = async (req, res) => {
//   try {
//     console.log('🔄 Resetting about to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
//     await About.deleteMany({});
//     const about = await createDefaultAbout();

//     res.json({
//       success: true,
//       data: about,
//       message: 'About page reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting about page'
//     });
//   }
// };

// // @desc    Create default about
// const createDefaultAbout = async () => {
//   const defaultAbout = {
//     hero: {
//       leftImage: '/images/bg1.png',
//       rightImage: '/images/bg8.png',
//       badge: 'About Us',
//       title: 'Redefining Beauty',
//       highlightedText: 'for Everyone',
//       description: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.',
//       buttonText: 'Explore Products',
//       buttonLink: '/products',
//       secondaryButtonText: 'Get in Touch',
//       secondaryButtonLink: '/contact'
//     },
//     stats: {
//       backgroundImage: '/images/bg5.PNG',
//       items: [
//         { icon: 'FaAward', value: '50+', label: 'Premium Brands', displayOrder: 0, isActive: true },
//         { icon: 'FaUsers', value: '5K+', label: 'Happy Customers', displayOrder: 1, isActive: true },
//         { icon: 'GiLipstick', value: '500+', label: 'Products', displayOrder: 2, isActive: true },
//         { icon: 'FaStar', value: '98%', label: 'Satisfaction Rate', displayOrder: 3, isActive: true }
//       ]
//     },
//     story: {
//       badge: 'Our Story',
//       title: 'A Journey of Beauty & Trust',
//       paragraphs: [
//         'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh.',
//         'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves.',
//         'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
//       ],
//       trustIndicators: [
//         { icon: 'FaCheckCircle', label: 'Quality Assured' },
//         { icon: 'FaShippingFast', label: 'Fast Delivery' },
//         { icon: 'FaGift', label: 'Shipping Across the Country' },
//         { icon: 'FaSmile', label: '100% Satisfaction' }
//       ],
//       images: [
//         { src: '/images/about1.jpg', alt: 'Happy customer', displayOrder: 0, isActive: true },
//         { src: '/images/bg6.png', alt: 'Beauty products display', displayOrder: 1, isActive: true },
//         { src: '/images/bg9.PNG', alt: 'Product curation', displayOrder: 2, isActive: true },
//         { src: '/images/bg8.png', alt: 'Beauty team', displayOrder: 3, isActive: true }
//       ]
//     },
//     whyChooseUs: {
//       backgroundImage: '/images/bg5.PNG',
//       badge: 'Why Choose Us',
//       title: 'Beauty Is Power, A Smile Is Its Word',
//       description: 'We believe that true beauty starts from within. Our carefully selected products are designed to help you feel confident, radiant, and completely yourself.',
//       buttonText: 'Explore More',
//       buttonLink: '/products',
//       cards: [
//         {
//           icon: 'FaLeaf',
//           title: '100% Organic',
//           description: 'Carefully selected products made with ingredients you can trust.'
//         },
//         {
//           icon: 'FaHeart',
//           title: 'Improve Health',
//           description: 'Beauty essentials designed to support your everyday self-care.'
//         },
//         {
//           icon: 'FaShieldAlt',
//           title: '100% Authentic',
//           description: 'Every product is verified for authenticity and quality.'
//         },
//         {
//           icon: 'FaTruck',
//           title: 'Fast Delivery',
//           description: 'Quick and reliable delivery right to your doorstep.'
//         }
//       ]
//     },
//     curatedForYou: {
//       badge: 'Curated For You',
//       title: 'Beauty, Curated For You',
//       description: 'Discover our handpicked collection of premium beauty products, carefully selected to enhance your natural beauty.',
//       buttonText: 'View All Products',
//       buttonLink: '/products',
//       isActive: true
//     },
//     cta: {
//       backgroundImage: '/images/cta-bg.jpg',
//       title: "We're Here to Help",
//       description: 'Our beauty experts are ready to assist you with any questions about products or orders.',
//       buttonText: 'Shop Now',
//       buttonLink: '/products',
//       secondaryButtonText: 'Contact Us',
//       secondaryButtonLink: '/contact'
//     },
//     isActive: true
//   };

//   return await About.create(defaultAbout);
// };

// module.exports = {
//   getPublicAbout,
//   getAdminAbout,
//   updateAbout,
//   resetAbout
// };

const About = require('../models/About');

// ============================================================
// DEFAULT DATA
// ============================================================

const defaultAbout = () => ({
  hero: {
    sectionName: 'Hero',
    image: '/images/about1.jpg',
    imageAlt: 'Handcrafted traditional work',
    badge: 'আমাদের গল্প',
    title: 'ঐতিহ্যের ছোঁয়ায়',
    highlightedText: 'হাতের ভালোবাসা',
    description:
      'ব্লকপ্রিন্ট, অ্যাপ্লিক ও যশোরের হাতের কাজের ঐতিহ্যকে ধারণ করে তৈরি হয় আমাদের প্রতিটি পণ্য। নিজস্ব কারখানা ও দক্ষ কারিগরদের হাতে প্রতিটি নকশা পায় আলাদা একটি গল্প।',
    primaryButton: { text: 'আমাদের গল্প জানুন', link: '#brand-story', isActive: true },
  },

  brandStory: {
    sectionName: 'Brand Story',
    images: [
      { url: '/images/about2.jpg', alt: 'Our workshop', displayOrder: 0, isActive: true },
      { url: '/images/about1.jpg', alt: 'Craft detail',  displayOrder: 1, isActive: true },
    ],
    imageCaption: 'আমাদের নিজস্ব কারখানা',
    badge: 'আমাদের সম্পর্কে',
    title: 'বিস্তৃত ঐতিহ্য,',
    highlightedText: 'স্বপ্নে নতুন প্রজন্ম',
    description:
      'আমাদের বিশ্বাস, একটি পোশাক শুধু পোশাক নয়—এর সঙ্গে জড়িয়ে থাকে মানুষের গল্প, সংস্কৃতি, ঐতিহ্য এবং ভালোবাসা।',
    features: [
      { icon: 'FaLeaf',  title: 'দেশীয় কারুশিল্প', description: '', isActive: true },
      { icon: 'FaUsers', title: 'দক্ষ কারিগর',     description: '', isActive: true },
      { icon: 'FaHeart', title: 'ভালোবাসায় তৈরি', description: '', isActive: true },
    ],
  },

  journey: {
    sectionName: 'Journey',
    badge: 'আমাদের যাত্রা',
    title: 'শুরু থেকে',
    highlightedText: 'আজ পর্যন্ত',
    description:
      'ছোট্ট একটি স্বপ্ন থেকে শুরু করে আজকের এই পথচলা—প্রতিটি ধাপে রয়েছে নতুন গল্প।',
    items: [
      { year: '২০১৮', title: 'শুরুটা এখান থেকেই', text: 'বাংলার ঐতিহ্যবাহী কারুশিল্প ও নকশাকে নতুনভাবে তুলে ধরার ছোট্ট একটি স্বপ্ন নিয়ে আমাদের যাত্রা শুরু।', image: '/images/about1.jpg', displayOrder: 0, isActive: true },
      { year: '২০২০', title: 'নিজস্ব কারখানা',    text: 'দক্ষ কারিগরদের নিয়ে নিজস্ব কাজের জায়গা তৈরি করি, যেখানে প্রতিটি পণ্য তৈরি হয় যত্ন ও ভালোবাসায়।',   image: '/images/about2.jpg', displayOrder: 1, isActive: true },
      { year: '২০২২', title: 'ঐতিহ্যের নতুন গল্প', text: 'ব্লকপ্রিন্ট, অ্যাপ্লিক ও যশোরের হাতের কাজকে আধুনিক পোশাকের সঙ্গে নতুনভাবে উপস্থাপন শুরু করি।',    image: '/images/about1.jpg', displayOrder: 2, isActive: true },
      { year: '২০২৪', title: 'আরও বড় পরিবার',    text: 'দেশের বিভিন্ন প্রান্তের কারিগর ও শিল্পীদের সঙ্গে আমাদের কাজের পরিধি আরও বিস্তৃত হয়।',          image: '/images/about2.jpg', displayOrder: 3, isActive: true },
      { year: '২০২৬', title: 'নতুন প্রজন্মের পথে', text: 'ঐতিহ্যকে সঙ্গে নিয়ে নতুন প্রজন্মের কাছে বাংলাদেশের নিজস্ব কারুশিল্প পৌঁছে দেওয়ার পথচলা।',           image: '/images/about1.jpg', displayOrder: 4, isActive: true },
    ],
  },

  craftsmanship: {
    sectionName: 'Craftsmanship',
    badge: 'আমাদের কারুশিল্প',
    title: 'যত্নে তৈরি,',
    highlightedText: 'ঐতিহ্যের হাত ধরে',
    description:
      'প্রতিটি পণ্যের পেছনে রয়েছে একজন কারিগরের সময়, শ্রম এবং সৃজনশীলতা। আমরা সেই হাতের কাজকে সম্মান করি।',
    button: { text: 'কারুশিল্প সম্পর্কে জানুন', link: '/crafts', isActive: true },
    cards: [
      { title: 'ব্লকপ্রিন্ট',       subtitle: 'হাতের ছোঁয়ায় তৈরি প্রতিটি নকশা', image: '/images/about/craft-1.jpg', displayOrder: 0, isActive: true },
      { title: 'অ্যাপ্লিক',          subtitle: 'রঙ ও কাপড়ে গল্প বলার শিল্প',       image: '/images/about/craft-2.jpg', displayOrder: 1, isActive: true },
      { title: 'যশোরের হাতের কাজ', subtitle: 'প্রজন্ম থেকে প্রজন্মের ঐতিহ্য',       image: '/images/about/craft-3.jpg', displayOrder: 2, isActive: true },
    ],
  },

  artisan: {
    sectionName: 'Artisan',
    image: '/images/about/family.jpg',
    imageAlt: 'Our artisan team',
    badge: 'আমাদের পরিবার',
    title: 'ঐতিহ্যের ছোঁয়ায়',
    highlightedText: 'আমাদের গল্প',
    description:
      'আমাদের প্রতিটি কাজের পেছনে আছেন অক্লান্ত পরিশ্রম, ধৈর্য আর নিখুঁতভাবে কাজ করার ভালোবাসা।  যত্নশীল হাতের ছোঁয়ায় প্রতিটি পণ্য হয়ে ওঠে অনন্য—যেখানে মিশে থাকে  শ্রম, সৃজনশীলতা ও দীর্ঘদিনের অভিজ্ঞতা।',
    quote:
      'আমাদের প্রতিটি কাজের মাঝে আমরা আমাদের মাটি, মানুষ ও ঐতিহ্যকে বাঁচিয়ে রাখতে চাই।',
    quoteAuthor: 'Nishitas Creation',
    button: { text: 'আমাদের সম্পর্কে জানুন', link: '/artisans', isActive: true },
  },

  gallery: {
    sectionName: 'Gallery',
    badge: 'মুহূর্তগুলো',
    title: 'আমাদের কাজের কিছু গল্প',
    description: '',
    images: [
      { url: '/images/about/gallery-1.jpg', alt: 'Gallery 1', displayOrder: 0, isActive: true },
      { url: '/images/about/gallery-2.jpg', alt: 'Gallery 2', displayOrder: 1, isActive: true },
      { url: '/images/about/gallery-3.jpg', alt: 'Gallery 3', displayOrder: 2, isActive: true },
      { url: '/images/about/gallery-4.jpg', alt: 'Gallery 4', displayOrder: 3, isActive: true },
      { url: '/images/about/gallery-5.jpg', alt: 'Gallery 5', displayOrder: 4, isActive: true },
      { url: '/images/about/gallery-6.jpg', alt: 'Gallery 6', displayOrder: 5, isActive: true },
    ],
  },

  cta: {
    sectionName: 'Final CTA',
    backgroundImage: '/images/about/cta.jpg',
    title: 'ঐতিহ্যের গল্প বাঁচুক',
    description:
      'আমাদের সঙ্গে আবিষ্কার করুন বাংলাদেশের নিজস্ব কারুশিল্প, নকশা ও হাতের কাজের সৌন্দর্য।',
    primaryButton: { text: 'আমাদের সংগ্রহ দেখুন', link: '/products', isActive: true },
  },

  isActive: true,
});

// ============================================================
// HELPERS
// ============================================================

const sortActive = (arr = []) =>
  [...arr]
    .filter((x) => x.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

const cleanImageArray = (arr = []) =>
  sortActive(arr)
    .filter((img) => img.url)
    .map((img) => ({ url: img.url, alt: img.alt, displayOrder: img.displayOrder }));

// ============================================================
// PUBLIC — GET /api/about/page
// ============================================================

exports.getPublicAbout = async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true });
    if (!about) about = await About.create(defaultAbout());

    const d = about.toObject();

    res.json({
      success: true,
      data: {
        hero: d.hero,
        brandStory: {
          ...d.brandStory,
          images: cleanImageArray(d.brandStory?.images).slice(0, 4),
          features: (d.brandStory?.features || []).filter((f) => f.isActive !== false),
        },
        journey: {
          ...d.journey,
          items: sortActive(d.journey?.items),
        },
        craftsmanship: {
          ...d.craftsmanship,
          cards: sortActive(d.craftsmanship?.cards),
        },
        artisan: d.artisan,
        gallery: {
          ...d.gallery,
          images: cleanImageArray(d.gallery?.images),
        },
        cta: d.cta,
      },
    });
  } catch (error) {
    console.error('getPublicAbout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — GET /api/admin/about
// ============================================================

exports.getAdminAbout = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = await About.create(defaultAbout());
    res.json({ success: true, data: about });
  } catch (error) {
    console.error('getAdminAbout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — PUT /api/admin/about
// ============================================================

exports.updateAbout = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = await About.create(defaultAbout());

    const {
      hero, brandStory, journey, craftsmanship, artisan, gallery, cta, isActive,
    } = req.body;

    if (hero)          about.hero = hero;
    if (brandStory)    about.brandStory = brandStory;
    if (journey)       about.journey = journey;
    if (craftsmanship) about.craftsmanship = craftsmanship;
    if (artisan)       about.artisan = artisan;
    if (gallery)       about.gallery = gallery;
    if (cta)           about.cta = cta;
    if (isActive !== undefined) about.isActive = isActive;

    about.updatedBy = req.user?._id || req.user?.id;
    await about.save();

    res.json({ success: true, data: about, message: 'About page updated' });
  } catch (error) {
    console.error('updateAbout error:', error);
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: msgs.join(' ') });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — POST /api/admin/about/reset
// ============================================================

exports.resetAbout = async (req, res) => {
  try {
    await About.deleteMany({});
    const about = await About.create(defaultAbout());
    res.json({ success: true, data: about, message: 'About reset to default' });
  } catch (error) {
    console.error('resetAbout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};