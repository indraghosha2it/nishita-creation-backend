class CourierAdapter {
  constructor(slug, creds, storeConfig) {
    this.slug = slug;
    this.creds = creds;
    this.storeConfig = storeConfig;
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  async createOrder(orderData) {
    throw new Error('createOrder must be implemented by subclass');
  }

  async getTracking(trackingNumber) {
    throw new Error('getTracking must be implemented by subclass');
  }

  async cancelOrder(courierOrderId) {
    throw new Error('cancelOrder must be implemented by subclass');
  }

  formatOrderData(order) {
    return {
      recipient_name: order.customerInfo.fullName,
      recipient_phone: order.customerInfo.phone,
      recipient_address: order.customerInfo.address,
      city: order.customerInfo.city,
      zone: order.customerInfo.zone,
      area: order.customerInfo.area,
      total_amount: order.total,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.discountPrice || item.regularPrice
      }))
    };
  }
}

module.exports = CourierAdapter;