
//before discount added


// const Order = require('../models/Order');
// const Product = require('../models/Product');

// // ============================================================
// // HELPER: Get variant/sub-variant cost from product
// // ============================================================
// const getVariantCostFromProduct = (product, variantId, subVariantId) => {
//   if (!product || !product.variantTypes || !variantId) return 0;

//   for (const vt of product.variantTypes) {
//     for (const v of (vt.variants || [])) {
//       if (v.id === variantId) {
//         if (subVariantId && v.subVariants) {
//           const sv = v.subVariants.find(s => s.id === subVariantId);
//           if (sv) {
//             return Number(sv.costPerItem) || 0;
//           }
//         }
//         return Number(v.costPerItem) || 0;
//       }
//     }
//   }
//   return 0;
// };

// // ============================================================
// // HELPER: Get selling price for a plain (non-variant) item
// // ============================================================
// const getPlainItemSellingPrice = (item) => {
//   if (item.discountPrice > 0) return Number(item.discountPrice);
//   return Number(item.regularPrice) || 0;
// };

// // ============================================================
// // HELPER: Build delivered-quantity map from order.deliveryItems
// //
// // Returns:
// //   - null → no deliveryItems on this order; caller should fall
// //            back to raw item.quantity fields (legacy behavior)
// //   - Map<string, number> → key = productId | variantId | subVariantId
// //     value = SUM of deliveredQuantity across matching delivery items
// //
// // Key shapes:
// //   - Sub-variant:  `${productId}|${variantId}|${subVariantId}`
// //   - Variant:      `${productId}|${variantId}`
// //   - Color:        `${productId}|color:${color}`
// //   - Plain:        `${productId}|plain`
// // ============================================================
// const buildDeliveredQuantityMap = (order) => {
//   if (!order.deliveryItems || order.deliveryItems.length === 0) {
//     return null;
//   }

//   const map = new Map();

//   order.deliveryItems.forEach((di) => {
//     const deliveredQty = Number(di.deliveredQuantity) || 0;
//     if (deliveredQty <= 0) return;

//     const productId = di.productId?.toString() || '';
//     const variantId = di.variantId || null;
//     const subVariantId = di.subVariantId || null;
//     const selectedColor = di.selectedColor || null;

//     let key;
//     if (subVariantId) {
//       key = `${productId}|${variantId}|${subVariantId}`;
//     } else if (variantId) {
//       key = `${productId}|${variantId}`;
//     } else if (selectedColor) {
//       key = `${productId}|color:${selectedColor}`;
//     } else {
//       key = `${productId}|plain`;
//     }

//     map.set(key, (map.get(key) || 0) + deliveredQty);
//   });

//   return map;
// };

// // ============================================================
// // HELPER: Process one order item into revenue/cost/profit.
// //
// // Accepts an optional `deliveredQtyMap`:
// //   - When provided → only delivered quantities are counted
// //     (used for partial_delivery orders)
// //   - When null     → falls back to item's own quantity fields
// //     (used for fully delivered legacy orders)
// // Returns { itemRevenue, itemCost, itemProfit, itemQuantity }
// // ============================================================
// const processOrderItem = (item, productDoc, product, productImage, deliveredQtyMap = null) => {
//   let itemRevenue = 0;
//   let itemCost = 0;
//   let itemProfit = 0;
//   let itemQuantity = 0;

//   const productIdStr = (productDoc?._id || item.productId)?.toString() || '';

//   const variantDetails = item.variantDetails || [];
//   const hasVariantDetails = variantDetails.length > 0;

//   if (hasVariantDetails) {
//     product.hasVariants = true;

//     variantDetails.forEach(vd => {
//       const variantId = vd.variantId;
//       const subVariants = vd.subVariants || [];
//       const hasSubVariants = subVariants.length > 0;

//       if (hasSubVariants) {
//         product.hasSubVariants = true;

//         subVariants.forEach(sv => {
//           // ✅ Resolve quantity: delivered-map or raw
//           let qty;
//           if (deliveredQtyMap) {
//             const key = `${productIdStr}|${variantId}|${sv.subVariantId}`;
//             qty = deliveredQtyMap.get(key) || 0;
//           } else {
//             qty = Number(sv.quantity) || 0;
//           }
//           if (qty <= 0) return;

//           const sellingPrice = Number(sv.subVariantDiscountPrice) > 0
//             ? Number(sv.subVariantDiscountPrice)
//             : (Number(sv.subVariantRegularPrice) || 0);

//           let costPerItem = getVariantCostFromProduct(productDoc, variantId, sv.subVariantId);
//           if (costPerItem === 0) {
//             costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice || 0);
//           }

//           const revenue = sellingPrice * qty;
//           const cost = costPerItem * qty;
//           const profit = revenue - cost;

//           itemRevenue += revenue;
//           itemCost += cost;
//           itemProfit += profit;
//           itemQuantity += qty;

//           const key = `${variantId}_${sv.subVariantId}`;
//           if (!product.variantBreakdownMap[key]) {
//             product.variantBreakdownMap[key] = {
//               variantId,
//               variantName: vd.variantName || 'Variant',
//               subVariantId: sv.subVariantId,
//               subVariantName: sv.subVariantName || 'Sub-Variant',
//               image: sv.image || vd.image || productImage,
//               isVariantRow: false,
//               isSubVariantRow: true,
//               quantity: 0,
//               revenue: 0,
//               cost: 0,
//               profit: 0
//             };
//           }
//           const vb = product.variantBreakdownMap[key];
//           vb.quantity += qty;
//           vb.revenue += revenue;
//           vb.cost += cost;
//           vb.profit += profit;
//         });
//       } else {
//         // ✅ Resolve quantity: delivered-map or raw
//         let qty;
//         if (deliveredQtyMap) {
//           const key = `${productIdStr}|${variantId}`;
//           qty = deliveredQtyMap.get(key) || 0;
//         } else {
//           qty = Number(vd.quantity) || 0;
//         }
//         if (qty <= 0) return;

//         const sellingPrice = Number(vd.variantDiscountPrice) > 0
//           ? Number(vd.variantDiscountPrice)
//           : (Number(vd.variantRegularPrice) || 0);

//         let costPerItem = getVariantCostFromProduct(productDoc, variantId, null);
//         if (costPerItem === 0) {
//           costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice || 0);
//         }

//         const revenue = sellingPrice * qty;
//         const cost = costPerItem * qty;
//         const profit = revenue - cost;

//         itemRevenue += revenue;
//         itemCost += cost;
//         itemProfit += profit;
//         itemQuantity += qty;

//         const key = variantId;
//         if (!product.variantBreakdownMap[key]) {
//           product.variantBreakdownMap[key] = {
//             variantId,
//             variantName: vd.variantName || 'Variant',
//             subVariantId: null,
//             subVariantName: null,
//             image: vd.image || productImage,
//             isVariantRow: true,
//             isSubVariantRow: false,
//             quantity: 0,
//             revenue: 0,
//             cost: 0,
//             profit: 0
//           };
//         }
//         const vb = product.variantBreakdownMap[key];
//         vb.quantity += qty;
//         vb.revenue += revenue;
//         vb.cost += cost;
//         vb.profit += profit;
//       }
//     });
//   } else {
//     // ============================================================
//     // Plain product line (no variants) — colors or simple quantity.
//     // ============================================================
//     const selectedColor = item.selectedColor || null;

//     // ✅ Resolve quantity: delivered-map or raw
//     let qty;
//     if (deliveredQtyMap) {
//       let key;
//       if (selectedColor) {
//         key = `${productIdStr}|color:${selectedColor}`;
//       } else {
//         key = `${productIdStr}|plain`;
//       }
//       qty = deliveredQtyMap.get(key) || 0;
//     } else {
//       qty = Number(item.quantity) || 0;
//     }

//     if (qty <= 0) {
//       return { itemRevenue: 0, itemCost: 0, itemProfit: 0, itemQuantity: 0 };
//     }

//     const sellingPrice = getPlainItemSellingPrice(item);
//     const costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice) || item.costPerItem || item.buyingPrice || 0;

//     itemRevenue = sellingPrice * qty;
//     itemCost = costPerItem * qty;
//     itemProfit = itemRevenue - itemCost;
//     itemQuantity = qty;
//   }

//   return { itemRevenue, itemCost, itemProfit, itemQuantity };
// };

// // ============================================================
// // GET PROFIT MARGIN DATA
// // @route   GET /api/orders/admin/profit-margin
// // @access  Private (Admin/Moderator/Super Admin)
// // ============================================================
// const getProfitMarginData = async (req, res) => {
//   try {
//     const { period = 'month', startDate, endDate, limit = 100 } = req.query;
//     const userRole = req.user?.role || 'admin';

//     // ============================================
//     // Build date filter
//     // ============================================
//     let dateFilter = {};
//     const now = new Date();

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);
//       dateFilter = { createdAt: { $gte: start, $lte: end } };
//     } else {
//       switch (period) {
//         case 'today': {
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           const todayEnd = new Date(today);
//           todayEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: today, $lte: todayEnd } };
//           break;
//         }
//         case 'week': {
//           const weekStart = new Date(now);
//           weekStart.setDate(now.getDate() - 7);
//           weekStart.setHours(0, 0, 0, 0);
//           const weekEnd = new Date(now);
//           weekEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: weekStart, $lte: weekEnd } };
//           break;
//         }
//         case 'month': {
//           const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//           monthStart.setHours(0, 0, 0, 0);
//           const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//           monthEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: monthStart, $lte: monthEnd } };
//           break;
//         }
//         case 'year': {
//           const yearStart = new Date(now.getFullYear(), 0, 1);
//           yearStart.setHours(0, 0, 0, 0);
//           const yearEnd = new Date(now.getFullYear(), 11, 31);
//           yearEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: yearStart, $lte: yearEnd } };
//           break;
//         }
//         case 'all':
//         default:
//           dateFilter = {};
//       }
//     }

//     // ✅ Include partial_delivery orders; only count delivered units inside them
//     const query = {
//       orderStatus: { $in: ['delivered', 'partial_delivery'] },
//       paymentStatus: { $in: ['paid', 'partial'] },
//       ...dateFilter
//     };

//     if (!['super_admin', 'admin', 'moderator'].includes(userRole)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Unauthorized to view profit margin data'
//       });
//     }

//     // ============================================
//     // Fetch orders with populated product variant data
//     // ============================================
//     const orders = await Order.find(query)
//       .populate('items.productId', 'costPerItem buyingPrice productName variantTypes hasVariants')
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));

//     if (!orders || orders.length === 0) {
//       return res.json({
//         success: true,
//         data: {
//           summary: {
//             totalOrders: 0,
//             totalRevenue: 0,
//             totalCost: 0,
//             totalProfit: 0,
//             averageProfitMargin: 0
//           },
//           productProfitDetails: [],
//           periodSummary: [],
//           orders: []
//         }
//       });
//     }

//     // ============================================
//     // AGGREGATE
//     // ============================================
//     let totalRevenue = 0;
//     let totalCost = 0;
//     let totalProfit = 0;

//     const productProfitMap = {};
//     const periodMap = {};

//     const processedOrders = orders.map(order => {
//       let orderRevenue = 0;
//       let orderCost = 0;
//       let orderProfit = 0;
//       let orderQuantity = 0;

//       // ✅ Build delivered-quantity map once per order.
//       //   For fully delivered orders this returns all quantities.
//       //   For partial_delivery orders this returns only delivered units.
//       //   For legacy orders with no deliveryItems, this returns null and
//       //   the processOrderItem helper falls back to raw item.quantity.
//       const deliveredQtyMap = buildDeliveredQuantityMap(order);

//       const orderItems = order.items.map(item => {
//         const productDoc = item.productId && typeof item.productId === 'object' ? item.productId : null;

//         const productId = productDoc?._id?.toString() || item.productId?.toString() || 'unknown';
//         const productName = item.productName || 'Unknown Product';
//         const productImage = item.image || '';

//         if (!productProfitMap[productId]) {
//           productProfitMap[productId] = {
//             productId,
//             productName,
//             image: productImage,
//             totalQuantity: 0,
//             totalRevenue: 0,
//             totalCost: 0,
//             totalProfit: 0,
//             averageSellingPrice: 0,
//             averageBuyingPrice: 0,
//             hasVariants: false,
//             hasSubVariants: false,
//             variantBreakdownMap: {}
//           };
//         }

//         const product = productProfitMap[productId];

//         const { itemRevenue, itemCost, itemProfit, itemQuantity } =
//           processOrderItem(item, productDoc, product, productImage, deliveredQtyMap);

//         product.totalQuantity += itemQuantity;
//         product.totalRevenue += itemRevenue;
//         product.totalCost += itemCost;
//         product.totalProfit += itemProfit;

//         orderRevenue += itemRevenue;
//         orderCost += itemCost;
//         orderProfit += itemProfit;
//         orderQuantity += itemQuantity;

//         const itemProfitMargin = itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0;

//         return {
//           ...item.toObject(),
//           revenue: parseFloat(itemRevenue.toFixed(2)),
//           cost: parseFloat(itemCost.toFixed(2)),
//           profit: parseFloat(itemProfit.toFixed(2)),
//           profitMargin: parseFloat(itemProfitMargin.toFixed(2))
//         };
//       });

//       totalRevenue += orderRevenue;
//       totalCost += orderCost;
//       totalProfit += orderProfit;

//       // Period summary
//       const dateKey = order.createdAt.toISOString().split('T')[0];
//       if (!periodMap[dateKey]) {
//         periodMap[dateKey] = {
//           date: dateKey,
//           orders: 0,
//           itemsSold: 0,
//           revenue: 0,
//           cost: 0,
//           profit: 0,
//           profitMargin: 0
//         };
//       }
//       periodMap[dateKey].orders += 1;
//       periodMap[dateKey].itemsSold += orderQuantity;
//       periodMap[dateKey].revenue += orderRevenue;
//       periodMap[dateKey].cost += orderCost;
//       periodMap[dateKey].profit += orderProfit;

//       return {
//         ...order.toObject(),
//         orderRevenue: parseFloat(orderRevenue.toFixed(2)),
//         orderCost: parseFloat(orderCost.toFixed(2)),
//         orderProfit: parseFloat(orderProfit.toFixed(2)),
//         orderProfitMargin: orderRevenue > 0 ? parseFloat(((orderProfit / orderRevenue) * 100).toFixed(2)) : 0,
//         items: orderItems
//       };
//     });

//     // ============================================
//     // Build product profit details
//     // ============================================
//     const productProfitDetails = Object.values(productProfitMap).map(p => {
//       const profitMargin = p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0;
//       const averageSellingPrice = p.totalQuantity > 0 ? p.totalRevenue / p.totalQuantity : 0;
//       const averageBuyingPrice = p.totalQuantity > 0 ? p.totalCost / p.totalQuantity : 0;

//       const variantBreakdown = Object.values(p.variantBreakdownMap || {}).map(vb => ({
//         variantId: vb.variantId,
//         variantName: vb.variantName,
//         subVariantId: vb.subVariantId,
//         subVariantName: vb.subVariantName,
//         image: vb.image,
//         isVariantRow: vb.isVariantRow,
//         isSubVariantRow: vb.isSubVariantRow,
//         quantity: vb.quantity,
//         revenue: parseFloat(vb.revenue.toFixed(2)),
//         cost: parseFloat(vb.cost.toFixed(2)),
//         profit: parseFloat(vb.profit.toFixed(2)),
//         profitMargin: vb.revenue > 0
//           ? parseFloat(((vb.profit / vb.revenue) * 100).toFixed(2))
//           : 0
//       }));

//       // Sort: group variants together, variant row before its sub-variants
//       variantBreakdown.sort((a, b) => {
//         if (a.variantId !== b.variantId) return String(a.variantId).localeCompare(String(b.variantId));
//         if (a.isVariantRow && !b.isVariantRow) return -1;
//         if (!a.isVariantRow && b.isVariantRow) return 1;
//         return 0;
//       });

//       const { variantBreakdownMap, ...rest } = p;

//       return {
//         ...rest,
//         variantBreakdown,
//         profitMargin: profitMargin.toFixed(2),
//         totalRevenue: parseFloat(p.totalRevenue.toFixed(2)),
//         totalCost: parseFloat(p.totalCost.toFixed(2)),
//         totalProfit: parseFloat(p.totalProfit.toFixed(2)),
//         averageSellingPrice: parseFloat(averageSellingPrice.toFixed(2)),
//         averageBuyingPrice: parseFloat(averageBuyingPrice.toFixed(2))
//       };
//     });

//     const periodSummary = Object.values(periodMap).map(p => {
//       const profitMargin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
//       return {
//         date: p.date,
//         orders: p.orders,
//         itemsSold: p.itemsSold,
//         revenue: parseFloat(p.revenue.toFixed(2)),
//         cost: parseFloat(p.cost.toFixed(2)),
//         profit: parseFloat(p.profit.toFixed(2)),
//         profitMargin: parseFloat(profitMargin.toFixed(2))
//       };
//     }).sort((a, b) => a.date.localeCompare(b.date));

//     const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

//     res.json({
//       success: true,
//       data: {
//         summary: {
//           totalOrders: orders.length,
//           totalRevenue: parseFloat(totalRevenue.toFixed(2)),
//           totalCost: parseFloat(totalCost.toFixed(2)),
//           totalProfit: parseFloat(totalProfit.toFixed(2)),
//           averageProfitMargin: parseFloat(averageProfitMargin.toFixed(2))
//         },
//         productProfitDetails: productProfitDetails.sort((a, b) => b.totalProfit - a.totalProfit),
//         periodSummary,
//         orders: processedOrders
//       }
//     });

//   } catch (error) {
//     console.error('Get profit margin error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to calculate profit margin'
//     });
//   }
// };

// // ============================================================
// // GET PRODUCT PROFIT MARGIN
// // @route   GET /api/orders/admin/product-profit/:productId
// // @access  Private (Admin/Moderator/Super Admin)
// // ============================================================
// const getProductProfitMargin = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { period = 'month', startDate, endDate } = req.query;

//     const userRole = req.user?.role || 'admin';

//     if (!['super_admin', 'admin', 'moderator'].includes(userRole)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Unauthorized to view profit margin data'
//       });
//     }

//     // Date filter
//     let dateFilter = {};
//     const now = new Date();

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);
//       dateFilter = { createdAt: { $gte: start, $lte: end } };
//     } else {
//       switch (period) {
//         case 'today': {
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           const todayEnd = new Date(today);
//           todayEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: today, $lte: todayEnd } };
//           break;
//         }
//         case 'week': {
//           const weekStart = new Date(now);
//           weekStart.setDate(now.getDate() - 7);
//           weekStart.setHours(0, 0, 0, 0);
//           const weekEnd = new Date(now);
//           weekEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: weekStart, $lte: weekEnd } };
//           break;
//         }
//         case 'month': {
//           const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//           monthStart.setHours(0, 0, 0, 0);
//           const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//           monthEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: monthStart, $lte: monthEnd } };
//           break;
//         }
//         case 'year': {
//           const yearStart = new Date(now.getFullYear(), 0, 1);
//           yearStart.setHours(0, 0, 0, 0);
//           const yearEnd = new Date(now.getFullYear(), 11, 31);
//           yearEnd.setHours(23, 59, 59, 999);
//           dateFilter = { createdAt: { $gte: yearStart, $lte: yearEnd } };
//           break;
//         }
//         default:
//           dateFilter = {};
//       }
//     }

//     // ✅ Include partial_delivery orders
//     const query = {
//       orderStatus: { $in: ['delivered', 'partial_delivery'] },
//       paymentStatus: { $in: ['paid', 'partial'] },
//       'items.productId': productId,
//       ...dateFilter
//     };

//     const orders = await Order.find(query)
//       .populate('items.productId', 'costPerItem buyingPrice productName variantTypes');

//     if (!orders || orders.length === 0) {
//       return res.json({
//         success: true,
//         data: {
//           productId,
//           totalOrders: 0,
//           totalQuantity: 0,
//           totalRevenue: 0,
//           totalCost: 0,
//           totalProfit: 0,
//           profitMargin: 0,
//           hasVariants: false,
//           hasSubVariants: false,
//           variantBreakdown: [],
//           orders: []
//         }
//       });
//     }

//     let totalQuantity = 0;
//     let totalRevenue = 0;
//     let totalCost = 0;
//     let totalProfit = 0;
//     let hasVariants = false;
//     let hasSubVariants = false;

//     const variantBreakdownMap = {};

//     const orderDetails = orders.map(order => {
//       let orderQuantity = 0;
//       let orderRevenue = 0;
//       let orderCost = 0;
//       let orderProfit = 0;

//       // ✅ Build delivered-quantity map once per order
//       const deliveredQtyMap = buildDeliveredQuantityMap(order);

//       order.items.forEach(item => {
//         const itemProductId = item.productId?._id?.toString() || item.productId?.toString();
//         if (itemProductId !== productId) return;

//         const productDoc = item.productId && typeof item.productId === 'object' ? item.productId : null;
//         const productImage = item.image || '';

//         // Reuse the same nested-aware calculation, but write breakdown
//         // straight into variantBreakdownMap (product-scoped, not multi-product)
//         const pseudoProduct = { hasVariants: false, hasSubVariants: false, variantBreakdownMap };
//         const { itemRevenue, itemCost, itemProfit, itemQuantity } =
//           processOrderItem(item, productDoc, pseudoProduct, productImage, deliveredQtyMap);

//         if (pseudoProduct.hasVariants) hasVariants = true;
//         if (pseudoProduct.hasSubVariants) hasSubVariants = true;

//         orderQuantity += itemQuantity;
//         orderRevenue += itemRevenue;
//         orderCost += itemCost;
//         orderProfit += itemProfit;
//       });

//       totalQuantity += orderQuantity;
//       totalRevenue += orderRevenue;
//       totalCost += orderCost;
//       totalProfit += orderProfit;

//       return {
//         orderId: order._id,
//         orderNumber: order.orderNumber,
//         date: order.createdAt,
//         quantity: orderQuantity,
//         revenue: parseFloat(orderRevenue.toFixed(2)),
//         cost: parseFloat(orderCost.toFixed(2)),
//         profit: parseFloat(orderProfit.toFixed(2)),
//         profitMargin: orderRevenue > 0 ? parseFloat(((orderProfit / orderRevenue) * 100).toFixed(2)) : 0
//       };
//     });

//     const variantBreakdown = Object.values(variantBreakdownMap).map(vb => ({
//       variantId: vb.variantId,
//       variantName: vb.variantName,
//       subVariantId: vb.subVariantId,
//       subVariantName: vb.subVariantName,
//       image: vb.image,
//       isVariantRow: vb.isVariantRow,
//       isSubVariantRow: vb.isSubVariantRow,
//       quantity: vb.quantity,
//       revenue: parseFloat(vb.revenue.toFixed(2)),
//       cost: parseFloat(vb.cost.toFixed(2)),
//       profit: parseFloat(vb.profit.toFixed(2)),
//       profitMargin: vb.revenue > 0 ? parseFloat(((vb.profit / vb.revenue) * 100).toFixed(2)) : 0
//     })).sort((a, b) => {
//       if (a.variantId !== b.variantId) return String(a.variantId).localeCompare(String(b.variantId));
//       if (a.isVariantRow && !b.isVariantRow) return -1;
//       if (!a.isVariantRow && b.isVariantRow) return 1;
//       return 0;
//     });

//     const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

//     res.json({
//       success: true,
//       data: {
//         productId,
//         totalOrders: orders.length,
//         totalQuantity,
//         totalRevenue: parseFloat(totalRevenue.toFixed(2)),
//         totalCost: parseFloat(totalCost.toFixed(2)),
//         totalProfit: parseFloat(totalProfit.toFixed(2)),
//         profitMargin: parseFloat(profitMargin.toFixed(2)),
//         hasVariants,
//         hasSubVariants,
//         variantBreakdown,
//         orders: orderDetails
//       }
//     });

//   } catch (error) {
//     console.error('Get product profit margin error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to get product profit margin'
//     });
//   }
// };

// module.exports = {
//   getProfitMarginData,
//   getProductProfitMargin
// };


const Order = require('../models/Order');
const Product = require('../models/Product');

// ============================================================
// HELPER: Get variant/sub-variant cost from product
// ============================================================
const getVariantCostFromProduct = (product, variantId, subVariantId) => {
  if (!product || !product.variantTypes || !variantId) return 0;

  for (const vt of product.variantTypes) {
    for (const v of (vt.variants || [])) {
      if (v.id === variantId) {
        if (subVariantId && v.subVariants) {
          const sv = v.subVariants.find(s => s.id === subVariantId);
          if (sv) {
            return Number(sv.costPerItem) || 0;
          }
        }
        return Number(v.costPerItem) || 0;
      }
    }
  }
  return 0;
};

// ============================================================
// HELPER: Get selling price for a plain (non-variant) item
// ============================================================
const getPlainItemSellingPrice = (item) => {
  if (item.discountPrice > 0) return Number(item.discountPrice);
  return Number(item.regularPrice) || 0;
};

// ============================================================
// HELPER: Build delivered-quantity map from order.deliveryItems
//
// Returns:
//   - null → no deliveryItems on this order; caller should fall
//            back to raw item.quantity fields (legacy behavior)
//   - Map<string, number> → key = productId | variantId | subVariantId
//     value = SUM of deliveredQuantity across matching delivery items
//
// Key shapes:
//   - Sub-variant:  `${productId}|${variantId}|${subVariantId}`
//   - Variant:      `${productId}|${variantId}`
//   - Color:        `${productId}|color:${color}`
//   - Plain:        `${productId}|plain`
// ============================================================
const buildDeliveredQuantityMap = (order) => {
  if (!order.deliveryItems || order.deliveryItems.length === 0) {
    return null;
  }

  const map = new Map();

  order.deliveryItems.forEach((di) => {
    const deliveredQty = Number(di.deliveredQuantity) || 0;
    if (deliveredQty <= 0) return;

    const productId = di.productId?.toString() || '';
    const variantId = di.variantId || null;
    const subVariantId = di.subVariantId || null;
    const selectedColor = di.selectedColor || null;

    let key;
    if (subVariantId) {
      key = `${productId}|${variantId}|${subVariantId}`;
    } else if (variantId) {
      key = `${productId}|${variantId}`;
    } else if (selectedColor) {
      key = `${productId}|color:${selectedColor}`;
    } else {
      key = `${productId}|plain`;
    }

    map.set(key, (map.get(key) || 0) + deliveredQty);
  });

  return map;
};

// ============================================================
// HELPER: Process one order item into revenue/cost/profit.
//
// Accepts an optional `deliveredQtyMap`:
//   - When provided → only delivered quantities are counted
//     (used for partial_delivery orders)
//   - When null     → falls back to item's own quantity fields
//     (used for fully delivered legacy orders)
// Returns { itemRevenue, itemCost, itemProfit, itemQuantity }
// ============================================================
const processOrderItem = (item, productDoc, product, productImage, deliveredQtyMap = null) => {
  let itemRevenue = 0;
  let itemCost = 0;
  let itemProfit = 0;
  let itemQuantity = 0;

  const productIdStr = (productDoc?._id || item.productId)?.toString() || '';

  const variantDetails = item.variantDetails || [];
  const hasVariantDetails = variantDetails.length > 0;

  if (hasVariantDetails) {
    product.hasVariants = true;

    variantDetails.forEach(vd => {
      const variantId = vd.variantId;
      const subVariants = vd.subVariants || [];
      const hasSubVariants = subVariants.length > 0;

      if (hasSubVariants) {
        product.hasSubVariants = true;

        subVariants.forEach(sv => {
          // ✅ Resolve quantity: delivered-map or raw
          let qty;
          if (deliveredQtyMap) {
            const key = `${productIdStr}|${variantId}|${sv.subVariantId}`;
            qty = deliveredQtyMap.get(key) || 0;
          } else {
            qty = Number(sv.quantity) || 0;
          }
          if (qty <= 0) return;

          const sellingPrice = Number(sv.subVariantDiscountPrice) > 0
            ? Number(sv.subVariantDiscountPrice)
            : (Number(sv.subVariantRegularPrice) || 0);

          let costPerItem = getVariantCostFromProduct(productDoc, variantId, sv.subVariantId);
          if (costPerItem === 0) {
            costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice || 0);
          }

          const revenue = sellingPrice * qty;
          const cost = costPerItem * qty;
          const profit = revenue - cost;

          itemRevenue += revenue;
          itemCost += cost;
          itemProfit += profit;
          itemQuantity += qty;

          const key = `${variantId}_${sv.subVariantId}`;
          if (!product.variantBreakdownMap[key]) {
            product.variantBreakdownMap[key] = {
              variantId,
              variantName: vd.variantName || 'Variant',
              subVariantId: sv.subVariantId,
              subVariantName: sv.subVariantName || 'Sub-Variant',
              image: sv.image || vd.image || productImage,
              isVariantRow: false,
              isSubVariantRow: true,
              quantity: 0,
              revenue: 0,
              cost: 0,
              profit: 0
            };
          }
          const vb = product.variantBreakdownMap[key];
          vb.quantity += qty;
          vb.revenue += revenue;
          vb.cost += cost;
          vb.profit += profit;
        });
      } else {
        // ✅ Resolve quantity: delivered-map or raw
        let qty;
        if (deliveredQtyMap) {
          const key = `${productIdStr}|${variantId}`;
          qty = deliveredQtyMap.get(key) || 0;
        } else {
          qty = Number(vd.quantity) || 0;
        }
        if (qty <= 0) return;

        const sellingPrice = Number(vd.variantDiscountPrice) > 0
          ? Number(vd.variantDiscountPrice)
          : (Number(vd.variantRegularPrice) || 0);

        let costPerItem = getVariantCostFromProduct(productDoc, variantId, null);
        if (costPerItem === 0) {
          costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice || 0);
        }

        const revenue = sellingPrice * qty;
        const cost = costPerItem * qty;
        const profit = revenue - cost;

        itemRevenue += revenue;
        itemCost += cost;
        itemProfit += profit;
        itemQuantity += qty;

        const key = variantId;
        if (!product.variantBreakdownMap[key]) {
          product.variantBreakdownMap[key] = {
            variantId,
            variantName: vd.variantName || 'Variant',
            subVariantId: null,
            subVariantName: null,
            image: vd.image || productImage,
            isVariantRow: true,
            isSubVariantRow: false,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }
        const vb = product.variantBreakdownMap[key];
        vb.quantity += qty;
        vb.revenue += revenue;
        vb.cost += cost;
        vb.profit += profit;
      }
    });
  } else {
    // ============================================================
    // Plain product line (no variants) — colors or simple quantity.
    // ============================================================
    const selectedColor = item.selectedColor || null;

    // ✅ Resolve quantity: delivered-map or raw
    let qty;
    if (deliveredQtyMap) {
      let key;
      if (selectedColor) {
        key = `${productIdStr}|color:${selectedColor}`;
      } else {
        key = `${productIdStr}|plain`;
      }
      qty = deliveredQtyMap.get(key) || 0;
    } else {
      qty = Number(item.quantity) || 0;
    }

    if (qty <= 0) {
      return { itemRevenue: 0, itemCost: 0, itemProfit: 0, itemQuantity: 0 };
    }

    const sellingPrice = getPlainItemSellingPrice(item);
    const costPerItem = (productDoc?.costPerItem || productDoc?.buyingPrice) || item.costPerItem || item.buyingPrice || 0;

    itemRevenue = sellingPrice * qty;
    itemCost = costPerItem * qty;
    itemProfit = itemRevenue - itemCost;
    itemQuantity = qty;
  }

  return { itemRevenue, itemCost, itemProfit, itemQuantity };
};

// ============================================================
// GET PROFIT MARGIN DATA
// @route   GET /api/orders/admin/profit-margin
// @access  Private (Admin/Moderator/Super Admin)
// ============================================================
const getProfitMarginData = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate, limit = 100 } = req.query;
    const userRole = req.user?.role || 'admin';

    // ============================================
    // Build date filter
    // ============================================
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    } else {
      switch (period) {
        case 'today': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: today, $lte: todayEnd } };
          break;
        }
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(now);
          weekEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: weekStart, $lte: weekEnd } };
          break;
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: monthStart, $lte: monthEnd } };
          break;
        }
        case 'year': {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          yearStart.setHours(0, 0, 0, 0);
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          yearEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: yearStart, $lte: yearEnd } };
          break;
        }
        case 'all':
        default:
          dateFilter = {};
      }
    }

    // ✅ Include partial_delivery orders; only count delivered units inside them
    const query = {
      orderStatus: { $in: ['delivered', 'partial_delivery'] },
      paymentStatus: { $in: ['paid', 'partial'] },
      ...dateFilter
    };

    if (!['super_admin', 'admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view profit margin data'
      });
    }

    // ============================================
    // Fetch orders with populated product variant data
    // ============================================
    const orders = await Order.find(query)
      .populate('items.productId', 'costPerItem buyingPrice productName variantTypes hasVariants')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            averageProfitMargin: 0,
            // ✅ NEW fields
            totalDiscount: 0,
            netProfitAfterDiscount: 0,
            averageNetProfitMargin: 0
          },
          productProfitDetails: [],
          periodSummary: [],
          orders: []
        }
      });
    }

    // ============================================
    // AGGREGATE
    // ============================================
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalDiscount = 0;   // ✅ NEW: sum of order.discount across matched orders

    const productProfitMap = {};
    const periodMap = {};

    const processedOrders = orders.map(order => {
      let orderRevenue = 0;
      let orderCost = 0;
      let orderProfit = 0;
      let orderQuantity = 0;

      // ✅ Build delivered-quantity map once per order.
      //   For fully delivered orders this returns all quantities.
      //   For partial_delivery orders this returns only delivered units.
      //   For legacy orders with no deliveryItems, this returns null and
      //   the processOrderItem helper falls back to raw item.quantity.
      const deliveredQtyMap = buildDeliveredQuantityMap(order);

      const orderItems = order.items.map(item => {
        const productDoc = item.productId && typeof item.productId === 'object' ? item.productId : null;

        const productId = productDoc?._id?.toString() || item.productId?.toString() || 'unknown';
        const productName = item.productName || 'Unknown Product';
        const productImage = item.image || '';

        if (!productProfitMap[productId]) {
          productProfitMap[productId] = {
            productId,
            productName,
            image: productImage,
            totalQuantity: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            averageSellingPrice: 0,
            averageBuyingPrice: 0,
            hasVariants: false,
            hasSubVariants: false,
            variantBreakdownMap: {}
          };
        }

        const product = productProfitMap[productId];

        const { itemRevenue, itemCost, itemProfit, itemQuantity } =
          processOrderItem(item, productDoc, product, productImage, deliveredQtyMap);

        product.totalQuantity += itemQuantity;
        product.totalRevenue += itemRevenue;
        product.totalCost += itemCost;
        product.totalProfit += itemProfit;

        orderRevenue += itemRevenue;
        orderCost += itemCost;
        orderProfit += itemProfit;
        orderQuantity += itemQuantity;

        const itemProfitMargin = itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0;

        return {
          ...item.toObject(),
          revenue: parseFloat(itemRevenue.toFixed(2)),
          cost: parseFloat(itemCost.toFixed(2)),
          profit: parseFloat(itemProfit.toFixed(2)),
          profitMargin: parseFloat(itemProfitMargin.toFixed(2))
        };
      });

      totalRevenue += orderRevenue;
      totalCost += orderCost;
      totalProfit += orderProfit;

      // ✅ NEW: capture the discount given on this order
      const orderDiscount = Number(order.discount) || 0;
      totalDiscount += orderDiscount;

      // Period summary
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!periodMap[dateKey]) {
        periodMap[dateKey] = {
          date: dateKey,
          orders: 0,
          itemsSold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          profitMargin: 0,
          discount: 0,       // ✅ NEW
          netProfit: 0       // ✅ NEW
        };
      }
      periodMap[dateKey].orders += 1;
      periodMap[dateKey].itemsSold += orderQuantity;
      periodMap[dateKey].revenue += orderRevenue;
      periodMap[dateKey].cost += orderCost;
      periodMap[dateKey].profit += orderProfit;
      periodMap[dateKey].discount += orderDiscount;   // ✅ NEW

      const orderNetProfit = orderProfit - orderDiscount;

      return {
        ...order.toObject(),
        orderRevenue: parseFloat(orderRevenue.toFixed(2)),
        orderCost: parseFloat(orderCost.toFixed(2)),
        orderProfit: parseFloat(orderProfit.toFixed(2)),
        orderDiscount: parseFloat(orderDiscount.toFixed(2)),         // ✅ NEW
        orderNetProfit: parseFloat(orderNetProfit.toFixed(2)),       // ✅ NEW
        orderProfitMargin: orderRevenue > 0 ? parseFloat(((orderProfit / orderRevenue) * 100).toFixed(2)) : 0,
        orderNetProfitMargin: orderRevenue > 0
          ? parseFloat(((orderNetProfit / orderRevenue) * 100).toFixed(2))
          : 0,                                                        // ✅ NEW
        items: orderItems
      };
    });

    // ============================================
    // Build product profit details
    // ============================================
    const productProfitDetails = Object.values(productProfitMap).map(p => {
      const profitMargin = p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0;
      const averageSellingPrice = p.totalQuantity > 0 ? p.totalRevenue / p.totalQuantity : 0;
      const averageBuyingPrice = p.totalQuantity > 0 ? p.totalCost / p.totalQuantity : 0;

      const variantBreakdown = Object.values(p.variantBreakdownMap || {}).map(vb => ({
        variantId: vb.variantId,
        variantName: vb.variantName,
        subVariantId: vb.subVariantId,
        subVariantName: vb.subVariantName,
        image: vb.image,
        isVariantRow: vb.isVariantRow,
        isSubVariantRow: vb.isSubVariantRow,
        quantity: vb.quantity,
        revenue: parseFloat(vb.revenue.toFixed(2)),
        cost: parseFloat(vb.cost.toFixed(2)),
        profit: parseFloat(vb.profit.toFixed(2)),
        profitMargin: vb.revenue > 0
          ? parseFloat(((vb.profit / vb.revenue) * 100).toFixed(2))
          : 0
      }));

      // Sort: group variants together, variant row before its sub-variants
      variantBreakdown.sort((a, b) => {
        if (a.variantId !== b.variantId) return String(a.variantId).localeCompare(String(b.variantId));
        if (a.isVariantRow && !b.isVariantRow) return -1;
        if (!a.isVariantRow && b.isVariantRow) return 1;
        return 0;
      });

      const { variantBreakdownMap, ...rest } = p;

      return {
        ...rest,
        variantBreakdown,
        profitMargin: profitMargin.toFixed(2),
        totalRevenue: parseFloat(p.totalRevenue.toFixed(2)),
        totalCost: parseFloat(p.totalCost.toFixed(2)),
        totalProfit: parseFloat(p.totalProfit.toFixed(2)),
        averageSellingPrice: parseFloat(averageSellingPrice.toFixed(2)),
        averageBuyingPrice: parseFloat(averageBuyingPrice.toFixed(2))
      };
    });

    const periodSummary = Object.values(periodMap).map(p => {
      const profitMargin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
      const netProfit = p.profit - p.discount;                            // ✅ NEW
      const netProfitMargin = p.revenue > 0
        ? (netProfit / p.revenue) * 100
        : 0;                                                              // ✅ NEW

      return {
        date: p.date,
        orders: p.orders,
        itemsSold: p.itemsSold,
        revenue: parseFloat(p.revenue.toFixed(2)),
        cost: parseFloat(p.cost.toFixed(2)),
        profit: parseFloat(p.profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        discount: parseFloat((p.discount || 0).toFixed(2)),              // ✅ NEW
        netProfit: parseFloat(netProfit.toFixed(2)),                     // ✅ NEW
        netProfitMargin: parseFloat(netProfitMargin.toFixed(2))          // ✅ NEW
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const netProfitAfterDiscount = totalProfit - totalDiscount;         // ✅ NEW
    const averageNetProfitMargin = totalRevenue > 0
      ? (netProfitAfterDiscount / totalRevenue) * 100
      : 0;                                                              // ✅ NEW

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: orders.length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          averageProfitMargin: parseFloat(averageProfitMargin.toFixed(2)),

          // ✅ NEW fields
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          netProfitAfterDiscount: parseFloat(netProfitAfterDiscount.toFixed(2)),
          averageNetProfitMargin: parseFloat(averageNetProfitMargin.toFixed(2))
        },
        productProfitDetails: productProfitDetails.sort((a, b) => b.totalProfit - a.totalProfit),
        periodSummary,
        orders: processedOrders
      }
    });

  } catch (error) {
    console.error('Get profit margin error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate profit margin'
    });
  }
};

// ============================================================
// GET PRODUCT PROFIT MARGIN
// @route   GET /api/orders/admin/product-profit/:productId
// @access  Private (Admin/Moderator/Super Admin)
// ============================================================
const getProductProfitMargin = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = 'month', startDate, endDate } = req.query;

    const userRole = req.user?.role || 'admin';

    if (!['super_admin', 'admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view profit margin data'
      });
    }

    // Date filter
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    } else {
      switch (period) {
        case 'today': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: today, $lte: todayEnd } };
          break;
        }
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(now);
          weekEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: weekStart, $lte: weekEnd } };
          break;
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: monthStart, $lte: monthEnd } };
          break;
        }
        case 'year': {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          yearStart.setHours(0, 0, 0, 0);
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          yearEnd.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: yearStart, $lte: yearEnd } };
          break;
        }
        default:
          dateFilter = {};
      }
    }

    // ✅ Include partial_delivery orders
    const query = {
      orderStatus: { $in: ['delivered', 'partial_delivery'] },
      paymentStatus: { $in: ['paid', 'partial'] },
      'items.productId': productId,
      ...dateFilter
    };

    const orders = await Order.find(query)
      .populate('items.productId', 'costPerItem buyingPrice productName variantTypes');

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        data: {
          productId,
          totalOrders: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          profitMargin: 0,
          hasVariants: false,
          hasSubVariants: false,
          variantBreakdown: [],
          orders: []
        }
      });
    }

    let totalQuantity = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let hasVariants = false;
    let hasSubVariants = false;

    const variantBreakdownMap = {};

    const orderDetails = orders.map(order => {
      let orderQuantity = 0;
      let orderRevenue = 0;
      let orderCost = 0;
      let orderProfit = 0;

      // ✅ Build delivered-quantity map once per order
      const deliveredQtyMap = buildDeliveredQuantityMap(order);

      order.items.forEach(item => {
        const itemProductId = item.productId?._id?.toString() || item.productId?.toString();
        if (itemProductId !== productId) return;

        const productDoc = item.productId && typeof item.productId === 'object' ? item.productId : null;
        const productImage = item.image || '';

        // Reuse the same nested-aware calculation, but write breakdown
        // straight into variantBreakdownMap (product-scoped, not multi-product)
        const pseudoProduct = { hasVariants: false, hasSubVariants: false, variantBreakdownMap };
        const { itemRevenue, itemCost, itemProfit, itemQuantity } =
          processOrderItem(item, productDoc, pseudoProduct, productImage, deliveredQtyMap);

        if (pseudoProduct.hasVariants) hasVariants = true;
        if (pseudoProduct.hasSubVariants) hasSubVariants = true;

        orderQuantity += itemQuantity;
        orderRevenue += itemRevenue;
        orderCost += itemCost;
        orderProfit += itemProfit;
      });

      totalQuantity += orderQuantity;
      totalRevenue += orderRevenue;
      totalCost += orderCost;
      totalProfit += orderProfit;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        quantity: orderQuantity,
        revenue: parseFloat(orderRevenue.toFixed(2)),
        cost: parseFloat(orderCost.toFixed(2)),
        profit: parseFloat(orderProfit.toFixed(2)),
        profitMargin: orderRevenue > 0 ? parseFloat(((orderProfit / orderRevenue) * 100).toFixed(2)) : 0
      };
    });

    const variantBreakdown = Object.values(variantBreakdownMap).map(vb => ({
      variantId: vb.variantId,
      variantName: vb.variantName,
      subVariantId: vb.subVariantId,
      subVariantName: vb.subVariantName,
      image: vb.image,
      isVariantRow: vb.isVariantRow,
      isSubVariantRow: vb.isSubVariantRow,
      quantity: vb.quantity,
      revenue: parseFloat(vb.revenue.toFixed(2)),
      cost: parseFloat(vb.cost.toFixed(2)),
      profit: parseFloat(vb.profit.toFixed(2)),
      profitMargin: vb.revenue > 0 ? parseFloat(((vb.profit / vb.revenue) * 100).toFixed(2)) : 0
    })).sort((a, b) => {
      if (a.variantId !== b.variantId) return String(a.variantId).localeCompare(String(b.variantId));
      if (a.isVariantRow && !b.isVariantRow) return -1;
      if (!a.isVariantRow && b.isVariantRow) return 1;
      return 0;
    });

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        productId,
        totalOrders: orders.length,
        totalQuantity,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        hasVariants,
        hasSubVariants,
        variantBreakdown,
        orders: orderDetails
      }
    });

  } catch (error) {
    console.error('Get product profit margin error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get product profit margin'
    });
  }
};

module.exports = {
  getProfitMarginData,
  getProductProfitMargin
};