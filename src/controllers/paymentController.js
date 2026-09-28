const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { SSL_CONFIG, generateTransactionId } = require('../config/sslcommerz');

// @desc    Initiate SSL Commerz Payment
const initiatePayment = async (req, res) => {
  try {
    const { orderData, returnUrl, cancelUrl } = req.body;
    
    console.log('=== INITIATE PAYMENT ===');
    console.log('Order data received:', JSON.stringify(orderData, null, 2));
    
    if (!orderData) {
      return res.status(400).json({ success: false, error: 'Order data is required' });
    }
    
    // Check SSL credentials
    if (!SSL_CONFIG.store_id || !SSL_CONFIG.store_passwd) {
      console.error('SSL Commerz credentials missing!');
      return res.status(500).json({ 
        success: false, 
        error: 'Payment gateway configuration error. Please contact support.' 
      });
    }
    
    // Generate transaction ID
    const transactionId = generateTransactionId(orderData);
    
    console.log('Transaction ID:', transactionId);
    console.log('Store ID:', SSL_CONFIG.store_id);
    console.log('Base URL:', SSL_CONFIG.base_url);
    
    // Prepare payment data for SSL Commerz
    const paymentData = {
      store_id: SSL_CONFIG.store_id,
      store_passwd: SSL_CONFIG.store_passwd,
      total_amount: orderData.total || 0,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      fail_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      ipn_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/ipn`,
      
      // Customer Information
      cus_name: (orderData.customerInfo?.fullName || 'Valued Customer').substring(0, 50),
      cus_email: (orderData.customerInfo?.email || 'customer@example.com').substring(0, 50),
      cus_phone: (orderData.customerInfo?.phone || '01700000000').substring(0, 20),
      cus_add1: (orderData.customerInfo?.address || 'Dhaka').substring(0, 100),
      cus_city: (orderData.customerInfo?.city || 'Dhaka').substring(0, 50),
      cus_country: 'Bangladesh',
      
      // Shipping Information
      shipping_method: 'YES',
      ship_name: (orderData.customerInfo?.fullName || 'Valued Customer').substring(0, 50),
      ship_add1: (orderData.customerInfo?.address || 'Dhaka').substring(0, 100),
      ship_city: (orderData.customerInfo?.city || 'Dhaka').substring(0, 50),
      ship_postcode: (orderData.customerInfo?.zipCode || '1000').substring(0, 10),
      ship_country: 'Bangladesh',
      
      // Product Information
      product_name: orderData.items?.map(item => item.productName).slice(0, 3).join(', ').substring(0, 100) || 'Toys',
      product_category: 'Toys',
      product_profile: 'general',
      
      // Additional info
      value_a: orderData.userId || 'guest',
      value_b: orderData.sessionId || 'guest_session',
      value_c: orderData.paymentMethod || 'online'
    };
    
    console.log('Sending payment request to SSL Commerz...');
    
    const response = await axios.post(
      `${SSL_CONFIG.base_url}${SSL_CONFIG.endpoints.make_payment}`,
      new URLSearchParams(paymentData).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );
    
    console.log('SSL Commerz Response:', response.data);
    
    if (response.data.status === 'SUCCESS') {
      // Store pending order in memory with transaction ID
      global.pendingPayments = global.pendingPayments || {};
      global.pendingPayments[transactionId] = {
        orderData,
        transactionId,
        sessionKey: response.data.sessionkey,
        initiatedAt: new Date()
      };
      
      return res.json({
        success: true,
        gatewayUrl: response.data.GatewayPageURL,
        transactionId
      });
    } else {
      console.error('SSL Commerz error response:', response.data);
      return res.status(400).json({
        success: false,
        error: response.data.failedreason || 'Payment initiation failed',
        details: response.data
      });
    }
    
  } catch (error) {
    console.error('Initiate payment error:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Payment initiation failed',
      details: error.response?.data
    });
  }
};

// @desc    Prepare order data (called from checkout page for online payment)
const prepareOrderData = async (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('Preparing order data for online payment');
    
    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }
    
    if (!orderData.customerInfo || !orderData.customerInfo.fullName || !orderData.customerInfo.email) {
      return res.status(400).json({ success: false, error: 'Customer information is incomplete' });
    }
    
    // Just return the order data as is - it will be stored temporarily in the payment initiation
    res.json({
      success: true,
      data: orderData,
      message: 'Order data prepared successfully'
    });
    
  } catch (error) {
    console.error('Prepare order data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Handle SSL Commerz IPN (Instant Payment Notification)
const handleIPN = async (req, res) => {
  try {
    const ipnData = req.body;
    console.log('IPN Data received:', ipnData);
    
    const { tran_id, status, val_id, amount } = ipnData;
    
    // Retrieve pending order data
    const pendingPayment = global.pendingPayments?.[tran_id];
    
    if (!pendingPayment) {
      console.log('No pending payment found for transaction:', tran_id);
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    const orderData = pendingPayment.orderData;
    
    if (status === 'VALID' || status === 'VALIDATED') {
      // Now save the order to database
      const order = new Order({
        userId: orderData.userId || null,
        sessionId: orderData.sessionId || null,
        items: orderData.items,
        customerInfo: orderData.customerInfo,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        discount: orderData.discount || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod || 'online',
        paymentStatus: 'paid',
        orderStatus: 'placed',
        couponCode: orderData.couponCode || null,
        couponDiscount: orderData.couponDiscount || 0,
        freeShipping: orderData.freeShipping || false,
        transactionId: tran_id,
        paymentDetails: {
          val_id,
          amount,
          payment_date: new Date(),
          ipn_data: ipnData
        },
        orderDate: new Date()
      });
      
      await order.save();
      console.log(`Order saved successfully: ${order._id}`);
      
      // Update product stock quantities
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity, purchaseCount: item.quantity } }
        );
      }
      
      // Clear user's cart after successful order
      if (orderData.userId) {
        await Cart.findOneAndDelete({ userId: orderData.userId });
      } else if (orderData.sessionId) {
        await Cart.findOneAndDelete({ sessionId: orderData.sessionId });
      }
      
      // Clear pending payment
      delete global.pendingPayments[tran_id];
      
      console.log(`Payment successful for order ${order._id}`);
    } else if (status === 'FAILED') {
      console.log(`Payment failed for transaction: ${tran_id}`);
      delete global.pendingPayments[tran_id];
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('IPN handling error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Validate payment after return
const validatePayment = async (req, res) => {
  try {
    const { tran_id, val_id, status } = req.query;
    
    console.log('Validating payment - Transaction:', tran_id, 'Status:', status);
    
    if (status === 'cancel') {
      if (global.pendingPayments?.[tran_id]) {
        delete global.pendingPayments[tran_id];
      }
      return res.json({
        success: false,
        status: 'cancel',
        message: 'Payment was cancelled'
      });
    }
    
    const pendingPayment = global.pendingPayments?.[tran_id];
    
    if (!pendingPayment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found',
        status: 'not_found'
      });
    }
    
    const orderData = pendingPayment.orderData;
    
    // Validate with SSL Commerz
    const validateData = {
      val_id: val_id,
      store_id: SSL_CONFIG.store_id,
      store_passwd: SSL_CONFIG.store_passwd,
      format: 'json'
    };
    
    const response = await axios.get(
      `${SSL_CONFIG.base_url}${SSL_CONFIG.endpoints.validate_payment}`,
      { params: validateData, timeout: 30000 }
    );
    
    if (response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
      // Save order to database
      const order = new Order({
        userId: orderData.userId || null,
        sessionId: orderData.sessionId || null,
        items: orderData.items,
        customerInfo: orderData.customerInfo,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        discount: orderData.discount || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod || 'online',
        paymentStatus: 'paid',
        orderStatus: 'placed',
        couponCode: orderData.couponCode || null,
        couponDiscount: orderData.couponDiscount || 0,
        freeShipping: orderData.freeShipping || false,
        transactionId: tran_id,
        paymentDetails: {
          val_id,
          validated_at: new Date(),
          validation_response: response.data
        },
        orderDate: new Date()
      });
      
      await order.save();
      console.log(`Order saved after validation: ${order._id}`);
      
      // Update product stock
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity, purchaseCount: item.quantity } }
        );
      }
      
      // Clear cart
      if (orderData.userId) {
        await Cart.findOneAndDelete({ userId: orderData.userId });
      } else if (orderData.sessionId) {
        await Cart.findOneAndDelete({ sessionId: orderData.sessionId });
      }
      
      // Clear pending payment
      delete global.pendingPayments[tran_id];
      
      return res.json({
        success: true,
        status: 'success',
        orderId: order._id,
        message: 'Payment verified successfully'
      });
    } else {
      delete global.pendingPayments[tran_id];
      
      return res.json({
        success: false,
        status: 'failed',
        message: 'Payment validation failed'
      });
    }
    
  } catch (error) {
    console.error('Validate payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        transactionId: order.transactionId,
        amount: order.total
      }
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  initiatePayment,
  prepareOrderData,
  handleIPN,
  validatePayment,
  getPaymentStatus
};