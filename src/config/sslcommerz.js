const crypto = require('crypto');

// SSL Commerz Configuration
const SSL_CONFIG = {
  store_id: process.env.SSL_STORE_ID,
  store_passwd: process.env.SSL_STORE_PASSWORD,
  is_live: false,  // Keep false for sandbox testing
  
  sandbox_url: 'https://sandbox.sslcommerz.com',
  live_url: 'https://secure.sslcommerz.com',
  
  get base_url() {
    return this.is_live ? this.live_url : this.sandbox_url;
  },
  
  endpoints: {
    make_payment: '/gwprocess/v4/api.php',
    validate_payment: '/validator/api/validationserverAPI.php'
  }
};

// Generate unique transaction ID
const generateTransactionId = (orderData) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  // Use order total to make it unique
  const amount = Math.floor(orderData.total || 0);
  return `TOY${timestamp}${random}${amount}`.substring(0, 30);
};

module.exports = {
  SSL_CONFIG,
  generateTransactionId
};