

// // utils/orderEmailService.js
// const fs = require('fs');
// const path = require('path');
// const { generateInvoicePDF } = require('./pdfGenerator');
// const { sendEmail, sendEmailWithAttachment, getFromAddress, getOwnerEmail } = require('./emailService');

// // BeautyBucket Brand Colors - Sage / Cream Theme
// const BRAND_COLORS = {
//   primary: '#65705d',
//   primaryLight: '#FDF7EF',
//   primaryDark: '#465641',
//   secondary: '#8B9D83',
//   white: '#FFFFFF',
//   black: '#000000',
//   text: '#263b32',
//   textLight: '#53645a',
//   textMuted: '#8a9284',
//   border: '#e2e3dd',
//   lightBg: '#FDF7EF',
//   success: '#5b7d4f',
//   error: '#a14b3a',
//   warning: '#a67a2e',
//   gold: '#c9a961'
// };

// /**
//  * Format currency (BDT)
//  */
// const formatPrice = (price) => {
//   const numPrice = parseFloat(price) || 0;
//   return `৳${numPrice.toFixed(2)}`;
// };

// /**
//  * Format date
//  */
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'N/A';
//     return date.toLocaleDateString('en-BD', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch (e) {
//     return 'N/A';
//   }
// };

// /**
//  * Get status badge color - Updated for all statuses
//  */
// const getStatusColor = (status) => {
//   const statusColors = {
//     'placed': '#65705d',
//     'follow_up': '#65705d',
//     'accepted': '#65705d',
//     'approved': '#65705d',
//     'ready_to_ship': '#65705d',
//     'courier_assigned': '#65705d',
//     'rejected': '#a14b3a',
//     'cancelled': '#a14b3a',
//     'reminder': '#a67a2e',
//     'processing': '#65705d',
//     'shipped': '#65705d',
//     'out_for_delivery': '#a67a2e',
//     'delivered': '#5b7d4f',
//     'refunded': '#8a9284',
//     'failed': '#a14b3a',
//     'hold': '#a67a2e',
//     'partial_delivery': '#a67a2e',
//     'returned': '#7a5c8c'
//   };
//   return statusColors[status] || '#65705d';
// };

// const getPaymentStatusColor = (status) => {
//   const statusColors = {
//     'pending': '#a67a2e',
//     'paid': '#5b7d4f',
//     'failed': '#a14b3a',
//     'refunded': '#8a9284',
//     'partial': '#a67a2e'
//   };
//   return statusColors[status] || '#65705d';
// };

// /**
//  * Get status display label
//  */
// const getStatusLabel = (status) => {
//   const labels = {
//     'placed': 'Order Placed',
//     'follow_up': 'Follow Up',
//     'accepted': 'Accepted',
//     'approved': 'Approved',
//     'ready_to_ship': 'Ready to Ship',
//     'courier_assigned': 'Courier Assigned',
//     'rejected': 'Rejected',
//     'cancelled': 'Cancelled',
//     'reminder': 'Reminder',
//     'processing': 'Processing',
//     'shipped': 'Shipped',
//     'out_for_delivery': 'Out for Delivery',
//     'delivered': 'Delivered',
//     'refunded': 'Refunded',
//     'failed': 'Failed',
//     'hold': 'On Hold',
//     'partial_delivery': 'Partial Delivery',
//     'returned': 'Returned'
//   };
//   return labels[status] || status;
// };

// /**
//  * ============================================================
//  * ✅ GROUP ITEMS BY PRODUCT WITH NESTED VARIANTS
//  * This mirrors the frontend grouping logic (ThankYouClient/TrackPage)
//  * ============================================================
//  */
// const groupItemsForEmail = (items) => {
//   if (!items || items.length === 0) return [];

//   const productGroups = {};

//   items.forEach((item) => {
//     // Resolve productId
//     let productId = item.productId;
//     if (productId && typeof productId === 'object' && productId._id) {
//       productId = productId._id.toString();
//     } else if (productId) {
//       productId = productId.toString();
//     } else {
//       productId = `item-${Math.random()}`;
//     }

//     const productName = item.productName || item.name || 'Unknown Product';
//     const image = item.image || '';
//     const unit = item.unit || 'pcs';
//     const regularPrice = item.regularPrice || 0;
//     const discountPrice = item.discountPrice || 0;

//     if (!productGroups[productId]) {
//       productGroups[productId] = {
//         productId,
//         productName,
//         image,
//         unit,
//         regularPrice,
//         discountPrice,
//         baseRows: [],
//         colorRows: [],
//         variantRows: [],
//         totalQuantity: 0,
//         hasVariants: false
//       };
//     }

//     const group = productGroups[productId];
//     const hasValidColor = item.selectedColor &&
//       item.selectedColor !== 'null' &&
//       item.selectedColor !== '' &&
//       item.selectedColor !== 'undefined';

//     // ============================================================
//     // CASE 1: NESTED variantDetails[] (from Order schema)
//     // ============================================================
//     if (item.variantDetails && Array.isArray(item.variantDetails) && item.variantDetails.length > 0) {
//       group.hasVariants = true;

//       item.variantDetails.forEach((variant) => {
//         const hasSubVariants = variant.subVariants && variant.subVariants.length > 0;

//         const variantPrice = variant.variantDiscountPrice > 0
//           ? Number(variant.variantDiscountPrice)
//           : Number(variant.variantRegularPrice) || 0;
//         const variantOriginalPrice = Number(variant.variantRegularPrice) || 0;
//         const variantHasDiscount = variantPrice > 0 && variantOriginalPrice > variantPrice;

//         if (hasSubVariants) {
//           const isHeaderOnly = (variant.quantity || 0) === 0;

//           group.variantRows.push({
//             type: 'variant',
//             variantId: variant.variantId,
//             variantName: variant.variantName || 'Variant',
//             subVariantId: null,
//             subVariantName: null,
//             selectedColor: variant.selectedColor || null,
//             quantity: variant.quantity || 0,
//             price: variantPrice,
//             originalPrice: variantOriginalPrice,
//             hasDiscount: variantHasDiscount,
//             image: variant.image || '',
//             unit: unit,
//             isSubVariant: false,
//             isVariant: true,
//             isHeader: isHeaderOnly
//           });

//           if (variant.quantity > 0) {
//             group.totalQuantity += variant.quantity;
//           }

//           variant.subVariants.forEach((sub) => {
//             const subPrice = sub.subVariantDiscountPrice > 0
//               ? Number(sub.subVariantDiscountPrice)
//               : Number(sub.subVariantRegularPrice) || 0;
//             const subOriginalPrice = Number(sub.subVariantRegularPrice) || 0;
//             const subHasDiscount = subPrice > 0 && subOriginalPrice > subPrice;

//             group.variantRows.push({
//               type: 'subVariant',
//               variantId: variant.variantId,
//               variantName: variant.variantName || 'Variant',
//               subVariantId: sub.subVariantId,
//               subVariantName: sub.subVariantName || 'Sub-Variant',
//               selectedColor: sub.selectedColor || variant.selectedColor || null,
//               quantity: sub.quantity || 0,
//               price: subPrice,
//               originalPrice: subOriginalPrice,
//               hasDiscount: subHasDiscount,
//               image: sub.image || variant.image || '',
//               unit: unit,
//               isSubVariant: true,
//               isVariant: false
//             });

//             group.totalQuantity += sub.quantity || 0;
//           });
//         } else {
//           group.variantRows.push({
//             type: 'variant',
//             variantId: variant.variantId,
//             variantName: variant.variantName || 'Variant',
//             subVariantId: null,
//             subVariantName: null,
//             selectedColor: variant.selectedColor || null,
//             quantity: variant.quantity || 0,
//             price: variantPrice,
//             originalPrice: variantOriginalPrice,
//             hasDiscount: variantHasDiscount,
//             image: variant.image || '',
//             unit: unit,
//             isSubVariant: false,
//             isVariant: true
//           });

//           group.totalQuantity += variant.quantity || 0;
//         }
//       });

//       return;
//     }

//     // ============================================================
//     // CASE 2: FLAT VARIANT FIELDS (fallback for older data)
//     // ============================================================
//     const isSubVariant = !!(item.subVariantId && item.subVariantId !== 'null' && item.subVariantId !== '');
//     const isVariant = !!(item.variantId && item.variantId !== 'null' && item.variantId !== '');

//     if (isVariant || isSubVariant) {
//       group.hasVariants = true;

//       const variantPrice = item.variantDiscountPrice > 0
//         ? Number(item.variantDiscountPrice)
//         : Number(item.variantRegularPrice) > 0
//           ? Number(item.variantRegularPrice)
//           : Number(item.discountPrice) || Number(item.regularPrice) || 0;

//       const originalPrice = Number(item.variantRegularPrice) > 0
//         ? Number(item.variantRegularPrice)
//         : Number(item.regularPrice) || 0;

//       const hasDiscount = originalPrice > 0 && variantPrice > 0 && variantPrice < originalPrice;

//       group.variantRows.push({
//         type: isSubVariant ? 'subVariant' : 'variant',
//         variantId: item.variantId || null,
//         variantName: item.variantName || 'Variant',
//         subVariantId: item.subVariantId || null,
//         subVariantName: item.subVariantName || null,
//         selectedColor: hasValidColor ? item.selectedColor : null,
//         quantity: item.quantity || 0,
//         price: variantPrice,
//         originalPrice,
//         hasDiscount,
//         image: item.variantImage || item.image || '',
//         unit: unit,
//         isSubVariant,
//         isVariant: !isSubVariant
//       });

//       group.totalQuantity += item.quantity || 0;
//       return;
//     }

//     // ============================================================
//     // CASE 3: COLOR ITEMS (no variants)
//     // ============================================================
//     if (item.colors && Array.isArray(item.colors) && item.colors.length > 0) {
//       const validColors = item.colors.filter(c =>
//         c.color && c.color !== 'null' && c.color !== '' && c.color !== 'undefined'
//       );

//       if (validColors.length > 0) {
//         validColors.forEach(c => {
//           const qty = c.quantity || 0;
//           const p = c.price || item.discountPrice || item.regularPrice || 0;

//           const existing = group.colorRows.find(gc => gc.color === c.color);
//           if (existing) {
//             existing.quantity += qty;
//           } else {
//             group.colorRows.push({
//               color: c.color,
//               quantity: qty,
//               price: p
//             });
//           }
//           group.totalQuantity += qty;
//         });
//         return;
//       }
//     }

//     if (hasValidColor) {
//       const qty = item.quantity || 0;
//       const p = item.discountPrice || item.regularPrice || 0;

//       const existing = group.colorRows.find(gc => gc.color === item.selectedColor);
//       if (existing) {
//         existing.quantity += qty;
//       } else {
//         group.colorRows.push({
//           color: item.selectedColor,
//           quantity: qty,
//           price: p
//         });
//       }
//       group.totalQuantity += qty;
//       return;
//     }

//     // ============================================================
//     // CASE 4: BASE (no color, no variant)
//     // ============================================================
//     group.baseRows.push({
//       quantity: item.quantity || 0,
//       price: item.discountPrice || item.regularPrice || 0
//     });
//     group.totalQuantity += item.quantity || 0;
//   });

//   return Object.values(productGroups);
// };

// /**
//  * ============================================================
//  * ✅ GENERATE ORDER ITEMS HTML - NESTED VARIANTS/SUB-VARIANTS
//  * Shows product, variant, sub-variant rows with proper hierarchy
//  *
//  * NOTE: For products that HAVE variants, the product-header row
//  * does NOT show Price or Total (only Qty and Unit), because the
//  * real prices live on the variant/sub-variant rows below.
//  * ============================================================
//  */
// const generateOrderItemsHTML = (items) => {
//   if (!items || items.length === 0) {
//     return '<p style="color: #8a9284; text-align: center; padding: 20px;">No items found</p>';
//   }

//   const groupedItems = groupItemsForEmail(items);

//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

//   let html = `
//     <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: 'Segoe UI', Arial, sans-serif;">
//       <thead>
//         <tr style="background: #FDF7EF; border-bottom: 2px solid #e2e3dd;">
//           <th style="padding: 12px; text-align: left; font-weight: 600; color: #263b32; font-size: 13px; width: 40%;">Product / Variant</th>
//           <th style="padding: 12px; text-align: center; font-weight: 600; color: #263b32; font-size: 13px; width: 12%;">Color</th>
//           <th style="padding: 12px; text-align: center; font-weight: 600; color: #263b32; font-size: 13px; width: 8%;">Qty</th>
//           <th style="padding: 12px; text-align: center; font-weight: 600; color: #263b32; font-size: 13px; width: 10%;">Unit</th>
//           <th style="padding: 12px; text-align: right; font-weight: 600; color: #263b32; font-size: 13px; width: 15%;">Price</th>
//           <th style="padding: 12px; text-align: right; font-weight: 600; color: #263b32; font-size: 13px; width: 15%;">Total</th>
//         </tr>
//       </thead>
//       <tbody>
//   `;

//   groupedItems.forEach((group, groupIndex) => {
//     const imageUrl = group.image && group.image.startsWith('http')
//       ? group.image
//       : (group.image ? `${frontendUrl}${group.image}` : 'https://via.placeholder.com/60/65705d/8B9D83?text=BB');

//     // ============================================================
//     // Build a flat list of rows for this product
//     // ============================================================
//     const rows = [];

//     const hasVariants = group.variantRows.length > 0;

//     // ------------------------------------------------------------
//     // CASE A: Product HAS variants
//     //   → Push a "product header" row (NO price/total shown),
//     //     then variant/sub-variant rows below.
//     // ------------------------------------------------------------
//     if (hasVariants) {
//       let productTotal = 0;
//       let productQty = 0;

//       group.baseRows.forEach(br => {
//         productTotal += br.price * br.quantity;
//         productQty += br.quantity;
//       });
//       group.colorRows.forEach(c => {
//         productTotal += c.price * c.quantity;
//         productQty += c.quantity;
//       });
//       group.variantRows.forEach(v => {
//         productTotal += v.price * v.quantity;
//         productQty += v.quantity;
//       });

//       rows.push({
//         kind: 'product-header',
//         name: group.productName,
//         color: null,
//         quantity: productQty,
//         price: productQty > 0 ? productTotal / productQty : 0,
//         originalPrice: null,
//         hasDiscount: false,
//         unit: group.unit,
//         indent: 0,
//         badge: 'Product',
//         image: imageUrl,
//         isHeaderOnly: false,
//         showPrice: false,
//         rowTotal: productTotal,
//         showVariantsNote: true
//       });

//       // Base rows (rare alongside variants)
//       group.baseRows.forEach((br) => {
//         rows.push({
//           kind: 'base',
//           name: group.productName,
//           color: null,
//           quantity: br.quantity,
//           price: br.price,
//           originalPrice: null,
//           hasDiscount: false,
//           unit: group.unit,
//           indent: 1,
//           badge: null,
//           image: null,
//           isHeaderOnly: false,
//           rowTotal: br.price * br.quantity
//         });
//       });

//       // Color rows (rare alongside variants)
//       group.colorRows.forEach((c) => {
//         rows.push({
//           kind: 'color',
//           name: group.productName,
//           color: c.color,
//           quantity: c.quantity,
//           price: c.price,
//           originalPrice: null,
//           hasDiscount: false,
//           unit: group.unit,
//           indent: 1,
//           badge: null,
//           image: null,
//           isHeaderOnly: false,
//           rowTotal: c.price * c.quantity
//         });
//       });

//       // Group variant rows by variantId
//       const variantGroups = {};
//       group.variantRows.forEach(v => {
//         const key = v.variantId || 'unknown';
//         if (!variantGroups[key]) variantGroups[key] = [];
//         variantGroups[key].push(v);
//       });

//       Object.values(variantGroups).forEach(variants => {
//         variants.sort((a, b) => {
//           if (!a.isSubVariant && b.isSubVariant) return -1;
//           if (a.isSubVariant && !b.isSubVariant) return 1;
//           return 0;
//         });

//         const hasSubVariantInGroup = variants.some(v => v.isSubVariant);

//         variants.forEach((v) => {
//           const isVariantRow = !v.isSubVariant;
//           const isHeaderOnly = isVariantRow
//             && hasSubVariantInGroup
//             && (v.quantity || 0) === 0;

//           rows.push({
//             kind: isVariantRow ? 'variant' : 'subVariant',
//             name: isVariantRow ? v.variantName : v.subVariantName,
//             parentVariantName: v.variantName,
//             color: v.selectedColor,
//             quantity: v.quantity,
//             price: v.price,
//             originalPrice: v.originalPrice,
//             hasDiscount: v.hasDiscount,
//             unit: v.unit,
//             indent: isVariantRow ? 1 : 2,
//             badge: isVariantRow ? 'Variant' : 'Sub',
//             image: null,
//             isHeaderOnly,
//             rowTotal: v.price * v.quantity
//           });
//         });
//       });
//     }
//     // ------------------------------------------------------------
//     // CASE B: Product has NO variants
//     //   → No separate product header; render base/color rows directly
//     // ------------------------------------------------------------
//     else {
//       group.baseRows.forEach((br) => {
//         rows.push({
//           kind: 'base',
//           name: group.productName,
//           color: null,
//           quantity: br.quantity,
//           price: br.price,
//           originalPrice: null,
//           hasDiscount: false,
//           unit: group.unit,
//           indent: 0,
//           badge: null,
//           image: imageUrl,
//           isHeaderOnly: false,
//           isFirstOfGroup: rows.length === 0,
//           rowTotal: br.price * br.quantity
//         });
//       });

//       group.colorRows.forEach((c) => {
//         rows.push({
//           kind: 'color',
//           name: group.productName,
//           color: c.color,
//           quantity: c.quantity,
//           price: c.price,
//           originalPrice: null,
//           hasDiscount: false,
//           unit: group.unit,
//           indent: 0,
//           badge: null,
//           image: imageUrl,
//           isHeaderOnly: false,
//           isFirstOfGroup: rows.length === 0,
//           rowTotal: c.price * c.quantity
//         });
//       });
//     }

//     // ============================================================
//     // Render rows
//     // ============================================================
//     rows.forEach((row, rowIndex) => {
//       const indent = row.indent || 0;
//       const paddingLeft = indent === 0 ? '0' : indent === 1 ? '20px' : '40px';
//       const hasColor = !!row.color;
//       const isHeaderOnly = row.isHeaderOnly;
//       const isProductRow = row.kind === 'product-header';
//       const isBaseOrColorRow = row.kind === 'base' || row.kind === 'color';
//       const isFirstOfGroup = row.isFirstOfGroup || isProductRow;

//       const hidePrice = isHeaderOnly || row.showPrice === false;
//       const hideTotal = isHeaderOnly || row.showPrice === false;

//       const rowTotal = row.rowTotal !== undefined
//         ? row.rowTotal
//         : row.price * row.quantity;

//       html += `
//         <tr style="border-bottom: 1px solid #e2e3dd; ${
//           indent === 2 ? 'background: #f0f3ec;' :
//           indent === 1 ? 'background: #f7f9f4;' : ''
//         }">
//           <!-- Product / Variant Column -->
//           <td style="padding: 12px; vertical-align: middle;">
//             <div style="padding-left: ${paddingLeft}; display: flex; align-items: center; gap: 10px;">
//               ${
//                 isFirstOfGroup && row.image
//                   ? `<img src="${row.image}" alt="${row.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e3dd; flex-shrink: 0;">`
//                   : indent > 0
//                     ? `<span style="width: 20px; flex-shrink: 0; color: #8a9284; font-size: 14px;">${indent === 2 ? '&gt;&gt;' : '&gt;'}</span>`
//                     : ''
//               }
//               <div style="min-width: 0;">
//                 <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
//                   <strong style="color: ${
//                     isProductRow ? '#263b32' :
//                     isBaseOrColorRow ? '#263b32' :
//                     indent === 1 ? '#4e5b53' : '#7a857a'
//                   }; font-size: ${
//                     isProductRow ? '14px' : '13px'
//                   }; font-weight: ${
//                     isProductRow ? '700' : indent === 1 ? '600' : '400'
//                   };">
//                     ${row.name}
//                   </strong>
//                   ${
//                     row.badge
//                       ? `<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; ${
//                           row.badge === 'Product' ? 'background: #F3F4F6; color: #6B7280;' :
//                           row.badge === 'Variant' ? 'background: #eef1ea; color: #4e5b53;' :
//                           'background: #e8ede4; color: #5b705a;'
//                         }">${row.badge}</span>`
//                       : ''
//                   }
//                   ${
//                     row.showVariantsNote
//                       ? `<span style="font-size: 11px; color: #8a9284; font-style: italic;">(See variants below)</span>`
//                       : ''
//                   }
//                   ${
//                     row.hasDiscount && !isHeaderOnly && !isProductRow
//                       ? `<span style="font-size: 10px; color: #5b7d4f; background: #F0FDF4; padding: 2px 6px; border-radius: 4px;">Save ${Math.round(((row.originalPrice - row.price) / row.originalPrice) * 100)}%</span>`
//                       : ''
//                   }
//                 </div>
//               </div>
//             </div>
//           </td>

//           <!-- Color Column -->
//           <td style="padding: 12px; text-align: center; vertical-align: middle;">
//             ${
//               hasColor
//                 ? `<div style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #e2e3dd; background-color: ${row.color};"></div>`
//                 : `<span style="color: #8a9284; font-size: 12px;">-</span>`
//             }
//           </td>

//           <!-- Qty Column -->
//           <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 14px; color: #263b32; font-weight: 500;">
//             ${isHeaderOnly ? '<span style="color: #8a9284;">-</span>' : (row.quantity || 0)}
//           </td>

//           <!-- Unit Column -->
//           <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 13px; color: #53645a;">
//             ${isHeaderOnly ? '' : (row.unit || 'pcs')}
//           </td>

//           <!-- Price Column -->
//           <td style="padding: 12px; text-align: right; vertical-align: middle; font-size: 14px; color: #263b32;">
//             ${
//               hidePrice
//                 ? '<span style="color: #8a9284;">-</span>'
//                 : row.hasDiscount
//                   ? `<span style="color: #5b7d4f; font-weight: 500;">${formatPrice(row.price)}</span>
//                      <span style="color: #8a9284; text-decoration: line-through; margin-left: 4px; font-size: 12px;">${formatPrice(row.originalPrice)}</span>`
//                   : formatPrice(row.price)
//             }
//           </td>

//           <!-- Total Column -->
//           <td style="padding: 12px; text-align: right; vertical-align: middle; font-weight: 600; color: #65705d; font-size: 14px;">
//             ${hideTotal ? '<span style="color: #8a9284;">-</span>' : formatPrice(rowTotal)}
//           </td>
//         </tr>
//       `;
//     });
//   });

//   html += `
//       </tbody>
//     </table>
//   `;

//   return html;
// };

// /**
//  * Generate order summary HTML
//  */
// const generateOrderSummaryHTML = (order) => {
//   const statusColor = getStatusColor(order.orderStatus);
//   const paymentStatusColor = getPaymentStatusColor(order.paymentStatus);
//   const statusLabel = getStatusLabel(order.orderStatus);

//   return `
//     <div style="background: #FDF7EF; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e3dd;">
//       <h2 style="margin: 0 0 15px 0; color: #263b32; font-size: 18px; font-weight: 700;">Order Summary</h2>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//           <td style="padding: 8px 0; width: 140px; color: #53645a;"><strong>Order ID:</strong></td>
//           <td style="color: #65705d; font-weight: 600;">${order.orderNumber || order._id.slice(-8).toUpperCase()}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Order Date:</strong></td>
//           <td style="color: #263b32;">${formatDate(order.createdAt)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Order Status:</strong></td>
//           <td><span style="display: inline-block; padding: 4px 12px; background: ${statusColor}20; color: ${statusColor}; border-radius: 20px; font-size: 12px; font-weight: 600;">${statusLabel}</span></td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Payment Status:</strong></td>
//           <td><span style="display: inline-block; padding: 4px 12px; background: ${paymentStatusColor}20; color: ${paymentStatusColor}; border-radius: 20px; font-size: 12px; font-weight: 600;">${order.paymentStatus.toUpperCase()}</span></td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Payment Method:</strong></td>
//           <td style="color: #263b32;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online Payment' : order.paymentMethod.toUpperCase()}</td>
//         </tr>
//         ${order.paymentMethod === 'cod' ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Payment Due:</strong></td>
//           <td style="color: #263b32;">Pay when you receive your order</td>
//         </tr>
//         ` : ''}
//         ${order.couponCode ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Coupon Applied:</strong></td>
//           <td style="color: #65705d; font-weight: 600;">${order.couponCode}</td>
//         </tr>
//         ` : ''}
//       </table>
//     </div>
//   `;
// };

// /**
//  * Generate pricing breakdown HTML
//  */
// const generatePricingHTML = (order) => {
//   return `
//     <div style="background: #FDF7EF; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e3dd;">
//       <h2 style="margin: 0 0 15px 0; color: #263b32; font-size: 18px; font-weight: 700;">Price Breakdown</h2>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Subtotal:</strong></td>
//           <td style="text-align: right; color: #263b32;">${formatPrice(order.subtotal)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Shipping:</strong></td>
//           <td style="text-align: right; color: #263b32;">${formatPrice(order.shippingCost)}</td>
//         </tr>
//         ${order.discount > 0 ? `
//         <tr>
//           <td style="padding: 8px 0; color: #5b7d4f;"><strong>Discount:</strong></td>
//           <td style="text-align: right; color: #5b7d4f;">-${formatPrice(order.discount)}</td>
//         </tr>
//         ` : ''}
//         <tr style="border-top: 2px solid #e2e3dd; margin-top: 10px;">
//           <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #263b32;"><strong>Total:</strong></td>
//           <td style="padding: 12px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #65705d;">${formatPrice(order.total)}</td>
//         </tr>
//       </table>
//     </div>
//   `;
// };

// /**
//  * Generate customer info HTML
//  */
// const generateCustomerInfoHTML = (order) => {
//   return `
//     <div style="background: #FDF7EF; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e3dd;">
//       <h2 style="margin: 0 0 15px 0; color: #263b32; font-size: 18px; font-weight: 700;">Customer Information</h2>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//           <td style="padding: 8px 0; width: 120px; color: #53645a;"><strong>Name:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo?.fullName || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Email:</strong></td>
//           <td><a href="mailto:${order.customerInfo?.email}" style="color: #65705d; text-decoration: none; font-weight: 600;">${order.customerInfo?.email}</a></td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Phone:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo?.phone || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Address:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo?.address || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Division:</strong></td>
//           <td style="color: #263b32; font-weight: 600;">${order.customerInfo?.division || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>City:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo?.city || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Upazila/Thana:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo?.zone || 'N/A'}</td>
//         </tr>
//         ${order.customerInfo?.area ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Union/Area:</strong></td>
//           <td style="color: #263b32;">${order.customerInfo.area}</td>
//         </tr>
//         ` : ''}
//         ${order.customerInfo?.note ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Order Note:</strong></td>
//           <td style="color: #53645a;">${order.customerInfo.note}</td>
//         </tr>
//         ` : ''}
//       </table>
//     </div>
//   `;
// };

// /**
//  * Generate delivery info HTML
//  */
// const generateDeliveryInfoHTML = (order) => {
//   const hasDeliveryNote = order.deliveryNote && order.deliveryNote.trim() !== '';
//   const hasTrackingNumber = order.trackingNumber && order.trackingNumber.trim() !== '';
//   const hasDeliveredDate = order.deliveredAt && order.orderStatus === 'delivered';
//   const hasCancellationReason = order.cancellationReason && order.cancellationReason.trim() !== '' && order.orderStatus === 'cancelled';
//   const hasRejectionReason = order.rejectionReason && order.rejectionReason.trim() !== '' && order.orderStatus === 'rejected';

//   const hasCourier = order.deliveryService && order.deliveryService.courierName;
//   const hasTrackingUrl = order.deliveryService && order.deliveryService.trackingUrl;
//   const hasCourierOrderId = order.deliveryService && order.deliveryService.courierOrderId;

//   if (!hasDeliveryNote && !hasTrackingNumber && !hasDeliveredDate && !hasCancellationReason && !hasRejectionReason && !hasCourier) {
//     return '';
//   }

//   let bgColor = '#FDF7EF';
//   let borderColor = '#65705d';
//   let titleColor = '#263b32';
//   let titleIcon = '📝';

//   if (order.orderStatus === 'delivered') {
//     bgColor = '#F0FDF4';
//     borderColor = '#5b7d4f';
//     titleColor = '#5b7d4f';
//     titleIcon = '✅';
//   } else if (['shipped', 'out_for_delivery'].includes(order.orderStatus)) {
//     bgColor = '#FDF7EF';
//     borderColor = '#8B9D83';
//     titleColor = '#65705d';
//     titleIcon = '🚚';
//   } else if (order.orderStatus === 'processing' || order.orderStatus === 'courier_assigned') {
//     bgColor = '#FDF7EF';
//     borderColor = '#8B9D83';
//     titleColor = '#65705d';
//     titleIcon = '📦';
//   } else if (order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') {
//     bgColor = '#FEF2F2';
//     borderColor = '#a14b3a';
//     titleColor = '#a14b3a';
//     titleIcon = '❌';
//   }

//   let reasonText = '';
//   if (order.orderStatus === 'cancelled' && hasCancellationReason) {
//     reasonText = `Cancellation Reason: ${order.cancellationReason}`;
//   } else if (order.orderStatus === 'rejected' && hasRejectionReason) {
//     reasonText = `Rejection Reason: ${order.rejectionReason}`;
//   }

//   return `
//     <div style="background: ${bgColor}; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${borderColor}; border: 1px solid ${borderColor}30;">
//       <h2 style="margin: 0 0 15px 0; color: ${titleColor}; font-size: 18px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
//         <span>${titleIcon}</span> <span>${getStatusLabel(order.orderStatus)}</span>
//       </h2>
//       <table style="width: 100%; border-collapse: collapse;">
//         ${reasonText ? `
//         <tr>
//           <td style="padding: 8px 0; width: 140px; color: #53645a;"><strong>${order.orderStatus === 'cancelled' ? 'Cancellation' : 'Rejection'} Reason:</strong></td>
//           <td><div style="background: #FFFFFF; padding: 12px; border-radius: 8px; margin-top: 5px; color: ${borderColor}; border: 1px solid ${borderColor}30;">${reasonText}</div></td>
//         </tr>
//         ` : ''}
//         ${hasDeliveredDate ? `
//         <tr>
//           <td style="padding: 8px 0; width: 140px; color: #53645a;"><strong>Delivered Date:</strong></td>
//           <td style="color: #263b32;">${formatDate(order.deliveredAt)}</td>
//         </tr>
//         ` : ''}
//         ${hasTrackingNumber ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Tracking Number:</strong></td>
//           <td><code style="background: #FFFFFF; padding: 4px 8px; border-radius: 4px; color: #65705d; border: 1px solid #e2e3dd; font-weight: 600;">${order.trackingNumber}</code></td>
//         </tr>
//         ` : ''}
//         ${hasCourier ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Courier Service:</strong></td>
//           <td style="color: #263b32; font-weight: 600;">${order.deliveryService.courierName}</td>
//         </tr>
//         ` : ''}
//         ${hasCourierOrderId ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Courier Order ID:</strong></td>
//           <td style="color: #263b32; font-weight: 600;">${order.deliveryService.courierOrderId}</td>
//         </tr>
//         ` : ''}
//         ${hasTrackingUrl ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Track Your Order:</strong></td>
//           <td><a href="${order.deliveryService.trackingUrl}" target="_blank" style="color: #FFFFFF; text-decoration: none; font-weight: 600; display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #65705d, #8B9D83); border-radius: 8px;">📦 Track Order on ${order.deliveryService.courierName || 'Courier'}</a></td>
//         </tr>
//         ` : ''}
//         ${hasDeliveryNote ? `
//         <tr>
//           <td style="padding: 8px 0; color: #53645a;"><strong>Delivery Note:</strong></td>
//           <td><div style="background: #FFFFFF; padding: 12px; border-radius: 8px; margin-top: 5px; color: #263b32; border: 1px solid #e2e3dd;">${order.deliveryNote}</div></td>
//         </tr>
//         ` : ''}
//       </table>
//     </div>
//   `;
// };

// /**
//  * Send order placed email to customer with invoice attachment
//  */
// const sendOrderPlacedEmail = async (order, customerEmail) => {
//   console.log('📧 Sending order placed email to customer...');

//   try {
//     if (!customerEmail) {
//       throw new Error('Customer email is missing');
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const itemsHTML = generateOrderItemsHTML(order.items);
//     const summaryHTML = generateOrderSummaryHTML(order);
//     const pricingHTML = generatePricingHTML(order);
//     const customerInfoHTML = generateCustomerInfoHTML(order);
//     const deliveryInfoHTML = generateDeliveryInfoHTML(order);

//     const from = await getFromAddress('order');

//     // Generate PDF invoice
//     let pdfBuffer = null;
//     try {
//       console.log('📄 Generating PDF invoice for order:', order.orderNumber);
//       const pdfResult = await generateInvoicePDF(order);
//       if (pdfResult && pdfResult.buffer) {
//         pdfBuffer = pdfResult.buffer;
//         console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
//       } else {
//         console.warn('⚠️ PDF generation returned no buffer');
//       }
//     } catch (pdfError) {
//       console.error('❌ PDF generation error:', pdfError.message);
//     }

//     const statusLabel = getStatusLabel(order.orderStatus);
//     const statusEmoji = order.orderStatus === 'placed' ? '📦' :
//                         order.orderStatus === 'follow_up' ? '📞' :
//                         order.orderStatus === 'accepted' ? '✅' :
//                         order.orderStatus === 'approved' ? '✅' :
//                         order.orderStatus === 'ready_to_ship' ? '📦' :
//                         order.orderStatus === 'courier_assigned' ? '🚚' :
//                         order.orderStatus === 'rejected' ? '❌' :
//                         order.orderStatus === 'cancelled' ? '❌' :
//                         order.orderStatus === 'reminder' ? '⏰' :
//                         order.orderStatus === 'processing' ? '⚙️' :
//                         order.orderStatus === 'shipped' ? '🚚' :
//                         order.orderStatus === 'out_for_delivery' ? '🚚' :
//                         order.orderStatus === 'delivered' ? '🎁' : '📦';

//     const subject = `${statusEmoji} Order ${statusLabel}! - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #263b32; margin: 0; padding: 0; background-color: #FDF7EF; }
//           .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(101, 112, 93, 0.1); border: 1px solid #e2e3dd; }
//           .header { background: linear-gradient(135deg, #65705d, #8B9D83); padding: 30px; text-align: center; }
//           .header h1 { color: #FFFFFF; margin: 0; font-size: 28px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; }
//           .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; }
//           .content { padding: 35px 30px; }
//           .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #263b32; }
//           .button { background: linear-gradient(135deg, #65705d, #8B9D83); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none; }
//           .button:hover { opacity: 0.9; }
//           .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e3dd; text-align: center; }
//           p { color: #53645a; }
//           strong { color: #263b32; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>${statusEmoji}</span>
//               <span>Order ${statusLabel}!</span>
//             </h1>
//             <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
//           </div>
//           <div class="content">
//             <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>
//             <p style="margin-bottom: 25px; font-size: 16px; color: #263b32;">
//               ${order.orderStatus === 'placed' ? 'Thank you for your order! We have received your order and it is now pending confirmation. You will receive another email once your order is confirmed.' :
//                 order.orderStatus === 'follow_up' ? 'Your order is being reviewed by our team. We will contact you shortly for confirmation.' :
//                 order.orderStatus === 'accepted' ? 'Great news! Your order has been accepted and is being prepared.' :
//                 order.orderStatus === 'approved' ? 'Your order has been approved and is ready for processing.' :
//                 order.orderStatus === 'ready_to_ship' ? 'Your order is packed and ready to be shipped!' :
//                 order.orderStatus === 'courier_assigned' ? 'A courier has been assigned to deliver your order.' :
//                 order.orderStatus === 'processing' ? 'Your order is being processed by the courier service.' :
//                 order.orderStatus === 'shipped' ? 'Your order has been shipped and is on its way to you!' :
//                 order.orderStatus === 'out_for_delivery' ? 'Your order is out for delivery! Get ready to receive it.' :
//                 order.orderStatus === 'delivered' ? 'Your order has been delivered! We hope you love your new products.' :
//                 order.orderStatus === 'cancelled' ? 'Your order has been cancelled. If you have any questions, please contact our support team.' :
//                 order.orderStatus === 'rejected' ? 'Your order has been rejected. Please contact our support team for more information.' :
//                 'Thank you for your order!'}
//             </p>

//             ${summaryHTML}
//             ${customerInfoHTML}
//             ${deliveryInfoHTML}

//             <div class="section-title">
//               <span>🛍️</span>
//               <span>Order Items</span>
//             </div>
//             ${itemsHTML}

//             ${pricingHTML}

//             <div style="margin: 35px 0 25px; text-align: center;">
//               <a href="${frontendUrl}/track" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #65705d, #8B9D83); border-radius: 8px; font-weight: 600; font-size: 16px; border: none;">
//                 Track Your Order
//               </a>
//             </div>

//             <div class="footer">
//               <p style="margin-bottom: 5px;">With love,</p>
//               <p style="margin: 0; font-weight: bold; color: #65705d;">BeautyBucket Team</p>
//               <p style="font-size: 12px; color: #8a9284; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
//               <p style="font-size: 11px; color: #8a9284; margin-top: 5px;">Beauty is our passion. Thank you for being part of our beauty community!</p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const attachments = [];
//     if (pdfBuffer) {
//       attachments.push({
//         filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
//         content: pdfBuffer,
//         contentType: 'application/pdf'
//       });
//       console.log('📎 PDF attachment added to email');
//     }

//     const result = await sendEmailWithAttachment(
//       customerEmail,
//       subject,
//       html,
//       attachments,
//       'order',
//       false
//     );

//     if (result.success) {
//       console.log('✅ Order placed email sent:', result.messageId);
//       return { success: true };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Order placed email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send order notification email to admin
//  */
// const sendOrderNotificationToAdmin = async (order, eventType = 'new') => {
//   console.log('📧 Sending order notification email to admin...');

//   try {
//     const ownerEmail = await getOwnerEmail('order');

//     if (!ownerEmail) {
//       console.warn('⚠️ Owner email not configured. Skipping admin notification.');
//       return { success: false, error: 'Owner email not configured' };
//     }

//     const from = await getFromAddress('order');
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const itemsHTML = generateOrderItemsHTML(order.items);
//     const summaryHTML = generateOrderSummaryHTML(order);
//     const pricingHTML = generatePricingHTML(order);
//     const customerInfoHTML = generateCustomerInfoHTML(order);
//     const deliveryInfoHTML = generateDeliveryInfoHTML(order);
//     const statusLabel = getStatusLabel(order.orderStatus);

//     let headerTitle = '';
//     let headerEmoji = '';
//     let additionalMessage = '';

//     if (eventType === 'new') {
//       headerTitle = 'New Order Received!';
//       headerEmoji = '🛍️';
//       additionalMessage = 'A new order has been placed and requires your attention.';
//     } else if (eventType === 'status_update') {
//       headerTitle = `Order ${statusLabel}`;
//       headerEmoji = '📝';
//       additionalMessage = `Order status has been updated to "${statusLabel}".`;
//     } else if (eventType === 'payment_update') {
//       const paymentInfo = {
//         'paid': { title: 'Payment Received', emoji: '💰' },
//         'failed': { title: 'Payment Failed', emoji: '⚠️' },
//         'refunded': { title: 'Payment Refunded', emoji: '💸' },
//         'partial': { title: 'Partial Payment', emoji: '💳' }
//       };
//       const info = paymentInfo[order.paymentStatus] || { title: 'Payment Updated', emoji: '💳' };
//       headerTitle = info.title;
//       headerEmoji = info.emoji;
//       additionalMessage = `Payment status has been updated to "${order.paymentStatus.toUpperCase()}".`;
//     }

//     const subject = `${headerEmoji} ${headerTitle} - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #263b32; background-color: #FDF7EF; }
//           .container { max-width: 700px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(101, 112, 93, 0.1); border: 1px solid #e2e3dd; }
//           .header { background: linear-gradient(135deg, #65705d, #8B9D83); padding: 25px 30px; text-align: center; }
//           .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; }
//           .content { padding: 30px; }
//           .button { background: linear-gradient(135deg, #65705d, #8B9D83); color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; border: none; }
//           .button:hover { opacity: 0.9; }
//           .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; color: #263b32; }
//           p { color: #53645a; }
//           strong { color: #263b32; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>${headerEmoji}</span>
//               <span>${headerTitle}</span>
//             </h1>
//           </div>
//           <div class="content">
//             <p>${additionalMessage}</p>

//             ${customerInfoHTML}
//             ${summaryHTML}
//             ${deliveryInfoHTML}

//             <div class="section-title">🛍️ Order Items</div>
//             ${itemsHTML}

//             ${pricingHTML}

//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${frontendUrl}/authorize/orders" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #65705d, #8B9D83); border-radius: 8px; font-weight: 600; font-size: 16px; border: none; cursor: pointer;">
//                 View Order in Dashboard
//               </a>
//             </div>

//             <div style="background: #FDF7EF; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e2e3dd;">
//               <p style="margin: 0; font-size: 14px; color: #65705d;">Please review and take necessary action.</p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const result = await sendEmail(
//       ownerEmail,
//       subject,
//       html,
//       null,
//       'order'
//     );

//     if (result.success) {
//       console.log('✅ Admin order notification sent:', result.messageId);
//       return { success: true };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Admin notification error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send order status update email to customer with invoice attachment
//  */
// const sendOrderStatusUpdateEmail = async (order, customerEmail, oldStatus, newStatus) => {
//   console.log('📧 Sending order status update email to customer...');

//   try {
//     if (!customerEmail) {
//       throw new Error('Customer email is missing');
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const newStatusColor = getStatusColor(newStatus);
//     const newStatusLabel = getStatusLabel(newStatus);
//     const itemsHTML = generateOrderItemsHTML(order.items);
//     const summaryHTML = generateOrderSummaryHTML(order);
//     const pricingHTML = generatePricingHTML(order);
//     const customerInfoHTML = generateCustomerInfoHTML(order);
//     const deliveryInfoHTML = generateDeliveryInfoHTML(order);

//     const from = await getFromAddress('order');

//     // Generate PDF invoice
//     let pdfBuffer = null;
//     try {
//       console.log('📄 Generating PDF invoice for status update - Order:', order.orderNumber);
//       const pdfResult = await generateInvoicePDF(order);
//       if (pdfResult && pdfResult.buffer) {
//         pdfBuffer = pdfResult.buffer;
//         console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
//       } else {
//         console.warn('⚠️ PDF generation returned no buffer');
//       }
//     } catch (pdfError) {
//       console.error('❌ PDF generation error:', pdfError.message);
//     }

//     let statusMessage = '';
//     let statusEmoji = '';

//     switch(newStatus) {
//       case 'placed':
//         statusMessage = 'Your order has been placed successfully. We are processing your order.';
//         statusEmoji = '📦';
//         break;
//       case 'follow_up':
//         statusMessage = 'Your order is being reviewed by our team. We will contact you shortly.';
//         statusEmoji = '📞';
//         break;
//       case 'accepted':
//         statusMessage = 'Great news! Your order has been accepted and is being prepared.';
//         statusEmoji = '✅';
//         break;
//       case 'approved':
//         statusMessage = 'Your order has been approved and is ready for processing.';
//         statusEmoji = '✅';
//         break;
//       case 'ready_to_ship':
//         statusMessage = 'Your order is packed and ready to be shipped!';
//         statusEmoji = '📦';
//         break;
//       case 'courier_assigned':
//         statusMessage = 'A courier has been assigned to deliver your order.';
//         statusEmoji = '🚚';
//         break;
//       case 'processing':
//         const courierName = order.deliveryService?.courierName || 'courier';
//         statusMessage = `Your order has been assigned to ${courierName} for delivery. You can now track your order using the tracking details below.`;
//         statusEmoji = '🚚';
//         break;
//       case 'shipped':
//         statusMessage = 'Your order has been shipped and is on its way to you!';
//         statusEmoji = '🚚';
//         break;
//       case 'out_for_delivery':
//         statusMessage = 'Your order is out for delivery! Get ready to receive it.';
//         statusEmoji = '🚚';
//         break;
//       case 'delivered':
//         statusMessage = 'Your order has been delivered! We hope you love your new products.';
//         statusEmoji = '🎁';
//         break;
//       case 'cancelled':
//         statusMessage = 'Your order has been cancelled. If you have any questions, please contact our support team.';
//         statusEmoji = '❌';
//         break;
//       case 'rejected':
//         statusMessage = 'Your order has been rejected. Please contact our support team for more information.';
//         statusEmoji = '❌';
//         break;
//       case 'reminder':
//         statusMessage = 'A reminder has been sent regarding your order.';
//         statusEmoji = '⏰';
//         break;
//       default:
//         statusMessage = `Your order status has been updated to ${newStatusLabel}.`;
//         statusEmoji = '📝';
//     }

//     const subject = `${statusEmoji} Order ${newStatusLabel}! - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #263b32; margin: 0; padding: 0; background-color: #FDF7EF; }
//           .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(101, 112, 93, 0.1); border: 1px solid #e2e3dd; }
//           .header { background: linear-gradient(135deg, #65705d, #8B9D83); padding: 30px; text-align: center; }
//           .header h1 { color: #FFFFFF; margin: 0; font-size: 28px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; }
//           .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; }
//           .content { padding: 35px 30px; }
//           .status-box { background: ${newStatusColor}10; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${newStatusColor}; border: 1px solid ${newStatusColor}30; }
//           .status-badge { display: inline-block; padding: 8px 24px; background: ${newStatusColor}; color: #FFFFFF; border-radius: 40px; font-weight: 600; text-transform: uppercase; font-size: 14px; }
//           .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #263b32; }
//           .button { background: linear-gradient(135deg, #65705d, #8B9D83); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none; }
//           .button:hover { opacity: 0.9; }
//           .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e3dd; text-align: center; }
//           p { color: #53645a; }
//           strong { color: #263b32; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>${statusEmoji}</span>
//               <span>Order ${newStatusLabel}!</span>
//             </h1>
//             <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
//           </div>
//           <div class="content">
//             <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>

//             <div class="status-box">
//               <div class="status-badge">${newStatusLabel.toUpperCase()}</div>
//               <p style="margin: 15px 0 0 0;">${statusMessage}</p>
//             </div>

//             ${summaryHTML}
//             ${customerInfoHTML}
//             ${deliveryInfoHTML}

//             <div class="section-title">
//               <span>🛍️</span>
//               <span>Order Items</span>
//             </div>
//             ${itemsHTML}

//             ${pricingHTML}

//             <div style="margin: 35px 0 25px; text-align: center;">
//               <a href="${frontendUrl}/track" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #65705d, #8B9D83); border-radius: 8px; font-weight: 600; font-size: 16px; border: none;">
//                 View Order Details
//               </a>
//             </div>

//             <div class="footer">
//               <p style="margin-bottom: 5px;">With love,</p>
//               <p style="margin: 0; font-weight: bold; color: #65705d;">BeautyBucket Team</p>
//               <p style="font-size: 12px; color: #8a9284; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
//               <p style="font-size: 11px; color: #8a9284; margin-top: 5px;">Beauty is our passion. Thank you for being part of our beauty community!</p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const attachments = [];
//     if (pdfBuffer) {
//       attachments.push({
//         filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
//         content: pdfBuffer,
//         contentType: 'application/pdf'
//       });
//       console.log('📎 PDF attachment added to status update email');
//     }

//     const result = await sendEmailWithAttachment(
//       customerEmail,
//       subject,
//       html,
//       attachments,
//       'order',
//       false
//     );

//     if (result.success) {
//       console.log('✅ Order status update email sent to customer:', result.messageId);
//       return { success: true };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Status update email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send payment status update email to customer with invoice attachment
//  */
// const sendPaymentStatusUpdateEmail = async (order, customerEmail, oldStatus, newStatus) => {
//   console.log('📧 Sending payment status update email to customer...');

//   try {
//     if (!customerEmail) {
//       throw new Error('Customer email is missing');
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const itemsHTML = generateOrderItemsHTML(order.items);
//     const summaryHTML = generateOrderSummaryHTML(order);
//     const pricingHTML = generatePricingHTML(order);
//     const customerInfoHTML = generateCustomerInfoHTML(order);

//     const from = await getFromAddress('order');

//     // Generate PDF invoice
//     let pdfBuffer = null;
//     try {
//       console.log('📄 Generating PDF invoice for payment update - Order:', order.orderNumber);
//       const pdfResult = await generateInvoicePDF(order);
//       if (pdfResult && pdfResult.buffer) {
//         pdfBuffer = pdfResult.buffer;
//         console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
//       } else {
//         console.warn('⚠️ PDF generation returned no buffer');
//       }
//     } catch (pdfError) {
//       console.error('❌ PDF generation error:', pdfError.message);
//     }

//     let statusMessage = '';
//     let statusEmoji = '';
//     let statusColor = '#65705d';

//     switch(newStatus) {
//       case 'paid':
//         statusMessage = 'Your payment has been successfully received. Thank you for your purchase!';
//         statusEmoji = '✅';
//         statusColor = '#5b7d4f';
//         break;
//       case 'failed':
//         statusMessage = 'Your payment has failed. Please try again or contact your bank.';
//         statusEmoji = '❌';
//         statusColor = '#a14b3a';
//         break;
//       case 'refunded':
//         statusMessage = 'Your payment has been refunded. The amount will be credited back to your original payment method within 3-5 business days.';
//         statusEmoji = '💰';
//         statusColor = '#8a9284';
//         break;
//       case 'partial':
//         statusMessage = 'Your payment has been partially received. Please complete the remaining payment.';
//         statusEmoji = '💳';
//         statusColor = '#a67a2e';
//         break;
//       default:
//         statusMessage = `Your payment status has been updated to ${newStatus}.`;
//         statusEmoji = '📝';
//         statusColor = '#65705d';
//     }

//     const subject = `${statusEmoji} Payment Status Update - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #263b32; margin: 0; padding: 0; background-color: #FDF7EF; }
//           .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(101, 112, 93, 0.1); border: 1px solid #e2e3dd; }
//           .header { background: linear-gradient(135deg, #65705d, #8B9D83); padding: 30px; text-align: center; }
//           .header h1 { color: #FFFFFF; margin: 0; font-size: 28px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; }
//           .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; }
//           .content { padding: 35px 30px; }
//           .status-box { background: ${statusColor}10; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${statusColor}; border: 1px solid ${statusColor}30; }
//           .status-badge { display: inline-block; padding: 8px 24px; background: ${statusColor}; color: #FFFFFF; border-radius: 40px; font-weight: 600; text-transform: uppercase; font-size: 14px; }
//           .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #263b32; }
//           .button { background: linear-gradient(135deg, #65705d, #8B9D83); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none; }
//           .button:hover { opacity: 0.9; }
//           .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e3dd; text-align: center; }
//           p { color: #53645a; }
//           strong { color: #263b32; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>${statusEmoji}</span>
//               <span>Payment Status Update</span>
//             </h1>
//             <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
//           </div>
//           <div class="content">
//             <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>

//             <div class="status-box">
//               <div class="status-badge">${newStatus.toUpperCase()}</div>
//               <p style="margin: 15px 0 0 0;">${statusMessage}</p>
//             </div>

//             ${summaryHTML}
//             ${customerInfoHTML}

//             <div class="section-title">
//               <span>🛍️</span>
//               <span>Order Items</span>
//             </div>
//             ${itemsHTML}

//             ${pricingHTML}

//             <div style="margin: 35px 0 25px; text-align: center;">
//               <a href="${frontendUrl}/customer/orders" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #65705d, #8B9D83); border-radius: 8px; font-weight: 600; font-size: 16px; border: none;">
//                 View Order Details
//               </a>
//             </div>

//             <div class="footer">
//               <p style="margin-bottom: 5px;">With love,</p>
//               <p style="margin: 0; font-weight: bold; color: #65705d;">BeautyBucket Team</p>
//               <p style="font-size: 12px; color: #8a9284; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
//               <p style="font-size: 11px; color: #8a9284; margin-top: 5px;">Beauty is our passion. Thank you for being part of our beauty community!</p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const attachments = [];
//     if (pdfBuffer) {
//       attachments.push({
//         filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
//         content: pdfBuffer,
//         contentType: 'application/pdf'
//       });
//       console.log('📎 PDF attachment added to payment update email');
//     }

//     const result = await sendEmailWithAttachment(
//       customerEmail,
//       subject,
//       html,
//       attachments,
//       'order',
//       false
//     );

//     if (result.success) {
//       console.log('✅ Payment status update email sent to customer:', result.messageId);
//       return { success: true };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Payment status update email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = {
//   sendOrderPlacedEmail,
//   sendOrderNotificationToAdmin,
//   sendOrderStatusUpdateEmail,
//   sendPaymentStatusUpdateEmail
// };


// utils/orderEmailService.js
const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('./pdfGenerator');
const { sendEmail, sendEmailWithAttachment, getFromAddress, getOwnerEmail } = require('./emailService');

// Nishita's Creation Brand Colors - Red / Black / Cream
const BRAND_COLORS = {
  primary: '#CF1B34',          // Brand Red
  primaryLight: '#F2F1E6',     // Warm Cream
  primaryDark: '#a81428',      // Deep Red
  secondary: '#e33a52',        // Light Red accent
  white: '#FFFFFF',
  black: '#000000',
  text: '#1a1a1a',             // Ink
  textLight: '#333333',        // Deep Ink
  textMuted: '#9a9a9a',        // Soft Muted
  border: '#e6e4d8',           // Warm cream border
  lightBg: '#F2F1E6',          // Warm cream bg
  success: '#4c8a5b',          // Green (Paid)
  error: '#a81428',            // Deep red (Failed/Cancelled)
  warning: '#b8860b',          // Amber (Pending/Partial)
  gold: '#b8860b'              // Amber accent
};

/**
 * Format currency (BDT)
 */
const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  return `৳${numPrice.toFixed(2)}`;
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'N/A';
  }
};

/**
 * Get status badge color — Red/Black/Cream palette
 */
const getStatusColor = (status) => {
  const statusColors = {
    'placed': '#CF1B34',
    'follow_up': '#CF1B34',
    'accepted': '#CF1B34',
    'approved': '#CF1B34',
    'ready_to_ship': '#CF1B34',
    'courier_assigned': '#CF1B34',
    'rejected': '#a81428',
    'cancelled': '#a81428',
    'reminder': '#b8860b',
    'processing': '#CF1B34',
    'shipped': '#CF1B34',
    'out_for_delivery': '#b8860b',
    'delivered': '#4c8a5b',
    'refunded': '#6b6b6b',
    'failed': '#a81428',
    'hold': '#b8860b',
    'partial_delivery': '#b8860b',
    'returned': '#8a5c8c'
  };
  return statusColors[status] || '#CF1B34';
};

const getPaymentStatusColor = (status) => {
  const statusColors = {
    'pending': '#b8860b',
    'paid': '#4c8a5b',
    'failed': '#a81428',
    'refunded': '#6b6b6b',
    'partial': '#b8860b'
  };
  return statusColors[status] || '#CF1B34';
};

/**
 * Get status display label
 */
const getStatusLabel = (status) => {
  const labels = {
    'placed': 'Order Placed',
    'follow_up': 'Follow Up',
    'accepted': 'Accepted',
    'approved': 'Approved',
    'ready_to_ship': 'Ready to Ship',
    'courier_assigned': 'Courier Assigned',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'reminder': 'Reminder',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'hold': 'On Hold',
    'partial_delivery': 'Partial Delivery',
    'returned': 'Returned'
  };
  return labels[status] || status;
};

/**
 * ============================================================
 * ✅ GROUP ITEMS BY PRODUCT WITH NESTED VARIANTS
 * (unchanged — only colors below are different)
 * ============================================================
 */
const groupItemsForEmail = (items) => {
  if (!items || items.length === 0) return [];

  const productGroups = {};

  items.forEach((item) => {
    let productId = item.productId;
    if (productId && typeof productId === 'object' && productId._id) {
      productId = productId._id.toString();
    } else if (productId) {
      productId = productId.toString();
    } else {
      productId = `item-${Math.random()}`;
    }

    const productName = item.productName || item.name || 'Unknown Product';
    const image = item.image || '';
    const unit = item.unit || 'pcs';
    const regularPrice = item.regularPrice || 0;
    const discountPrice = item.discountPrice || 0;

    if (!productGroups[productId]) {
      productGroups[productId] = {
        productId,
        productName,
        image,
        unit,
        regularPrice,
        discountPrice,
        baseRows: [],
        colorRows: [],
        variantRows: [],
        totalQuantity: 0,
        hasVariants: false
      };
    }

    const group = productGroups[productId];
    const hasValidColor = item.selectedColor &&
      item.selectedColor !== 'null' &&
      item.selectedColor !== '' &&
      item.selectedColor !== 'undefined';

    // CASE 1: NESTED variantDetails[]
    if (item.variantDetails && Array.isArray(item.variantDetails) && item.variantDetails.length > 0) {
      group.hasVariants = true;

      item.variantDetails.forEach((variant) => {
        const hasSubVariants = variant.subVariants && variant.subVariants.length > 0;

        const variantPrice = variant.variantDiscountPrice > 0
          ? Number(variant.variantDiscountPrice)
          : Number(variant.variantRegularPrice) || 0;
        const variantOriginalPrice = Number(variant.variantRegularPrice) || 0;
        const variantHasDiscount = variantPrice > 0 && variantOriginalPrice > variantPrice;

        if (hasSubVariants) {
          const isHeaderOnly = (variant.quantity || 0) === 0;

          group.variantRows.push({
            type: 'variant',
            variantId: variant.variantId,
            variantName: variant.variantName || 'Variant',
            subVariantId: null,
            subVariantName: null,
            selectedColor: variant.selectedColor || null,
            quantity: variant.quantity || 0,
            price: variantPrice,
            originalPrice: variantOriginalPrice,
            hasDiscount: variantHasDiscount,
            image: variant.image || '',
            unit: unit,
            isSubVariant: false,
            isVariant: true,
            isHeader: isHeaderOnly
          });

          if (variant.quantity > 0) group.totalQuantity += variant.quantity;

          variant.subVariants.forEach((sub) => {
            const subPrice = sub.subVariantDiscountPrice > 0
              ? Number(sub.subVariantDiscountPrice)
              : Number(sub.subVariantRegularPrice) || 0;
            const subOriginalPrice = Number(sub.subVariantRegularPrice) || 0;
            const subHasDiscount = subPrice > 0 && subOriginalPrice > subPrice;

            group.variantRows.push({
              type: 'subVariant',
              variantId: variant.variantId,
              variantName: variant.variantName || 'Variant',
              subVariantId: sub.subVariantId,
              subVariantName: sub.subVariantName || 'Sub-Variant',
              selectedColor: sub.selectedColor || variant.selectedColor || null,
              quantity: sub.quantity || 0,
              price: subPrice,
              originalPrice: subOriginalPrice,
              hasDiscount: subHasDiscount,
              image: sub.image || variant.image || '',
              unit: unit,
              isSubVariant: true,
              isVariant: false
            });

            group.totalQuantity += sub.quantity || 0;
          });
        } else {
          group.variantRows.push({
            type: 'variant',
            variantId: variant.variantId,
            variantName: variant.variantName || 'Variant',
            subVariantId: null,
            subVariantName: null,
            selectedColor: variant.selectedColor || null,
            quantity: variant.quantity || 0,
            price: variantPrice,
            originalPrice: variantOriginalPrice,
            hasDiscount: variantHasDiscount,
            image: variant.image || '',
            unit: unit,
            isSubVariant: false,
            isVariant: true
          });

          group.totalQuantity += variant.quantity || 0;
        }
      });

      return;
    }

    // CASE 2: FLAT VARIANT FIELDS
    const isSubVariant = !!(item.subVariantId && item.subVariantId !== 'null' && item.subVariantId !== '');
    const isVariant = !!(item.variantId && item.variantId !== 'null' && item.variantId !== '');

    if (isVariant || isSubVariant) {
      group.hasVariants = true;

      const variantPrice = item.variantDiscountPrice > 0
        ? Number(item.variantDiscountPrice)
        : Number(item.variantRegularPrice) > 0
          ? Number(item.variantRegularPrice)
          : Number(item.discountPrice) || Number(item.regularPrice) || 0;

      const originalPrice = Number(item.variantRegularPrice) > 0
        ? Number(item.variantRegularPrice)
        : Number(item.regularPrice) || 0;

      const hasDiscount = originalPrice > 0 && variantPrice > 0 && variantPrice < originalPrice;

      group.variantRows.push({
        type: isSubVariant ? 'subVariant' : 'variant',
        variantId: item.variantId || null,
        variantName: item.variantName || 'Variant',
        subVariantId: item.subVariantId || null,
        subVariantName: item.subVariantName || null,
        selectedColor: hasValidColor ? item.selectedColor : null,
        quantity: item.quantity || 0,
        price: variantPrice,
        originalPrice,
        hasDiscount,
        image: item.variantImage || item.image || '',
        unit: unit,
        isSubVariant,
        isVariant: !isSubVariant
      });

      group.totalQuantity += item.quantity || 0;
      return;
    }

    // CASE 3: COLOR ITEMS
    if (item.colors && Array.isArray(item.colors) && item.colors.length > 0) {
      const validColors = item.colors.filter(c =>
        c.color && c.color !== 'null' && c.color !== '' && c.color !== 'undefined'
      );

      if (validColors.length > 0) {
        validColors.forEach(c => {
          const qty = c.quantity || 0;
          const p = c.price || item.discountPrice || item.regularPrice || 0;

          const existing = group.colorRows.find(gc => gc.color === c.color);
          if (existing) {
            existing.quantity += qty;
          } else {
            group.colorRows.push({ color: c.color, quantity: qty, price: p });
          }
          group.totalQuantity += qty;
        });
        return;
      }
    }

    if (hasValidColor) {
      const qty = item.quantity || 0;
      const p = item.discountPrice || item.regularPrice || 0;

      const existing = group.colorRows.find(gc => gc.color === item.selectedColor);
      if (existing) {
        existing.quantity += qty;
      } else {
        group.colorRows.push({
          color: item.selectedColor,
          quantity: qty,
          price: p
        });
      }
      group.totalQuantity += qty;
      return;
    }

    // CASE 4: BASE
    group.baseRows.push({
      quantity: item.quantity || 0,
      price: item.discountPrice || item.regularPrice || 0
    });
    group.totalQuantity += item.quantity || 0;
  });

  return Object.values(productGroups);
};

/**
 * ============================================================
 * ✅ GENERATE ORDER ITEMS HTML — Red/Black/Cream palette
 * ============================================================
 */
const generateOrderItemsHTML = (items) => {
  if (!items || items.length === 0) {
    return '<p style="color: #9a9a9a; text-align: center; padding: 20px;">No items found</p>';
  }

  const groupedItems = groupItemsForEmail(items);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  let html = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: 'Raleway', 'Segoe UI', Arial, sans-serif;">
      <thead>
        <tr style="background: #F2F1E6; border-bottom: 2px solid #e6e4d8;">
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 40%;">Product / Variant</th>
          <th style="padding: 12px; text-align: center; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 12%;">Color</th>
          <th style="padding: 12px; text-align: center; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 8%;">Qty</th>
          <th style="padding: 12px; text-align: center; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 10%;">Unit</th>
          <th style="padding: 12px; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 15%;">Price</th>
          <th style="padding: 12px; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 13px; width: 15%;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  groupedItems.forEach((group, groupIndex) => {
    const imageUrl = group.image && group.image.startsWith('http')
      ? group.image
      : (group.image ? `${frontendUrl}${group.image}` : 'https://via.placeholder.com/60/CF1B34/F2F1E6?text=NC');

    const rows = [];
    const hasVariants = group.variantRows.length > 0;

    if (hasVariants) {
      let productTotal = 0;
      let productQty = 0;

      group.baseRows.forEach(br => {
        productTotal += br.price * br.quantity;
        productQty += br.quantity;
      });
      group.colorRows.forEach(c => {
        productTotal += c.price * c.quantity;
        productQty += c.quantity;
      });
      group.variantRows.forEach(v => {
        productTotal += v.price * v.quantity;
        productQty += v.quantity;
      });

      rows.push({
        kind: 'product-header',
        name: group.productName,
        color: null,
        quantity: productQty,
        price: productQty > 0 ? productTotal / productQty : 0,
        originalPrice: null,
        hasDiscount: false,
        unit: group.unit,
        indent: 0,
        badge: 'Product',
        image: imageUrl,
        isHeaderOnly: false,
        showPrice: false,
        rowTotal: productTotal,
        showVariantsNote: true
      });

      group.baseRows.forEach((br) => {
        rows.push({
          kind: 'base',
          name: group.productName,
          color: null,
          quantity: br.quantity,
          price: br.price,
          originalPrice: null,
          hasDiscount: false,
          unit: group.unit,
          indent: 1,
          badge: null,
          image: null,
          isHeaderOnly: false,
          rowTotal: br.price * br.quantity
        });
      });

      group.colorRows.forEach((c) => {
        rows.push({
          kind: 'color',
          name: group.productName,
          color: c.color,
          quantity: c.quantity,
          price: c.price,
          originalPrice: null,
          hasDiscount: false,
          unit: group.unit,
          indent: 1,
          badge: null,
          image: null,
          isHeaderOnly: false,
          rowTotal: c.price * c.quantity
        });
      });

      const variantGroups = {};
      group.variantRows.forEach(v => {
        const key = v.variantId || 'unknown';
        if (!variantGroups[key]) variantGroups[key] = [];
        variantGroups[key].push(v);
      });

      Object.values(variantGroups).forEach(variants => {
        variants.sort((a, b) => {
          if (!a.isSubVariant && b.isSubVariant) return -1;
          if (a.isSubVariant && !b.isSubVariant) return 1;
          return 0;
        });

        const hasSubVariantInGroup = variants.some(v => v.isSubVariant);

        variants.forEach((v) => {
          const isVariantRow = !v.isSubVariant;
          const isHeaderOnly = isVariantRow
            && hasSubVariantInGroup
            && (v.quantity || 0) === 0;

          rows.push({
            kind: isVariantRow ? 'variant' : 'subVariant',
            name: isVariantRow ? v.variantName : v.subVariantName,
            parentVariantName: v.variantName,
            color: v.selectedColor,
            quantity: v.quantity,
            price: v.price,
            originalPrice: v.originalPrice,
            hasDiscount: v.hasDiscount,
            unit: v.unit,
            indent: isVariantRow ? 1 : 2,
            badge: isVariantRow ? 'Variant' : 'Sub',
            image: null,
            isHeaderOnly,
            rowTotal: v.price * v.quantity
          });
        });
      });
    } else {
      group.baseRows.forEach((br) => {
        rows.push({
          kind: 'base',
          name: group.productName,
          color: null,
          quantity: br.quantity,
          price: br.price,
          originalPrice: null,
          hasDiscount: false,
          unit: group.unit,
          indent: 0,
          badge: null,
          image: imageUrl,
          isHeaderOnly: false,
          isFirstOfGroup: rows.length === 0,
          rowTotal: br.price * br.quantity
        });
      });

      group.colorRows.forEach((c) => {
        rows.push({
          kind: 'color',
          name: group.productName,
          color: c.color,
          quantity: c.quantity,
          price: c.price,
          originalPrice: null,
          hasDiscount: false,
          unit: group.unit,
          indent: 0,
          badge: null,
          image: imageUrl,
          isHeaderOnly: false,
          isFirstOfGroup: rows.length === 0,
          rowTotal: c.price * c.quantity
        });
      });
    }

    rows.forEach((row, rowIndex) => {
      const indent = row.indent || 0;
      const paddingLeft = indent === 0 ? '0' : indent === 1 ? '20px' : '40px';
      const hasColor = !!row.color;
      const isHeaderOnly = row.isHeaderOnly;
      const isProductRow = row.kind === 'product-header';
      const isBaseOrColorRow = row.kind === 'base' || row.kind === 'color';
      const isFirstOfGroup = row.isFirstOfGroup || isProductRow;

      const hidePrice = isHeaderOnly || row.showPrice === false;
      const hideTotal = isHeaderOnly || row.showPrice === false;

      const rowTotal = row.rowTotal !== undefined
        ? row.rowTotal
        : row.price * row.quantity;

      html += `
        <tr style="border-bottom: 1px solid #e6e4d8; ${
          indent === 2 ? 'background: #f8ebed;' :
          indent === 1 ? 'background: #fcf4f5;' : ''
        }">
          <!-- Product / Variant Column -->
          <td style="padding: 12px; vertical-align: middle;">
            <div style="padding-left: ${paddingLeft}; display: flex; align-items: center; gap: 10px;">
              ${
                isFirstOfGroup && row.image
                  ? `<img src="${row.image}" alt="${row.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e6e4d8; flex-shrink: 0;">`
                  : indent > 0
                    ? `<span style="width: 20px; flex-shrink: 0; color: #9a9a9a; font-size: 14px;">${indent === 2 ? '&gt;&gt;' : '&gt;'}</span>`
                    : ''
              }
              <div style="min-width: 0;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
                  <strong style="color: ${
                    isProductRow ? '#1a1a1a' :
                    isBaseOrColorRow ? '#1a1a1a' :
                    indent === 1 ? '#a81428' : '#6b6b6b'
                  }; font-size: ${
                    isProductRow ? '14px' : '13px'
                  }; font-weight: ${
                    isProductRow ? '700' : indent === 1 ? '600' : '400'
                  };">
                    ${row.name}
                  </strong>
                  ${
                    row.badge
                      ? `<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; ${
                          row.badge === 'Product' ? 'background: #F2F1E6; color: #6b6b6b;' :
                          row.badge === 'Variant' ? 'background: #fcf4f5; color: #a81428;' :
                          'background: #f8ebed; color: #6b6b6b;'
                        }">${row.badge}</span>`
                      : ''
                  }
                  ${
                    row.showVariantsNote
                      ? `<span style="font-size: 11px; color: #9a9a9a; font-style: italic;">(See variants below)</span>`
                      : ''
                  }
                  ${
                    row.hasDiscount && !isHeaderOnly && !isProductRow
                      ? `<span style="font-size: 10px; color: #4c8a5b; background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">Save ${Math.round(((row.originalPrice - row.price) / row.originalPrice) * 100)}%</span>`
                      : ''
                  }
                </div>
              </div>
            </div>
          </td>

          <!-- Color Column -->
          <td style="padding: 12px; text-align: center; vertical-align: middle;">
            ${
              hasColor
                ? `<div style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #e6e4d8; background-color: ${row.color};"></div>`
                : `<span style="color: #9a9a9a; font-size: 12px;">-</span>`
            }
          </td>

          <!-- Qty Column -->
          <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 14px; color: #1a1a1a; font-weight: 500;">
            ${isHeaderOnly ? '<span style="color: #9a9a9a;">-</span>' : (row.quantity || 0)}
          </td>

          <!-- Unit Column -->
          <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 13px; color: #333333;">
            ${isHeaderOnly ? '' : (row.unit || 'pcs')}
          </td>

          <!-- Price Column -->
          <td style="padding: 12px; text-align: right; vertical-align: middle; font-size: 14px; color: #1a1a1a;">
            ${
              hidePrice
                ? '<span style="color: #9a9a9a;">-</span>'
                : row.hasDiscount
                  ? `<span style="color: #4c8a5b; font-weight: 500;">${formatPrice(row.price)}</span>
                     <span style="color: #9a9a9a; text-decoration: line-through; margin-left: 4px; font-size: 12px;">${formatPrice(row.originalPrice)}</span>`
                  : formatPrice(row.price)
            }
          </td>

          <!-- Total Column -->
          <td style="padding: 12px; text-align: right; vertical-align: middle; font-weight: 600; color: #CF1B34; font-size: 14px;">
            ${hideTotal ? '<span style="color: #9a9a9a;">-</span>' : formatPrice(rowTotal)}
          </td>
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

/**
 * Generate order summary HTML
 */
const generateOrderSummaryHTML = (order) => {
  const statusColor = getStatusColor(order.orderStatus);
  const paymentStatusColor = getPaymentStatusColor(order.paymentStatus);
  const statusLabel = getStatusLabel(order.orderStatus);

  return `
    <div style="background: #F2F1E6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e6e4d8;">
      <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif;">Order Summary</h2>
      <table style="width: 100%; border-collapse: collapse; font-family: 'Raleway', Arial, sans-serif;">
        <tr>
          <td style="padding: 8px 0; width: 140px; color: #6b6b6b;"><strong>Order ID:</strong></td>
          <td style="color: #CF1B34; font-weight: 600;">${order.orderNumber || order._id.slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Order Date:</strong></td>
          <td style="color: #1a1a1a;">${formatDate(order.createdAt)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Order Status:</strong></td>
          <td><span style="display: inline-block; padding: 4px 12px; background: ${statusColor}20; color: ${statusColor}; border-radius: 20px; font-size: 12px; font-weight: 600;">${statusLabel}</span></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Payment Status:</strong></td>
          <td><span style="display: inline-block; padding: 4px 12px; background: ${paymentStatusColor}20; color: ${paymentStatusColor}; border-radius: 20px; font-size: 12px; font-weight: 600;">${order.paymentStatus.toUpperCase()}</span></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Payment Method:</strong></td>
          <td style="color: #1a1a1a;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online Payment' : order.paymentMethod.toUpperCase()}</td>
        </tr>
        ${order.paymentMethod === 'cod' ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Payment Due:</strong></td>
          <td style="color: #1a1a1a;">Pay when you receive your order</td>
        </tr>
        ` : ''}
        ${order.couponCode ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Coupon Applied:</strong></td>
          <td style="color: #CF1B34; font-weight: 600;">${order.couponCode}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
};

/**
 * Generate pricing breakdown HTML
 */
const generatePricingHTML = (order) => {
  return `
    <div style="background: #F2F1E6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e6e4d8;">
      <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif;">Price Breakdown</h2>
      <table style="width: 100%; border-collapse: collapse; font-family: 'Raleway', Arial, sans-serif;">
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Subtotal:</strong></td>
          <td style="text-align: right; color: #1a1a1a;">${formatPrice(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Shipping:</strong></td>
          <td style="text-align: right; color: #1a1a1a;">${formatPrice(order.shippingCost)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #4c8a5b;"><strong>Discount:</strong></td>
          <td style="text-align: right; color: #4c8a5b;">-${formatPrice(order.discount)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #e6e4d8; margin-top: 10px;">
          <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #1a1a1a;"><strong>Total:</strong></td>
          <td style="padding: 12px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #CF1B34;">${formatPrice(order.total)}</td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Generate customer info HTML
 */
const generateCustomerInfoHTML = (order) => {
  return `
    <div style="background: #F2F1E6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e6e4d8;">
      <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif;">Customer Information</h2>
      <table style="width: 100%; border-collapse: collapse; font-family: 'Raleway', Arial, sans-serif;">
        <tr>
          <td style="padding: 8px 0; width: 120px; color: #6b6b6b;"><strong>Name:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo?.fullName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Email:</strong></td>
          <td><a href="mailto:${order.customerInfo?.email}" style="color: #CF1B34; text-decoration: none; font-weight: 600;">${order.customerInfo?.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Phone:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo?.phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Address:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo?.address || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Division:</strong></td>
          <td style="color: #1a1a1a; font-weight: 600;">${order.customerInfo?.division || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>City:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo?.city || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Upazila/Thana:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo?.zone || 'N/A'}</td>
        </tr>
        ${order.customerInfo?.area ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Union/Area:</strong></td>
          <td style="color: #1a1a1a;">${order.customerInfo.area}</td>
        </tr>
        ` : ''}
        ${order.customerInfo?.note ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Order Note:</strong></td>
          <td style="color: #333333;">${order.customerInfo.note}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
};

/**
 * Generate delivery info HTML
 */
const generateDeliveryInfoHTML = (order) => {
  const hasDeliveryNote = order.deliveryNote && order.deliveryNote.trim() !== '';
  const hasTrackingNumber = order.trackingNumber && order.trackingNumber.trim() !== '';
  const hasDeliveredDate = order.deliveredAt && order.orderStatus === 'delivered';
  const hasCancellationReason = order.cancellationReason && order.cancellationReason.trim() !== '' && order.orderStatus === 'cancelled';
  const hasRejectionReason = order.rejectionReason && order.rejectionReason.trim() !== '' && order.orderStatus === 'rejected';

  const hasCourier = order.deliveryService && order.deliveryService.courierName;
  const hasTrackingUrl = order.deliveryService && order.deliveryService.trackingUrl;
  const hasCourierOrderId = order.deliveryService && order.deliveryService.courierOrderId;

  if (!hasDeliveryNote && !hasTrackingNumber && !hasDeliveredDate && !hasCancellationReason && !hasRejectionReason && !hasCourier) {
    return '';
  }

  let bgColor = '#F2F1E6';
  let borderColor = '#CF1B34';
  let titleColor = '#1a1a1a';
  let titleIcon = '📝';

  if (order.orderStatus === 'delivered') {
    bgColor = '#f0fdf4';
    borderColor = '#4c8a5b';
    titleColor = '#4c8a5b';
    titleIcon = '✅';
  } else if (['shipped', 'out_for_delivery'].includes(order.orderStatus)) {
    bgColor = '#F2F1E6';
    borderColor = '#CF1B34';
    titleColor = '#CF1B34';
    titleIcon = '🚚';
  } else if (order.orderStatus === 'processing' || order.orderStatus === 'courier_assigned') {
    bgColor = '#F2F1E6';
    borderColor = '#CF1B34';
    titleColor = '#CF1B34';
    titleIcon = '📦';
  } else if (order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') {
    bgColor = '#fef2f3';
    borderColor = '#a81428';
    titleColor = '#a81428';
    titleIcon = '❌';
  }

  let reasonText = '';
  if (order.orderStatus === 'cancelled' && hasCancellationReason) {
    reasonText = `Cancellation Reason: ${order.cancellationReason}`;
  } else if (order.orderStatus === 'rejected' && hasRejectionReason) {
    reasonText = `Rejection Reason: ${order.rejectionReason}`;
  }

  return `
    <div style="background: ${bgColor}; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${borderColor}; border: 1px solid ${borderColor}30; font-family: 'Raleway', Arial, sans-serif;">
      <h2 style="margin: 0 0 15px 0; color: ${titleColor}; font-size: 18px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
        <span>${titleIcon}</span> <span>${getStatusLabel(order.orderStatus)}</span>
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${reasonText ? `
        <tr>
          <td style="padding: 8px 0; width: 140px; color: #6b6b6b;"><strong>${order.orderStatus === 'cancelled' ? 'Cancellation' : 'Rejection'} Reason:</strong></td>
          <td><div style="background: #FFFFFF; padding: 12px; border-radius: 8px; margin-top: 5px; color: ${borderColor}; border: 1px solid ${borderColor}30;">${reasonText}</div></td>
        </tr>
        ` : ''}
        ${hasDeliveredDate ? `
        <tr>
          <td style="padding: 8px 0; width: 140px; color: #6b6b6b;"><strong>Delivered Date:</strong></td>
          <td style="color: #1a1a1a;">${formatDate(order.deliveredAt)}</td>
        </tr>
        ` : ''}
        ${hasTrackingNumber ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Tracking Number:</strong></td>
          <td><code style="background: #FFFFFF; padding: 4px 8px; border-radius: 4px; color: #CF1B34; border: 1px solid #e6e4d8; font-weight: 600;">${order.trackingNumber}</code></td>
        </tr>
        ` : ''}
        ${hasCourier ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Courier Service:</strong></td>
          <td style="color: #1a1a1a; font-weight: 600;">${order.deliveryService.courierName}</td>
        </tr>
        ` : ''}
        ${hasCourierOrderId ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Courier Order ID:</strong></td>
          <td style="color: #1a1a1a; font-weight: 600;">${order.deliveryService.courierOrderId}</td>
        </tr>
        ` : ''}
        ${hasTrackingUrl ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Track Your Order:</strong></td>
          <td><a href="${order.deliveryService.trackingUrl}" target="_blank" style="color: #FFFFFF; text-decoration: none; font-weight: 600; display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #a81428, #CF1B34); border-radius: 8px;">📦 Track Order on ${order.deliveryService.courierName || 'Courier'}</a></td>
        </tr>
        ` : ''}
        ${hasDeliveryNote ? `
        <tr>
          <td style="padding: 8px 0; color: #6b6b6b;"><strong>Delivery Note:</strong></td>
          <td><div style="background: #FFFFFF; padding: 12px; border-radius: 8px; margin-top: 5px; color: #1a1a1a; border: 1px solid #e6e4d8;">${order.deliveryNote}</div></td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
};

/**
 * Send order placed email to customer with invoice attachment
 */
const sendOrderPlacedEmail = async (order, customerEmail) => {
  console.log('📧 Sending order placed email to customer...');

  try {
    if (!customerEmail) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateOrderItemsHTML(order.items);
    const summaryHTML = generateOrderSummaryHTML(order);
    const pricingHTML = generatePricingHTML(order);
    const customerInfoHTML = generateCustomerInfoHTML(order);
    const deliveryInfoHTML = generateDeliveryInfoHTML(order);

    const from = await getFromAddress('order');

    let pdfBuffer = null;
    try {
      console.log('📄 Generating PDF invoice for order:', order.orderNumber);
      const pdfResult = await generateInvoicePDF(order);
      if (pdfResult && pdfResult.buffer) {
        pdfBuffer = pdfResult.buffer;
        console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      } else {
        console.warn('⚠️ PDF generation returned no buffer');
      }
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError.message);
    }

    const statusLabel = getStatusLabel(order.orderStatus);
    const statusEmoji = order.orderStatus === 'placed' ? '📦' :
                        order.orderStatus === 'follow_up' ? '📞' :
                        order.orderStatus === 'accepted' ? '✅' :
                        order.orderStatus === 'approved' ? '✅' :
                        order.orderStatus === 'ready_to_ship' ? '📦' :
                        order.orderStatus === 'courier_assigned' ? '🚚' :
                        order.orderStatus === 'rejected' ? '❌' :
                        order.orderStatus === 'cancelled' ? '❌' :
                        order.orderStatus === 'reminder' ? '⏰' :
                        order.orderStatus === 'processing' ? '⚙️' :
                        order.orderStatus === 'shipped' ? '🚚' :
                        order.orderStatus === 'out_for_delivery' ? '🚚' :
                        order.orderStatus === 'delivered' ? '🎁' : '📦';

    const subject = `${statusEmoji} Order ${statusLabel}! - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Raleway', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #F2F1E6; }
          .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 26, 26, 0.08); border: 1px solid #e6e4d8; }
          .header { background: linear-gradient(135deg, #a81428, #CF1B34); padding: 30px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 26px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif; }
          .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; font-family: 'Raleway', Arial, sans-serif; }
          .content { padding: 35px 30px; }
          .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #1a1a1a; font-family: 'Raleway', Arial, sans-serif; }
          .button { background: linear-gradient(135deg, #a81428, #CF1B34); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); }
          .button:hover { opacity: 0.9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e4d8; text-align: center; }
          p { color: #333333; font-family: 'Raleway', Arial, sans-serif; }
          strong { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>${statusEmoji}</span>
              <span>Order ${statusLabel}!</span>
            </h1>
            <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div class="content">
            <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>
            <p style="margin-bottom: 25px; font-size: 16px; color: #1a1a1a;">
              ${order.orderStatus === 'placed' ? 'Thank you for your order! We have received your order and it is now pending confirmation. You will receive another email once your order is confirmed.' :
                order.orderStatus === 'follow_up' ? 'Your order is being reviewed by our team. We will contact you shortly for confirmation.' :
                order.orderStatus === 'accepted' ? 'Great news! Your order has been accepted and is being prepared.' :
                order.orderStatus === 'approved' ? 'Your order has been approved and is ready for processing.' :
                order.orderStatus === 'ready_to_ship' ? 'Your order is packed and ready to be shipped!' :
                order.orderStatus === 'courier_assigned' ? 'A courier has been assigned to deliver your order.' :
                order.orderStatus === 'processing' ? 'Your order is being processed by the courier service.' :
                order.orderStatus === 'shipped' ? 'Your order has been shipped and is on its way to you!' :
                order.orderStatus === 'out_for_delivery' ? 'Your order is out for delivery! Get ready to receive it.' :
                order.orderStatus === 'delivered' ? 'Your order has been delivered! We hope you love your new pieces.' :
                order.orderStatus === 'cancelled' ? 'Your order has been cancelled. If you have any questions, please contact our support team.' :
                order.orderStatus === 'rejected' ? 'Your order has been rejected. Please contact our support team for more information.' :
                'Thank you for your order!'}
            </p>

            ${summaryHTML}
            ${customerInfoHTML}
            ${deliveryInfoHTML}

            <div class="section-title">
              <span>🛍️</span>
              <span>Order Items</span>
            </div>
            ${itemsHTML}

            ${pricingHTML}

            <div style="margin: 35px 0 25px; text-align: center;">
              <a href="${frontendUrl}/track" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #a81428, #CF1B34); border-radius: 50px; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif;">
                Track Your Order
              </a>
            </div>

            <div class="footer">
              <p style="margin-bottom: 5px;">Warm regards,</p>
              <p style="margin: 0; font-weight: bold; color: #CF1B34; font-family: 'Raleway', Arial, sans-serif;">Nishita's Creation</p>
              <p style="font-size: 12px; color: #9a9a9a; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
              <p style="font-size: 11px; color: #9a9a9a; margin-top: 5px;">Handcrafted clothing from Jessore — made with care, worn with pride.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
      console.log('📎 PDF attachment added to email');
    }

    const result = await sendEmailWithAttachment(
      customerEmail,
      subject,
      html,
      attachments,
      'order',
      false
    );

    if (result.success) {
      console.log('✅ Order placed email sent:', result.messageId);
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Order placed email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send order notification email to admin
 */
const sendOrderNotificationToAdmin = async (order, eventType = 'new') => {
  console.log('📧 Sending order notification email to admin...');

  try {
    const ownerEmail = await getOwnerEmail('order');

    if (!ownerEmail) {
      console.warn('⚠️ Owner email not configured. Skipping admin notification.');
      return { success: false, error: 'Owner email not configured' };
    }

    const from = await getFromAddress('order');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateOrderItemsHTML(order.items);
    const summaryHTML = generateOrderSummaryHTML(order);
    const pricingHTML = generatePricingHTML(order);
    const customerInfoHTML = generateCustomerInfoHTML(order);
    const deliveryInfoHTML = generateDeliveryInfoHTML(order);
    const statusLabel = getStatusLabel(order.orderStatus);

    let headerTitle = '';
    let headerEmoji = '';
    let additionalMessage = '';

    if (eventType === 'new') {
      headerTitle = 'New Order Received!';
      headerEmoji = '🛍️';
      additionalMessage = 'A new order has been placed and requires your attention.';
    } else if (eventType === 'status_update') {
      headerTitle = `Order ${statusLabel}`;
      headerEmoji = '📝';
      additionalMessage = `Order status has been updated to "${statusLabel}".`;
    } else if (eventType === 'payment_update') {
      const paymentInfo = {
        'paid': { title: 'Payment Received', emoji: '💰' },
        'failed': { title: 'Payment Failed', emoji: '⚠️' },
        'refunded': { title: 'Payment Refunded', emoji: '💸' },
        'partial': { title: 'Partial Payment', emoji: '💳' }
      };
      const info = paymentInfo[order.paymentStatus] || { title: 'Payment Updated', emoji: '💳' };
      headerTitle = info.title;
      headerEmoji = info.emoji;
      additionalMessage = `Payment status has been updated to "${order.paymentStatus.toUpperCase()}".`;
    }

    const subject = `${headerEmoji} ${headerTitle} - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Raleway', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #F2F1E6; }
          .container { max-width: 700px; margin: 20px auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 26, 26, 0.08); border: 1px solid #e6e4d8; }
          .header { background: linear-gradient(135deg, #a81428, #CF1B34); padding: 25px 30px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif; }
          .content { padding: 30px; }
          .button { background: linear-gradient(135deg, #a81428, #CF1B34); color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; border: none; font-family: 'Raleway', Arial, sans-serif; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); }
          .button:hover { opacity: 0.9; }
          .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; color: #1a1a1a; font-family: 'Raleway', Arial, sans-serif; }
          p { color: #333333; font-family: 'Raleway', Arial, sans-serif; }
          strong { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>${headerEmoji}</span>
              <span>${headerTitle}</span>
            </h1>
          </div>
          <div class="content">
            <p>${additionalMessage}</p>

            ${customerInfoHTML}
            ${summaryHTML}
            ${deliveryInfoHTML}

            <div class="section-title">🛍️ Order Items</div>
            ${itemsHTML}

            ${pricingHTML}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/authorize/orders" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #a81428, #CF1B34); border-radius: 50px; font-weight: 600; font-size: 15px; border: none; cursor: pointer; font-family: 'Raleway', Arial, sans-serif;">
                View Order in Dashboard
              </a>
            </div>

            <div style="background: #F2F1E6; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e6e4d8;">
              <p style="margin: 0; font-size: 14px; color: #CF1B34;">Please review and take necessary action.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(
      ownerEmail,
      subject,
      html,
      null,
      'order'
    );

    if (result.success) {
      console.log('✅ Admin order notification sent:', result.messageId);
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Admin notification error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email to customer with invoice attachment
 */
const sendOrderStatusUpdateEmail = async (order, customerEmail, oldStatus, newStatus) => {
  console.log('📧 Sending order status update email to customer...');

  try {
    if (!customerEmail) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const newStatusColor = getStatusColor(newStatus);
    const newStatusLabel = getStatusLabel(newStatus);
    const itemsHTML = generateOrderItemsHTML(order.items);
    const summaryHTML = generateOrderSummaryHTML(order);
    const pricingHTML = generatePricingHTML(order);
    const customerInfoHTML = generateCustomerInfoHTML(order);
    const deliveryInfoHTML = generateDeliveryInfoHTML(order);

    const from = await getFromAddress('order');

    let pdfBuffer = null;
    try {
      console.log('📄 Generating PDF invoice for status update - Order:', order.orderNumber);
      const pdfResult = await generateInvoicePDF(order);
      if (pdfResult && pdfResult.buffer) {
        pdfBuffer = pdfResult.buffer;
        console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      } else {
        console.warn('⚠️ PDF generation returned no buffer');
      }
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError.message);
    }

    let statusMessage = '';
    let statusEmoji = '';

    switch(newStatus) {
      case 'placed':
        statusMessage = 'Your order has been placed successfully. We are processing your order.';
        statusEmoji = '📦';
        break;
      case 'follow_up':
        statusMessage = 'Your order is being reviewed by our team. We will contact you shortly.';
        statusEmoji = '📞';
        break;
      case 'accepted':
        statusMessage = 'Great news! Your order has been accepted and is being prepared.';
        statusEmoji = '✅';
        break;
      case 'approved':
        statusMessage = 'Your order has been approved and is ready for processing.';
        statusEmoji = '✅';
        break;
      case 'ready_to_ship':
        statusMessage = 'Your order is packed and ready to be shipped!';
        statusEmoji = '📦';
        break;
      case 'courier_assigned':
        statusMessage = 'A courier has been assigned to deliver your order.';
        statusEmoji = '🚚';
        break;
      case 'processing':
        const courierName = order.deliveryService?.courierName || 'courier';
        statusMessage = `Your order has been assigned to ${courierName} for delivery. You can now track your order using the tracking details below.`;
        statusEmoji = '🚚';
        break;
      case 'shipped':
        statusMessage = 'Your order has been shipped and is on its way to you!';
        statusEmoji = '🚚';
        break;
      case 'out_for_delivery':
        statusMessage = 'Your order is out for delivery! Get ready to receive it.';
        statusEmoji = '🚚';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered! We hope you love your new pieces.';
        statusEmoji = '🎁';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled. If you have any questions, please contact our support team.';
        statusEmoji = '❌';
        break;
      case 'rejected':
        statusMessage = 'Your order has been rejected. Please contact our support team for more information.';
        statusEmoji = '❌';
        break;
      case 'reminder':
        statusMessage = 'A reminder has been sent regarding your order.';
        statusEmoji = '⏰';
        break;
      default:
        statusMessage = `Your order status has been updated to ${newStatusLabel}.`;
        statusEmoji = '📝';
    }

    const subject = `${statusEmoji} Order ${newStatusLabel}! - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Raleway', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #F2F1E6; }
          .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 26, 26, 0.08); border: 1px solid #e6e4d8; }
          .header { background: linear-gradient(135deg, #a81428, #CF1B34); padding: 30px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 26px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif; }
          .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; font-family: 'Raleway', Arial, sans-serif; }
          .content { padding: 35px 30px; }
          .status-box { background: ${newStatusColor}10; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${newStatusColor}; border: 1px solid ${newStatusColor}30; }
          .status-badge { display: inline-block; padding: 8px 24px; background: ${newStatusColor}; color: #FFFFFF; border-radius: 40px; font-weight: 600; text-transform: uppercase; font-size: 14px; font-family: 'Raleway', Arial, sans-serif; }
          .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #1a1a1a; font-family: 'Raleway', Arial, sans-serif; }
          .button { background: linear-gradient(135deg, #a81428, #CF1B34); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); }
          .button:hover { opacity: 0.9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e4d8; text-align: center; }
          p { color: #333333; font-family: 'Raleway', Arial, sans-serif; }
          strong { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>${statusEmoji}</span>
              <span>Order ${newStatusLabel}!</span>
            </h1>
            <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div class="content">
            <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>

            <div class="status-box">
              <div class="status-badge">${newStatusLabel.toUpperCase()}</div>
              <p style="margin: 15px 0 0 0;">${statusMessage}</p>
            </div>

            ${summaryHTML}
            ${customerInfoHTML}
            ${deliveryInfoHTML}

            <div class="section-title">
              <span>🛍️</span>
              <span>Order Items</span>
            </div>
            ${itemsHTML}

            ${pricingHTML}

            <div style="margin: 35px 0 25px; text-align: center;">
              <a href="${frontendUrl}/track" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #a81428, #CF1B34); border-radius: 50px; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif;">
                View Order Details
              </a>
            </div>

            <div class="footer">
              <p style="margin-bottom: 5px;">Warm regards,</p>
              <p style="margin: 0; font-weight: bold; color: #CF1B34; font-family: 'Raleway', Arial, sans-serif;">Nishita's Creation</p>
              <p style="font-size: 12px; color: #9a9a9a; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
              <p style="font-size: 11px; color: #9a9a9a; margin-top: 5px;">Handcrafted clothing from Jessore — made with care, worn with pride.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
      console.log('📎 PDF attachment added to status update email');
    }

    const result = await sendEmailWithAttachment(
      customerEmail,
      subject,
      html,
      attachments,
      'order',
      false
    );

    if (result.success) {
      console.log('✅ Order status update email sent to customer:', result.messageId);
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Status update email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment status update email to customer with invoice attachment
 */
const sendPaymentStatusUpdateEmail = async (order, customerEmail, oldStatus, newStatus) => {
  console.log('📧 Sending payment status update email to customer...');

  try {
    if (!customerEmail) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateOrderItemsHTML(order.items);
    const summaryHTML = generateOrderSummaryHTML(order);
    const pricingHTML = generatePricingHTML(order);
    const customerInfoHTML = generateCustomerInfoHTML(order);

    const from = await getFromAddress('order');

    let pdfBuffer = null;
    try {
      console.log('📄 Generating PDF invoice for payment update - Order:', order.orderNumber);
      const pdfResult = await generateInvoicePDF(order);
      if (pdfResult && pdfResult.buffer) {
        pdfBuffer = pdfResult.buffer;
        console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      } else {
        console.warn('⚠️ PDF generation returned no buffer');
      }
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError.message);
    }

    let statusMessage = '';
    let statusEmoji = '';
    let statusColor = '#CF1B34';

    switch(newStatus) {
      case 'paid':
        statusMessage = 'Your payment has been successfully received. Thank you for your purchase!';
        statusEmoji = '✅';
        statusColor = '#4c8a5b';
        break;
      case 'failed':
        statusMessage = 'Your payment has failed. Please try again or contact your bank.';
        statusEmoji = '❌';
        statusColor = '#a81428';
        break;
      case 'refunded':
        statusMessage = 'Your payment has been refunded. The amount will be credited back to your original payment method within 3-5 business days.';
        statusEmoji = '💰';
        statusColor = '#6b6b6b';
        break;
      case 'partial':
        statusMessage = 'Your payment has been partially received. Please complete the remaining payment.';
        statusEmoji = '💳';
        statusColor = '#b8860b';
        break;
      default:
        statusMessage = `Your payment status has been updated to ${newStatus}.`;
        statusEmoji = '📝';
        statusColor = '#CF1B34';
    }

    const subject = `${statusEmoji} Payment Status Update - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Raleway', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #F2F1E6; }
          .container { max-width: 700px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 26, 26, 0.08); border: 1px solid #e6e4d8; }
          .header { background: linear-gradient(135deg, #a81428, #CF1B34); padding: 30px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 26px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; font-family: 'Raleway', Arial, sans-serif; }
          .header p { color: #FFFFFF; margin: 10px 0 0 0; opacity: 0.9; font-family: 'Raleway', Arial, sans-serif; }
          .content { padding: 35px 30px; }
          .status-box { background: ${statusColor}10; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${statusColor}; border: 1px solid ${statusColor}30; }
          .status-badge { display: inline-block; padding: 8px 24px; background: ${statusColor}; color: #FFFFFF; border-radius: 40px; font-weight: 600; text-transform: uppercase; font-size: 14px; font-family: 'Raleway', Arial, sans-serif; }
          .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; color: #1a1a1a; font-family: 'Raleway', Arial, sans-serif; }
          .button { background: linear-gradient(135deg, #a81428, #CF1B34); color: #FFFFFF; padding: 14px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); }
          .button:hover { opacity: 0.9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e4d8; text-align: center; }
          p { color: #333333; font-family: 'Raleway', Arial, sans-serif; }
          strong { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>${statusEmoji}</span>
              <span>Payment Status Update</span>
            </h1>
            <p>Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div class="content">
            <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${order.customerInfo?.fullName || 'Valued Customer'}</strong>,</p>

            <div class="status-box">
              <div class="status-badge">${newStatus.toUpperCase()}</div>
              <p style="margin: 15px 0 0 0;">${statusMessage}</p>
            </div>

            ${summaryHTML}
            ${customerInfoHTML}

            <div class="section-title">
              <span>🛍️</span>
              <span>Order Items</span>
            </div>
            ${itemsHTML}

            ${pricingHTML}

            <div style="margin: 35px 0 25px; text-align: center;">
              <a href="${frontendUrl}/customer/orders" class="button" style="color: #FFFFFF; text-decoration: none; display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #a81428, #CF1B34); border-radius: 50px; font-weight: 600; font-size: 15px; border: none; font-family: 'Raleway', Arial, sans-serif;">
                View Order Details
              </a>
            </div>

            <div class="footer">
              <p style="margin-bottom: 5px;">Warm regards,</p>
              <p style="margin: 0; font-weight: bold; color: #CF1B34; font-family: 'Raleway', Arial, sans-serif;">Nishita's Creation</p>
              <p style="font-size: 12px; color: #9a9a9a; margin-top: 15px;">Need help? Contact us at ${from.email}</p>
              <p style="font-size: 11px; color: #9a9a9a; margin-top: 5px;">Handcrafted clothing from Jessore — made with care, worn with pride.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Invoice_${order.orderNumber || order._id.slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
      console.log('📎 PDF attachment added to payment update email');
    }

    const result = await sendEmailWithAttachment(
      customerEmail,
      subject,
      html,
      attachments,
      'order',
      false
    );

    if (result.success) {
      console.log('✅ Payment status update email sent to customer:', result.messageId);
      return { success: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Payment status update email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderPlacedEmail,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdateEmail,
  sendPaymentStatusUpdateEmail
};