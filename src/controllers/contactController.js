
// // backend/src/controllers/contactController.js
// const Contact = require('../models/Contact');
// const { sendContactFormEmails } = require('../utils/contactEmailService');

// // @desc    Get contact data (public)
// // @route   GET /api/contact
// // @access  Public
// const getPublicContact = async (req, res) => {
//   try {
//     let contact = await Contact.findOne({ isActive: true });
    
//     if (!contact) {
//       contact = await createDefaultContact();
//     }

//     // Filter active items
//     const activeStats = contact.stats?.filter(s => s.isActive !== false) || [];
//     const activeQuickContacts = contact.quickContacts?.filter(q => q.isActive !== false) || [];
//     const activeSocialLinks = contact.socialLinks?.filter(s => s.isActive !== false) || [];

//     res.json({
//       success: true,
//       data: {
//         hero: contact.hero || {},
//         stats: activeStats.sort((a, b) => a.displayOrder - b.displayOrder),
//         quickContacts: activeQuickContacts.sort((a, b) => a.displayOrder - b.displayOrder),
//         leftSide: contact.leftSide || contact.rightSide || {},
//         socialLinks: activeSocialLinks.sort((a, b) => a.displayOrder - b.displayOrder),
//         faq: contact.faq || {},
//         map: contact.map || {},
//         cta: contact.cta || {},
//         form: contact.form || {}
//       }
//     });
//   } catch (error) {
//     console.error('Get public contact error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching contact data'
//     });
//   }
// };

// // @desc    Get contact data (admin)
// // @route   GET /api/contact/admin
// // @access  Private (Admin/Moderator)
// const getAdminContact = async (req, res) => {
//   try {
//     let contact = await Contact.findOne();
    
//     if (!contact) {
//       contact = await createDefaultContact();
//     }

//     res.json({
//       success: true,
//       data: contact
//     });
//   } catch (error) {
//     console.error('Get admin contact error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching contact data'
//     });
//   }
// };

// // @desc    Update contact data
// // @route   PUT /api/contact/admin
// // @access  Private (Admin/Moderator)
// const updateContact = async (req, res) => {
//   try {
//     let contact = await Contact.findOne();
    
//     if (!contact) {
//       contact = await createDefaultContact();
//     }

//     const {
//       hero,
//       stats,
//       quickContacts,
//       leftSide,
//       rightSide,
//       socialLinks,
//       faq,
//       map,
//       cta,
//       form,
//       isActive
//     } = req.body;

//     // Update fields
//     if (hero) contact.hero = hero;
//     if (map) contact.map = map;
//     if (cta) contact.cta = cta;
//     if (form) contact.form = form;
//     if (isActive !== undefined) contact.isActive = isActive;

//     // Handle leftSide/rightSide mapping
//     const sideData = leftSide || rightSide;
//     if (sideData) {
//       contact.rightSide = sideData;
//       contact.leftSide = sideData;
//     }

//     if (stats && Array.isArray(stats)) {
//       contact.stats = stats.map((stat, index) => ({
//         ...stat,
//         displayOrder: stat.displayOrder !== undefined ? stat.displayOrder : index
//       }));
//     }

//     if (quickContacts && Array.isArray(quickContacts)) {
//       contact.quickContacts = quickContacts.map((item, index) => ({
//         ...item,
//         displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
//       }));
//     }

//     if (socialLinks && Array.isArray(socialLinks)) {
//       contact.socialLinks = socialLinks.map((item, index) => ({
//         ...item,
//         displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
//       }));
//     }

//     if (faq) {
//       contact.faq = {
//         badge: faq.badge || contact.faq?.badge || 'FAQ',
//         title: faq.title || contact.faq?.title || 'Frequently Asked Questions',
//         description: faq.description || contact.faq?.description || '',
//         items: faq.items ? faq.items.map((item, index) => ({
//           ...item,
//           displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
//         })) : contact.faq?.items || []
//       };
//     }

//     contact.updatedBy = req.user.id;
//     await contact.save();

//     const updatedContact = await Contact.findById(contact._id);

//     res.json({
//       success: true,
//       data: updatedContact,
//       message: 'Contact page updated successfully'
//     });
//   } catch (error) {
//     console.error('Update contact error:', error);
    
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
//       error: 'Failed to update contact page. Please try again.',
//       details: error.message
//     });
//   }
// };

// // @desc    Submit contact form with email
// // @route   POST /api/contact
// // @access  Public
// const submitContactForm = async (req, res) => {
//   try {
//     const { name, email, phone, subject, message } = req.body;

//     // Validate required fields
//     if (!name || !email || !phone || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please fill in all required fields'
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide a valid email address'
//       });
//     }

//     console.log('📧 New Contact Form Submission:');
//     console.log(`  Name: ${name}`);
//     console.log(`  Email: ${email}`);
//     console.log(`  Phone: ${phone}`);
//     console.log(`  Subject: ${subject || 'General Inquiry'}`);
//     console.log(`  Message: ${message}`);

//     // Send emails using your existing email service
//     const emailResult = await sendContactFormEmails({
//       name,
//       email,
//       phone,
//       subject: subject || 'General Inquiry',
//       message
//     });

//     if (!emailResult.success) {
//       console.error('❌ Email sending failed:', emailResult.error);
//     }

//     res.json({
//       success: true,
//       message: 'Thank you for your message! We will get back to you within 24 hours.'
//     });
//   } catch (error) {
//     console.error('Contact form submission error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send message. Please try again later.'
//     });
//   }
// };

// // @desc    Reset contact to default
// // @route   POST /api/contact/admin/reset
// // @access  Private (Admin/Moderator)
// const resetContact = async (req, res) => {
//   try {
//     console.log('🔄 Resetting contact to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
//     await Contact.deleteMany({});
//     const contact = await createDefaultContact();

//     res.json({
//       success: true,
//       data: contact,
//       message: 'Contact page reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset contact error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting contact page'
//     });
//   }
// };

// // @desc    Get raw database data
// // @route   GET /api/contact/admin/raw-data
// // @access  Private (Admin)
// const getRawData = async (req, res) => {
//   try {
//     const contact = await Contact.findOne().lean();
    
//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         error: 'No contact data found'
//       });
//     }

//     res.json({
//       success: true,
//       data: contact
//     });
//   } catch (error) {
//     console.error('Error getting raw data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Create default contact - BEAUTY BUCKET BRANDING
// const createDefaultContact = async () => {
//   const defaultContact = {
//     hero: {
//       bgImage: '/images/bg10.jpg',
//       badge: 'Get in Touch',
//       title: "We'd Love to",
//       highlightText: 'Hear From You',
//       description: 'Have questions about products, orders, or anything else? We\'re here to help and respond within 24 hours.'
//     },
//     stats: [
//       {
//         icon: 'FaUsers',
//         value: '10K+',
//         label: 'Happy Customers',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         icon: 'FaStar',
//         value: '4.9/5',
//         label: 'Average Rating',
//         displayOrder: 1,
//         isActive: true
//       },
//       {
//         icon: 'FaAward',
//         value: '100%',
//         label: 'Authentic Products',
//         displayOrder: 2,
//         isActive: true
//       },
//       {
//         icon: 'FaClock',
//         value: '24/7',
//         label: 'Support Available',
//         displayOrder: 3,
//         isActive: true
//       }
//     ],
//     quickContacts: [
//       {
//         icon: 'FaPhone',
//         label: 'Phone',
//         value: '+880 1XXXXXXX',
//         link: 'tel:+8801XXXXXXX',
//         color: 'bg-[#EE4275]',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         icon: 'FaEnvelope',
//         label: 'Email',
//         value: 'support@beautybucket.com',
//         link: 'mailto:support@beautybucket.com',
//         color: 'bg-[#FF6B9D]',
//         displayOrder: 1,
//         isActive: true
//       },
//       {
//         icon: 'FaMapMarkerAlt',
//         label: 'Address',
//         value: 'Dhaka, Bangladesh',
//         link: 'https://maps.google.com',
//         color: 'bg-[#2D1B2E]',
//         displayOrder: 2,
//         isActive: true
//       },
//       {
//         icon: 'FaClock',
//         label: 'Working Hours',
//         value: '24/7 Online Ordering',
//         link: '#',
//         color: 'bg-[#8B7A8C]',
//         displayOrder: 3,
//         isActive: true
//       }
//     ],
//     rightSide: {
//       badge: 'Contact Us',
//       title: "Let's Connect",
//       subtitle: '& Make Beauty Happen',
//       description: 'Whether you have questions about a product, need assistance with an order, or just want some beauty advice - our team is ready to help you.',
//       quickContactTitle: 'Quick Contact',
//       socialTitle: 'Follow Us',
//       features: [
//         {
//           icon: 'CheckCircle',
//           title: 'Quick Response',
//           description: 'We reply within 24 hours'
//         },
//         {
//           icon: 'Shield',
//           title: 'Expert Advice',
//           description: 'Get guidance from beauty experts'
//         },
//         {
//           icon: 'Truck',
//           title: 'Order Support',
//           description: 'Track and manage your orders'
//         }
//       ]
//     },
//     leftSide: {
//       badge: 'Contact Us',
//       title: "Let's Connect",
//       subtitle: '& Make Beauty Happen',
//       description: 'Whether you have questions about a product, need assistance with an order, or just want some beauty advice - our team is ready to help you.',
//       quickContactTitle: 'Quick Contact',
//       socialTitle: 'Follow Us',
//       features: [
//         {
//           icon: 'CheckCircle',
//           title: 'Quick Response',
//           description: 'We reply within 24 hours'
//         },
//         {
//           icon: 'Shield',
//           title: 'Expert Advice',
//           description: 'Get guidance from beauty experts'
//         },
//         {
//           icon: 'Truck',
//           title: 'Order Support',
//           description: 'Track and manage your orders'
//         }
//       ]
//     },
//     socialLinks: [
//       {
//         platform: 'facebook',
//         url: '#',
//         icon: 'FaFacebookF',
//         color: 'hover:bg-[#1877F2]',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         platform: 'instagram',
//         url: '#',
//         icon: 'FaInstagram',
//         color: 'hover:bg-[#E4405F]',
//         displayOrder: 1,
//         isActive: true
//       },
//       {
//         platform: 'youtube',
//         url: '#',
//         icon: 'FaYoutube',
//         color: 'hover:bg-[#FF0000]',
//         displayOrder: 2,
//         isActive: true
//       },
//       {
//         platform: 'pinterest',
//         url: '#',
//         icon: 'FaPinterest',
//         color: 'hover:bg-[#BD081C]',
//         displayOrder: 3,
//         isActive: true
//       },
//       {
//         platform: 'tiktok',
//         url: '#',
//         icon: 'FaTiktok',
//         color: 'hover:bg-[#000000]',
//         displayOrder: 4,
//         isActive: true
//       }
//     ],
//     faq: {
//       badge: 'FAQ',
//       title: 'Frequently Asked Questions',
//       description: 'Find quick answers to common questions about our products and services.',
//       items: []
//     },
//     map: {
//       title: 'Find Us',
//       embedCode: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7298.959613691955!2d90.36501103719962!3d23.837090178133415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c14a3366b005%3A0x901b07016468944c!2sMirpur%20DOHS%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1786947632208!5m2!1sen!2sbd" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin'
//     },
//     cta: {
//       bgImage: '/images/pattern.png',
//       badge: 'Still Have Questions?',
//       title: "We're Here to Help",
//       description: 'Our beauty experts are ready to assist you with any questions about products or orders.',
//       buttonText: 'Call Now',
//       buttonLink: 'tel:+8801871733305',
//       secondaryButtonText: 'Browse Products',
//       secondaryButtonLink: '/products'
//     },
//     form: {
//       title: 'Send Us a Message',
//       description: "Fill in the form and we'll get back to you within 24 hours",
//       successMessage: "Thank you! We'll get back to you within 24 hours."
//     },
//     isActive: true
//   };

//   return await Contact.create(defaultContact);
// };

// module.exports = {
//   getPublicContact,
//   getAdminContact,
//   updateContact,
//   resetContact,
//   getRawData,
//   submitContactForm
// };

const Contact = require('../models/Contact');
const { sendContactFormEmails } = require('../utils/contactEmailService');

// ============================================================
// HELPERS
// ============================================================

const sortActive = (arr = []) =>
  [...arr]
    .filter((x) => x.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

// ============================================================
// DEFAULT DATA — Nishita's Collection branding
// ============================================================

const defaultContact = () => ({
  hero: {
    bgImage: '/images/contact-hero.jpg',
    badge: 'Get In Touch',
    title: "We'd Love to",
    highlightText: 'Hear From You',
    description:
      "Have questions about our handcrafted clothing, orders, or anything else? We're here to help and respond within 24 hours.",
  },

  quickContacts: [
    {
      icon: 'FaMapMarkerAlt',
      label: 'Our Location',
      value: 'Rayerbag, kodomtoli, Jatrabari, Dhaka',
      link: 'https://www.google.com/maps/place/Rayerbag+Complex+Super+market/@23.6990572,90.4549504,17z/data=!4m10!1m2!2m1!1sshop+address+-+shop+no-+153+154+(+2nd+floor)+rayerbag+complex+supermarket+rayerbag+kodomtoli+jatrabari+dhaka.+(+landmark+-+near+rayerbag+over+bridge)+dhaka+bangladesh+01747-708644!3m6!1s0x3755b700351120e3:0xa4d66033b870a2ca!8m2!3d23.6986778!4d90.4574896!15sCrMBc2hvcCBhZGRyZXNzIC0gc2hvcCBuby0gMTUzIDE1NCAoIDJuZCBmbG9vcikgcmF5ZXJiYWcgY29tcGxleCBzdXBlcm1hcmtldCByYXllcmJhZyBrb2RvbXRvbGkgamF0cmFiYXJpIGRoYWthLiAoIGxhbmRtYXJrIC0gbmVhciByYXllcmJhZyBvdmVyIGJyaWRnZSkgZGhha2EgYmFuZ2xhZGVzaCAwMTc0Ny03MDg2NDRaqgEipwFzaG9wIGFkZHJlc3Mgc2hvcCBubyAxNTMgMTU0IDJuZCBmbG9vciByYXllcmJhZyBjb21wbGV4IHN1cGVybWFya2V0IHJheWVyYmFnIGtvZG9tdG9saSBqYXRyYWJhcmkgZGhha2EgbGFuZG1hcmsgbmVhciByYXllcmJhZyBvdmVyIGJyaWRnZSBkaGFrYSBiYW5nbGFkZXNoIDAxNzQ3IDcwODY0NJIBDXBlcmZ1bWVfc3RvcmWaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnBTYzA5R2JGbE1WVnBQWWtkT1lWSkViR3hqTW1SWFZFWTVNMlF3UlJBQuABAPoBBAhCEB0!16s%2Fg%2F11mm08xgq9?entry=ttu&g_ep=EgoyMDI2MDkyMC4wIKXMDSoASAFQAw%3D%3D',
      description:
        'Visit our flagship outlet to explore our latest handcrafted collection in person.',
      displayOrder: 0,
      isActive: true,
    },
   {
  icon: 'FaEnvelope',
  label: 'Email Address',
  value: 'hello@nishitascollection.com',
  link: 'https://mail.google.com/mail/?view=cm&fs=1&to=hello@nishitascollection.com',
  description:
    "Drop us a line and we'll get back to you within 24 hours.",
  displayOrder: 1,
  isActive: true,
},
    {
      icon: 'FaPhone',
      label: 'Call Us Now',
      value: '+880 1747708644',
      link: 'tel:+8801747708644',
      description:
        'Our customer care team is available 24/7. Call us anytime',
      displayOrder: 2,
      isActive: true,
    },
  ],

  leftSide: {
    badge: "Nishita's Collection",
    title: "Let's Connect",
    subtitle: '& Craft Something Beautiful',
    description:
      'Whether you have questions about a product, need assistance with an order, or just want some styling advice — our team is ready to help.',
    quickContactTitle: 'Quick Contact',
    socialTitle: 'Follow Us',
    features: [
      { icon: 'CheckCircle', title: 'Quick Response', description: 'We reply within 24 hours' },
      { icon: 'Shield',      title: 'Expert Advice',  description: 'Guidance from our styling team' },
      { icon: 'Truck',       title: 'Order Support',  description: 'Track and manage your orders' },
    ],
  },

  socialLinks: [
    { platform: 'facebook',  url: 'https://www.facebook.com/NishitasCreation/', icon: 'FaFacebookF', color: 'hover:bg-[#1877F2]', displayOrder: 0, isActive: true },
    { platform: 'instagram', url: 'https://www.instagram.com/nishitascreation/', icon: 'FaInstagram', color: 'hover:bg-[#E4405F]', displayOrder: 1, isActive: true },
    { platform: 'youtube',   url: 'https://www.youtube.com/@NishitaPaulsLifestyle', icon: 'FaYoutube',   color: 'hover:bg-[#FF0000]', displayOrder: 2, isActive: true },
    { platform: 'pinterest', url: '#', icon: 'FaPinterest', color: 'hover:bg-[#BD081C]', displayOrder: 3, isActive: true },
    { platform: 'tiktok',    url: '#', icon: 'FaTiktok',    color: 'hover:bg-[#000000]', displayOrder: 4, isActive: true },
  ],

  map: {
    title: 'Find Us',
    embedCode: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3653.3537787265323!2d90.45495042396816!3d23.699057190748086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b700351120e3%3A0xa4d66033b870a2ca!2sRayerbag%20Complex%20Super%20market!5e0!3m2!1sen!2sbd!4v1790056051343!5m2!1sen!2sbd" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin',
  },

  cta: {
    bgImage: '/images/cta-bg.jpg',
    badge: 'Still Have Questions?',
    title: "We're Here to Help",
    description:
      'Our team is ready to assist you with anything — from sizing to styling.',
    buttonText: 'Call Now',
    buttonLink: 'tel:+8801747708644',
    secondaryButtonText: 'Browse Collection',
    secondaryButtonLink: '/products',
  },

  form: {
    title: "We'd Love to Hear From You",
    description: "Fill in the form and we'll get back to you within 24 hours",
    successMessage: "Thank you! We'll get back to you within 24 hours.",
  },

  isActive: true,
});

// ============================================================
// PUBLIC — GET /api/contact
// ============================================================

exports.getPublicContact = async (req, res) => {
  try {
    let contact = await Contact.findOne({ isActive: true });
    if (!contact) contact = await Contact.create(defaultContact());

    res.json({
      success: true,
      data: {
        hero: contact.hero || {},
        quickContacts: sortActive(contact.quickContacts),
        leftSide: contact.leftSide || {},
        socialLinks: sortActive(contact.socialLinks),
        map: contact.map || {},
        cta: contact.cta || {},
        form: contact.form || {},
      },
    });
  } catch (error) {
    console.error('getPublicContact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — GET /api/contact/admin
// ============================================================

exports.getAdminContact = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = await Contact.create(defaultContact());
    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('getAdminContact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — PUT /api/contact/admin
// ============================================================

exports.updateContact = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = await Contact.create(defaultContact());

    const {
      hero, quickContacts, leftSide, socialLinks, map, cta, form, isActive,
    } = req.body;

    if (hero)          contact.hero = hero;
    if (leftSide)      contact.leftSide = leftSide;
    if (map)           contact.map = map;
    if (cta)           contact.cta = cta;
    if (form)          contact.form = form;
    if (isActive !== undefined) contact.isActive = isActive;

    if (Array.isArray(quickContacts)) {
      contact.quickContacts = quickContacts.map((item, i) => ({
        ...item,
        displayOrder: item.displayOrder ?? i,
      }));
    }

    if (Array.isArray(socialLinks)) {
      contact.socialLinks = socialLinks.map((item, i) => ({
        ...item,
        displayOrder: item.displayOrder ?? i,
      }));
    }

    contact.updatedBy = req.user?._id || req.user?.id;
    await contact.save();

    res.json({ success: true, data: contact, message: 'Contact page updated' });
  } catch (error) {
    console.error('updateContact error:', error);
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: msgs.join(' ') });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — POST /api/contact/admin/reset
// ============================================================

exports.resetContact = async (req, res) => {
  try {
    await Contact.deleteMany({});
    const contact = await Contact.create(defaultContact());
    res.json({ success: true, data: contact, message: 'Contact reset to default' });
  } catch (error) {
    console.error('resetContact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — GET raw data
// ============================================================

exports.getRawData = async (req, res) => {
  try {
    const contact = await Contact.findOne().lean();
    if (!contact) return res.status(404).json({ success: false, error: 'No contact data' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// PUBLIC — POST /api/contact (form submit)
// ============================================================

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    console.log('📧 New Contact Form Submission:');
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Phone: ${phone}`);
    console.log(`  Subject: ${subject || 'General Inquiry'}`);
    console.log(`  Message: ${message}`);

    const emailResult = await sendContactFormEmails({
      name, email, phone,
      subject: subject || 'General Inquiry',
      message,
    });

    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.error);
    }

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('submitContactForm error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
  }
};