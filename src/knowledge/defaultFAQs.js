// backend/src/knowledge/defaultFAQs.js

const defaultFAQs = [
  // Greetings
  {
    question: 'Hello / Hi / Hey',
    answer: '🌸 Hello beautiful! Welcome to Beauty Bucket! I\'m your virtual beauty assistant. How can I help you today? 💕',
    category: 'general',
    priority: 10,
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening']
  },
  {
    question: 'Thank you / Thanks',
    answer: '💖 You\'re welcome! Thanks for chatting with me. Have a beautiful day! ✨🌸',
    category: 'general',
    priority: 9,
    keywords: ['thanks', 'thank you', 'thank u', 'ty']
  },
  // Store Info
  {
    question: 'What is Beauty Bucket?',
    answer: '🌸 Beauty Bucket is Bangladesh\'s trusted premium beauty store. We offer authentic skincare, makeup, fragrances, hair care, and body care products from top brands. 💕',
    category: 'general',
    priority: 8,
    keywords: ['beauty bucket', 'about', 'store', 'company', 'who are you']
  },
  {
    question: 'Where are you located?',
    answer: '📍 **Our Address:**\n\nHouse #470, Avenue #6, Road #6\nMirpur DOHS, Dhaka\nBangladesh\n\nWe deliver nationwide! 🚚',
    category: 'general',
    priority: 7,
    keywords: ['location', 'address', 'where', 'showroom', 'physical store']
  },
  // Products
  {
    question: 'What products do you sell?',
    answer: '🎨 **We sell:**\n\n• Skincare – Face washes, serums, moisturizers, sunscreens\n• Makeup – Foundation, lipstick, mascara, eyeshadow, kajal\n• Fragrances – Perfumes, attars, body mists\n• Hair Care – Shampoos, conditioners, hair serums\n• Body Care – Lotions, scrubs, body washes\n\nBrowse our collection! 💄',
    category: 'products',
    priority: 8,
    keywords: ['products', 'sell', 'collection', 'categories', 'what do you have']
  },
  {
    question: 'Are your products authentic?',
    answer: '✅ **100% AUTHENTIC!**\n\n• Sourced directly from brands or authorized distributors\n• Every product verified for authenticity\n• No counterfeit products - EVER!\n• Trusted by thousands of customers\n\nYour beauty deserves the best! 🌸',
    category: 'products',
    priority: 10,
    keywords: ['authentic', 'original', 'real', 'fake', 'genuine', 'trust', 'quality']
  },
  // Policies
  {
    question: 'What is your return policy?',
    answer: '🔄 **RETURN POLICY:**\n\n• 30-day return window from delivery\n• Products must be unused in original packaging\n• Free returns for defective/wrong items\n• Contact support@beautybucket.com\n• Refunds in 5-7 business days\n\nYour satisfaction is our priority! 💕',
    category: 'policies',
    priority: 10,
    keywords: ['return', 'refund', 'exchange', 'return policy', 'replace', 'money back']
  },
  {
    question: 'Do you offer Cash on Delivery?',
    answer: '💵 **YES!** Cash on Delivery available!\n\n• Pay when you receive your order\n• Available all across Bangladesh\n• No additional COD charges\n• Also accept: bKash, Nagad, Rocket, Credit Cards\n\nShop with confidence! 🛍️',
    category: 'payment',
    priority: 10,
    keywords: ['cod', 'cash on delivery', 'pay on delivery', 'cash payment']
  },
  {
    question: 'What payment methods do you accept?',
    answer: '💳 **PAYMENT METHODS:**\n\n• Cash on Delivery (COD)\n• bKash – Mobile payment\n• Nagad – Mobile payment\n• Rocket – Mobile payment\n• Credit/Debit Cards\n\nAll transactions are secure! 🔒',
    category: 'payment',
    priority: 9,
    keywords: ['payment', 'pay', 'bkash', 'nagad', 'rocket', 'credit card', 'debit card']
  },
  {
    question: 'What is your shipping policy?',
    answer: '🚚 **SHIPPING:**\n\n• Dhaka: 2-5 business days\n• Other cities: 3-7 business days\n• Free shipping over 3000 BDT\n• Tracking number provided\n• COD available nationwide\n\nWe deliver beauty to your doorstep! 🌸',
    category: 'shipping',
    priority: 9,
    keywords: ['delivery', 'shipping', 'deliver', 'shipping cost', 'free shipping', 'delivery time']
  },
  // Orders
  {
    question: 'How do I track my order?',
    answer: '📦 **ORDER TRACKING:**\n\n1. Log in to your account\n2. Go to "My Orders"\n3. Click your order number\n4. Check status: Processing → Shipped → Delivered\n\nOr contact support@beautybucket.com! 💕',
    category: 'orders',
    priority: 9,
    keywords: ['track order', 'order status', 'where is my order', 'order update', 'tracking']
  },
  {
    question: 'How do I cancel my order?',
    answer: '❌ **ORDER CANCELLATION:**\n\n• Cancel within 2 hours of placing\n• Contact support immediately\n• After shipment, cancellation not possible\n• Refunds in 3-5 business days\n\nEmail support@beautybucket.com for help! 📧',
    category: 'orders',
    priority: 8,
    keywords: ['cancel order', 'cancel my order', 'change order', 'modify order']
  },
  {
    question: 'What if I receive a damaged product?',
    answer: '⚠️ **DAMAGED ITEM:**\n\n• Contact us immediately\n• Take photos of the damaged item\n• Email support@beautybucket.com with photos & order number\n• Free replacement or full refund\n• Response within 2 business hours\n\nWe\'ll make it right! 💕',
    category: 'orders',
    priority: 10,
    keywords: ['damaged', 'broken', 'cracked', 'leaked', 'defective', 'wrong product', 'missing']
  },
  // Contact
  {
    question: 'How can I contact customer support?',
    answer: '📞 **CONTACT US:**\n\n• Email: support@beautybucket.com\n• Phone: +880 1XXXXXXX\n• Hours: 10 AM - 10 PM (7 days)\n• Address: House #470, Avenue #6, Road #6, Mirpur DOHS, Dhaka\n• Social: @beautybucket.bd\n\nWe\'re here to help! 💖',
    category: 'general',
    priority: 8,
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'call', 'customer service']
  }
];

module.exports = defaultFAQs;