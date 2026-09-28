
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');

// // ========== HELPER: Get cart by userId or sessionId ==========
// const getCart = async (userId, sessionId) => {
//   let query = {};
//   if (userId) {
//     query = { userId };
//   } else if (sessionId) {
//     query = { sessionId };
//   } else {
//     return null;
//   }
//   return await Cart.findOne(query);
// };

// // ========== HELPER: Get session ID from request ==========
// const getSessionId = (req) => {
//   // If user is logged in, return null (don't use sessionId)
//   if (req.user && req.user._id) {
//     return null;
//   }
  
//   return req.headers['x-session-id'] || 
//          req.cookies?.sessionId || 
//          req.body.sessionId || 
//          null;
// };

// // ========== GET CART ==========
// // const getCartItems = async (req, res) => {
// //   try {
// //     const userId = req.user?._id;
// //     const sessionId = getSessionId(req);
    
// //     console.log('📦 Get Cart - UserId:', userId || 'guest', 'SessionId:', sessionId || 'none');
    
// //     let cart = null;
    
// //     // IMPORTANT: Prioritize userId over sessionId
// //     if (userId) {
// //       cart = await Cart.findOne({ userId });
// //       console.log('🔍 Looking for user cart with userId:', userId);
// //     } else if (sessionId) {
// //       cart = await Cart.findOne({ sessionId });
// //       console.log('🔍 Looking for guest cart with sessionId:', sessionId);
// //     }
    
// //     if (!cart) {
// //       return res.status(200).json({ 
// //         success: true, 
// //         data: { items: [], totalItems: 0, subtotal: 0 } 
// //       });
// //     }
    
// //     res.json({ success: true, data: cart });
// //   } catch (error) {
// //     console.error('Get cart error:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // };

// // ========== GET CART ==========
// const getCartItems = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     console.log('📦 Get Cart - UserId:', userId || 'guest', 'SessionId:', sessionId || 'none');
    
//     let cart = null;
    
//     if (userId) {
//       // ✅ Use .lean() for better performance
//       cart = await Cart.findOne({ userId }).lean();
//       console.log('🔍 Looking for user cart with userId:', userId);
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).lean();
//       console.log('🔍 Looking for guest cart with sessionId:', sessionId);
//     }
    
//     if (!cart) {
//       return res.status(200).json({ 
//         success: true, 
//         data: { items: [], totalItems: 0, subtotal: 0 } 
//       });
//     }
    
//     res.json({ success: true, data: cart });
//   } catch (error) {
//     console.error('Get cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== GET USER CART ==========
// // const getUserCart = async (req, res) => {
// //   try {
// //     const userId = req.user?._id;
    
// //     if (!userId) {
// //       return res.status(401).json({ 
// //         success: false, 
// //         error: 'User not authenticated' 
// //       });
// //     }
    
// //     console.log('👤 Get User Cart - User ID:', userId);
    
// //     let cart = await Cart.findOne({ userId });
    
// //     if (!cart) {
// //       // Create empty cart if doesn't exist
// //       cart = new Cart({
// //         userId: userId,
// //         sessionId: null,
// //         items: [],
// //         totalItems: 0,
// //         subtotal: 0
// //       });
// //       await cart.save();
// //       console.log('🆕 Created new empty cart for user:', userId);
// //     }
    
// //     console.log(`📦 User cart has ${cart.items.length} items`);
    
// //     res.json({ 
// //       success: true, 
// //       data: cart 
// //     });
// //   } catch (error) {
// //     console.error('Get user cart error:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // };

// // ========== GET USER CART ==========
// const getUserCart = async (req, res) => {
//   try {
//     const userId = req.user?._id;
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false, 
//         error: 'User not authenticated' 
//       });
//     }
    
//     console.log('👤 Get User Cart - User ID:', userId);
    
//     // ✅ Use .lean() for better performance
//     let cart = await Cart.findOne({ userId }).lean();
    
//     if (!cart) {
//       // Create empty cart if doesn't exist
//       cart = new Cart({
//         userId: userId,
//         sessionId: null,
//         items: [],
//         totalItems: 0,
//         subtotal: 0
//       });
//       await cart.save();
//       console.log('🆕 Created new empty cart for user:', userId);
//       // Convert to plain object for response
//       cart = cart.toObject();
//     }
    
//     console.log(`📦 User cart has ${cart.items.length} items`);
    
//     res.json({ 
//       success: true, 
//       data: cart 
//     });
//   } catch (error) {
//     console.error('Get user cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== ADD TO CART ==========
// const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity = 1, selectedColor = null } = req.body;
//     const userId = req.user?._id;
    
//     if (!productId) {
//       return res.status(400).json({ success: false, error: 'Product ID is required' });
//     }
    
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, error: 'Product not found' });
//     }
    
//     const requestedQuantity = parseInt(quantity) || 1;
//     if (requestedQuantity < 1) {
//       return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
//     }
    
//     if (product.stockQuantity < requestedQuantity) {
//       return res.status(400).json({ success: false, error: `Only ${product.stockQuantity} items available in stock` });
//     }
    
//     // Validate color if provided
//     if (selectedColor && product.colors && product.colors.length > 0) {
//       if (!product.colors.includes(selectedColor)) {
//         return res.status(400).json({ success: false, error: 'Color not available for this product' });
//       }
//     }
    
//     const productHasColors = product.colors && product.colors.length > 0;
//     const colorToUse = productHasColors ? (selectedColor || null) : null;
    
//     let cart;
//     let sessionId = getSessionId(req);
//     let isNewSession = false;
    
//     if (userId) {
//       // Logged in user - use userId
//       cart = await Cart.findOne({ userId });
//       if (!cart) {
//         cart = new Cart({
//           userId: userId,
//           sessionId: null,
//           items: []
//         });
//       }
//     } else {
//       // Guest user - use or create session ID
//       if (!sessionId) {
//         sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//         isNewSession = true;
//         console.log('🆕 Generated new session ID:', sessionId);
//       }
      
//       cart = await Cart.findOne({ sessionId });
//       if (!cart) {
//         cart = new Cart({
//           userId: null,
//           sessionId: sessionId,
//           items: []
//         });
//         isNewSession = true;
//       }
//     }
    
//     // Check if product with same color already exists
//     const existingItemIndex = cart.items.findIndex(
//       item => item.productId.toString() === productId && 
//               (item.selectedColor === colorToUse || (!item.selectedColor && !colorToUse))
//     );
    
//     if (existingItemIndex >= 0) {
//       const newQuantity = cart.items[existingItemIndex].quantity + requestedQuantity;
//       if (product.stockQuantity < newQuantity) {
//         return res.status(400).json({ 
//           success: false, 
//           error: `Cannot add ${requestedQuantity} more. Only ${product.stockQuantity - cart.items[existingItemIndex].quantity} additional items available.` 
//         });
//       }
//       cart.items[existingItemIndex].quantity = newQuantity;
//     } else {
//       cart.items.push({
//         productId: product._id,
//         productName: product.productName,
//         productSlug: product.slug || product._id.toString(),
//         image: product.images && product.images[0]?.url || '',
//         regularPrice: product.regularPrice,
//         discountPrice: product.discountPrice || 0,
//         quantity: requestedQuantity,
//         stockQuantity: product.stockQuantity,
//         unit: product.unit || 'pcs',
//         selectedColor: colorToUse,
//         productHasColors: productHasColors
//       });
//     }
    
//     cart.updateTotals();
//     await cart.save();
    
//     const responseData = {
//       success: true,
//       data: cart,
//       message: requestedQuantity > 1 ? `${requestedQuantity} items added to cart` : 'Item added to cart'
//     };
    
//     // Return session ID to frontend for guest users
//     if (!userId && sessionId) {
//       responseData.sessionId = sessionId;
//       responseData.isNewSession = isNewSession;
//     }
    
//     res.json(responseData);
    
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== UPDATE CART ITEM ==========
// const updateCartItem = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { quantity, selectedColor } = req.body;
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     let cart;
//     if (userId) {
//       cart = await Cart.findOne({ userId });
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId });
//     } else {
//       return res.status(401).json({ success: false, error: 'Cart not found' });
//     }
    
//     if (!cart) {
//       return res.status(404).json({ success: false, error: 'Cart not found' });
//     }
    
//     const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
//     if (itemIndex === -1) {
//       return res.status(404).json({ success: false, error: 'Item not found in cart' });
//     }
    
//     const currentItem = cart.items[itemIndex];
//     const product = await Product.findById(currentItem.productId);
    
//     // Handle color change
//     if (selectedColor !== undefined) {
//       if (!product) {
//         return res.status(404).json({ success: false, error: 'Product not found' });
//       }
      
//       if (product.colors && product.colors.length > 0) {
//         if (!product.colors.includes(selectedColor)) {
//           return res.status(400).json({ success: false, error: 'Selected color is not available' });
//         }
        
//         // Check if same product with same color already exists (merge)
//         const duplicateItemIndex = cart.items.findIndex(
//           (item, idx) => idx !== itemIndex && 
//                         item.productId.toString() === currentItem.productId.toString() && 
//                         item.selectedColor === selectedColor
//         );
        
//         if (duplicateItemIndex !== -1) {
//           const newQuantity = cart.items[duplicateItemIndex].quantity + currentItem.quantity;
//           cart.items[duplicateItemIndex].quantity = newQuantity;
//           cart.items.splice(itemIndex, 1);
          
//           cart.updateTotals();
//           await cart.save();
          
//           return res.json({ success: true, data: cart });
//         }
        
//         currentItem.selectedColor = selectedColor;
//       }
//     }
    
//     // Handle quantity change
//     if (quantity !== undefined) {
//       if (quantity <= 0) {
//         cart.items.splice(itemIndex, 1);
//       } else {
//         if (product && product.stockQuantity < quantity) {
//           return res.status(400).json({ success: false, error: 'Insufficient stock' });
//         }
//         currentItem.quantity = quantity;
//       }
//     }
    
//     cart.updateTotals();
//     await cart.save();
    
//     res.json({ success: true, data: cart });
//   } catch (error) {
//     console.error('Update cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== REMOVE FROM CART ==========
// const removeFromCart = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     console.log('🗑️ Remove Item - UserId:', userId || 'guest', 'SessionId:', sessionId || 'none', 'ItemId:', itemId);
    
//     let cart;
    
//     // IMPORTANT: Prioritize userId over sessionId
//     if (userId) {
//       cart = await Cart.findOne({ userId });
//       console.log('🔍 Looking for user cart with userId:', userId);
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId });
//       console.log('🔍 Looking for guest cart with sessionId:', sessionId);
//     } else {
//       return res.status(401).json({ success: false, error: 'Cart not found' });
//     }
    
//     if (!cart) {
//       return res.status(404).json({ success: false, error: 'Cart not found' });
//     }
    
//     const itemToRemove = cart.items.find(item => item._id.toString() === itemId);
//     if (!itemToRemove) {
//       return res.status(404).json({ success: false, error: 'Item not found in cart' });
//     }
    
//     cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
//     cart.updateTotals();
//     await cart.save();
    
//     console.log(`✅ Removed item ${itemId}, ${cart.items.length} items remaining`);
    
//     res.json({ success: true, data: cart });
//   } catch (error) {
//     console.error('Remove from cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== REMOVE PRODUCT FROM CART ==========
// const removeProductFromCart = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     console.log('🗑️ Remove Product - UserId:', userId || 'guest', 'SessionId:', sessionId || 'none');
    
//     let cart;
    
//     // IMPORTANT: Prioritize userId over sessionId
//     if (userId) {
//       cart = await Cart.findOne({ userId });
//       console.log('🔍 Looking for user cart with userId:', userId);
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId });
//       console.log('🔍 Looking for guest cart with sessionId:', sessionId);
//     } else {
//       return res.status(401).json({ success: false, error: 'Cart not found' });
//     }
    
//     if (!cart) {
//       return res.status(404).json({ success: false, error: 'Cart not found' });
//     }
    
//     // Filter out items with the specified productId
//     const originalLength = cart.items.length;
//     cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    
//     if (cart.items.length === originalLength) {
//       return res.status(404).json({ success: false, error: 'Product not found in cart' });
//     }
    
//     cart.updateTotals();
//     await cart.save();
    
//     console.log(`✅ Removed product ${productId}, ${cart.items.length} items remaining`);
    
//     res.json({ success: true, data: cart });
//   } catch (error) {
//     console.error('Remove product from cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== CLEAR CART ==========
// const clearCart = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     console.log('🗑️ Clear Cart - UserId:', userId || 'guest', 'SessionId:', sessionId || 'none');
    
//     if (!userId && !sessionId) {
//       return res.status(401).json({ success: false, error: 'Cart not found' });
//     }
    
//     let cart = null;
    
//     // IMPORTANT: Prioritize userId over sessionId
//     if (userId) {
//       cart = await Cart.findOne({ userId });
//       console.log('🔍 Looking for user cart with userId:', userId);
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId });
//       console.log('🔍 Looking for guest cart with sessionId:', sessionId);
//     }
    
//     if (!cart) {
//       // If no cart found, return success with empty cart
//       return res.json({ 
//         success: true, 
//         message: 'Cart already empty', 
//         data: { items: [], totalItems: 0, subtotal: 0 } 
//       });
//     }
    
//     cart.items = [];
//     cart.totalItems = 0;
//     cart.subtotal = 0;
//     cart.updatedAt = new Date();
//     await cart.save();
    
//     console.log('✅ Cart cleared successfully');
    
//     res.json({ 
//       success: true, 
//       message: 'Cart cleared', 
//       data: { items: [], totalItems: 0, subtotal: 0 } 
//     });
//   } catch (error) {
//     console.error('Clear cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== MERGE CART ==========
// const mergeCart = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const sessionId = req.body.sessionId || getSessionId(req);
    
//     console.log('🔄 Merge Cart - Request Info:', {
//       userId: userId || 'not logged in',
//       sessionId: sessionId || 'none',
//       hasAuth: !!req.user,
//       bodySessionId: req.body.sessionId
//     });
    
//     if (!sessionId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No session ID provided for merge' 
//       });
//     }
    
//     if (userId) {
//       console.log('👤 Logged in user - Merging guest cart with user cart');
      
//       const guestCart = await Cart.findOne({ sessionId });
      
//       if (!guestCart || guestCart.items.length === 0) {
//         console.log('📭 No guest cart items to merge');
//         return res.json({ 
//           success: true, 
//           message: 'No items to merge',
//           data: await Cart.findOne({ userId }) || { items: [], totalItems: 0, subtotal: 0 }
//         });
//       }
      
//       console.log(`📦 Guest cart has ${guestCart.items.length} items to merge`);
      
//       let userCart = await Cart.findOne({ userId });
      
//       if (!userCart) {
//         guestCart.userId = userId;
//         guestCart.sessionId = null;
//         userCart = guestCart;
//         userCart.updateTotals();
//         await userCart.save();
//         console.log('✅ Guest cart moved to user (no existing user cart)');
//       } else {
//         console.log(`📦 User cart has ${userCart.items.length} items before merge`);
        
//         for (const guestItem of guestCart.items) {
//           const existingItemIndex = userCart.items.findIndex(
//             item => item.productId.toString() === guestItem.productId.toString() && 
//                     item.selectedColor === guestItem.selectedColor
//           );
          
//           if (existingItemIndex >= 0) {
//             userCart.items[existingItemIndex].quantity += guestItem.quantity;
//             console.log(`🔄 Updated existing item: ${guestItem.productName} +${guestItem.quantity}`);
//           } else {
//             userCart.items.push({
//               productId: guestItem.productId,
//               productName: guestItem.productName,
//               productSlug: guestItem.productSlug,
//               image: guestItem.image,
//               regularPrice: guestItem.regularPrice,
//               discountPrice: guestItem.discountPrice,
//               quantity: guestItem.quantity || 1,
//               stockQuantity: guestItem.stockQuantity,
//               unit: guestItem.unit || 'pcs',
//               selectedColor: guestItem.selectedColor || null,
//               productHasColors: guestItem.productHasColors || false
//             });
//             console.log(`➕ Added new item: ${guestItem.productName}`);
//           }
//         }
        
//         userCart.updateTotals();
//         await userCart.save();
//         await guestCart.deleteOne();
//         console.log(`✅ Guest cart merged into user cart (${userCart.items.length} items total)`);
//       }
      
//       return res.json({ 
//         success: true, 
//         message: 'Cart merged successfully',
//         data: userCart
//       });
//     } else {
//       console.log('👤 Guest user - Returning guest cart');
      
//       const guestCart = await Cart.findOne({ sessionId });
      
//       if (!guestCart) {
//         return res.json({ 
//           success: true, 
//           message: 'No guest cart found',
//           data: { items: [], totalItems: 0, subtotal: 0 }
//         });
//       }
      
//       return res.json({ 
//         success: true, 
//         message: 'Guest cart retrieved',
//         data: guestCart
//       });
//     }
//   } catch (error) {
//     console.error('❌ Merge cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== CHECK CART STATUS ==========
// // const checkCartStatus = async (req, res) => {
// //   try {
// //     const { productIds } = req.body;
// //     const userId = req.user?._id;
// //     const sessionId = getSessionId(req);
    
// //     let cart = null;
// //     if (userId) {
// //       cart = await Cart.findOne({ userId });
// //     } else if (sessionId) {
// //       cart = await Cart.findOne({ sessionId });
// //     }
    
// //     const inCartMap = {};
// //     if (cart && cart.items) {
// //       productIds.forEach(productId => {
// //         inCartMap[productId] = cart.items.some(item => item.productId.toString() === productId);
// //       });
// //     } else {
// //       productIds.forEach(productId => {
// //         inCartMap[productId] = false;
// //       });
// //     }
    
// //     res.json({ success: true, data: inCartMap });
// //   } catch (error) {
// //     console.error('Check cart status error:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // };

// // // ========== CHECK CART ITEM ==========
// // const checkCartItem = async (req, res) => {
// //   try {
// //     const { productId } = req.params;
// //     const userId = req.user?._id;
// //     const sessionId = getSessionId(req);
    
// //     let cart = null;
// //     if (userId) {
// //       cart = await Cart.findOne({ userId });
// //     } else if (sessionId) {
// //       cart = await Cart.findOne({ sessionId });
// //     }
    
// //     let inCart = false;
// //     if (cart && cart.items) {
// //       inCart = cart.items.some(item => item.productId.toString() === productId);
// //     }
    
// //     res.json({ success: true, data: { inCart } });
// //   } catch (error) {
// //     console.error('Check cart item error:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // };

// // ========== CHECK CART STATUS ==========
// const checkCartStatus = async (req, res) => {
//   try {
//     const { productIds } = req.body;
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     // ✅ If no productIds, return empty
//     if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
//       return res.json({ success: true, data: {} });
//     }
    
//     let cart = null;
//     if (userId) {
//       cart = await Cart.findOne({ userId }).select('items').lean();
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).select('items').lean();
//     }
    
//     // ✅ Use Set for O(1) lookup
//     const inCartMap = {};
//     if (cart && cart.items && cart.items.length > 0) {
//       const productIdSet = new Set();
//       cart.items.forEach(item => {
//         productIdSet.add(item.productId.toString());
//       });
      
//       productIds.forEach(productId => {
//         inCartMap[productId] = productIdSet.has(productId);
//       });
//     } else {
//       productIds.forEach(productId => {
//         inCartMap[productId] = false;
//       });
//     }
    
//     res.json({ success: true, data: inCartMap });
//   } catch (error) {
//     console.error('Check cart status error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ========== CHECK CART ITEM ==========
// const checkCartItem = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.user?._id;
//     const sessionId = getSessionId(req);
    
//     let cart = null;
//     if (userId) {
//       cart = await Cart.findOne({ userId }).select('items').lean();
//     } else if (sessionId) {
//       cart = await Cart.findOne({ sessionId }).select('items').lean();
//     }
    
//     let inCart = false;
//     if (cart && cart.items && cart.items.length > 0) {
//       inCart = cart.items.some(item => item.productId.toString() === productId);
//     }
    
//     res.json({ success: true, data: { inCart } });
//   } catch (error) {
//     console.error('Check cart item error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



// module.exports = {
//   getCartItems,
//   addToCart,
//   getUserCart,
//   updateCartItem,
//   removeFromCart,
//   removeProductFromCart,
//   clearCart,
//   mergeCart,
//   checkCartStatus,
//   checkCartItem,
// };



// controllers/cartController.js - Updated with variant support

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ========== HELPER: Get cart by userId or sessionId ==========
const getCart = async (userId, sessionId) => {
  let query = {};
  if (userId) {
    query = { userId };
  } else if (sessionId) {
    query = { sessionId };
  } else {
    return null;
  }
  return await Cart.findOne(query);
};

// ========== HELPER: Get session ID from request ==========
const getSessionId = (req) => {
  if (req.user && req.user._id) {
    return null;
  }
  return req.headers['x-session-id'] || 
         req.cookies?.sessionId || 
         req.body.sessionId || 
         null;
};

// ========== HELPER: Generate variant group ID ==========
const generateVariantGroupId = (productId, variantId, subVariantId) => {
  return `${productId}_${variantId || 'no-variant'}_${subVariantId || 'no-sub'}`;
};

// ========== GET CART ==========
const getCartItems = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    let cart = null;
    
    if (userId) {
      cart = await Cart.findOne({ userId }).lean();
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).lean();
    }
    
    if (!cart) {
      return res.status(200).json({ 
        success: true, 
        data: { items: [], totalItems: 0, subtotal: 0 } 
      });
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET USER CART ==========
const getUserCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    let cart = await Cart.findOne({ userId }).lean();
    
    if (!cart) {
      cart = new Cart({
        userId: userId,
        sessionId: null,
        items: [],
        totalItems: 0,
        subtotal: 0
      });
      await cart.save();
      cart = cart.toObject();
    }
    
    res.json({ 
      success: true, 
      data: cart 
    });
  } catch (error) {
    console.error('Get user cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// ========== ADD TO CART (WITH VARIANT SUPPORT) ==========
// const addToCart = async (req, res) => {
//   try {
//     const { 
//       productId, 
//       quantity = 1, 
//       selectedColor = null,
//       variantId = null,
//       variantName = null,
//       variantType = null,
//       subVariantId = null,
//       subVariantName = null,
//       variantRegularPrice = 0,
//       variantDiscountPrice = 0,
//       variantImage = null
//     } = req.body;
    
//     const userId = req.user?._id;
    
//     if (!productId) {
//       return res.status(400).json({ success: false, error: 'Product ID is required' });
//     }
    
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, error: 'Product not found' });
//     }
    
//     const requestedQuantity = parseInt(quantity) || 1;
//     if (requestedQuantity < 1) {
//       return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
//     }
    
//     // ============================================================
//     // ✅ FIXED: Server is now the single source of truth
//     // ============================================================
//     let stockQuantity = product.stockQuantity;
//     let variantRegularPriceValue = 0;
//     let variantDiscountPriceValue = 0;
//     let hasVariants = false;
//     let variantImageUrl = (product.images && product.images[0]?.url) || '';

//     // Check if this is a variant or sub-variant
//     if (variantId || subVariantId) {
//       hasVariants = true;
      
//       // ✅ Server-side authoritative lookup
//       outer:
//       for (const vt of product.variantTypes || []) {
//         for (const v of vt.variants || []) {
//           // Match by variant ID
//           if (v.id === variantId) {
//             if (subVariantId) {
//               // ✅ SUB-VARIANT: Find the sub-variant by its ID
//               const sv = (v.subVariants || []).find(s => s.id === subVariantId);
//               if (sv) {
//                 stockQuantity = sv.stockQuantity || 0;
//                 variantRegularPriceValue = Number(sv.regularPrice) || 0;
//                 variantDiscountPriceValue = Number(sv.discountPrice) || 0;
//                 if (sv.images && sv.images[0]) {
//                   variantImageUrl = sv.images[0];
//                 }
//                 console.log('✅ Found sub-variant:', {
//                   id: sv.id,
//                   name: sv.name,
//                   price: variantRegularPriceValue,
//                   discount: variantDiscountPriceValue
//                 });
//               }
//             } else {
//               // ✅ VARIANT (no sub-variant)
//               stockQuantity = v.stockQuantity || 0;
//               variantRegularPriceValue = Number(v.regularPrice) || 0;
//               variantDiscountPriceValue = Number(v.discountPrice) || 0;
//               if (v.images && v.images[0]) {
//                 variantImageUrl = v.images[0];
//               }
//               console.log('✅ Found variant:', {
//                 id: v.id,
//                 name: v.name,
//                 price: variantRegularPriceValue,
//                 discount: variantDiscountPriceValue
//               });
//             }
//             break outer;
//           }
//         }
//       }
//     }

//     // ✅ DO NOT override with request values - server is authoritative
//     // The values from the database are now the single source of truth
    
//     console.log('📊 Final prices from server:', {
//       variantRegularPriceValue,
//       variantDiscountPriceValue,
//       stockQuantity,
//       variantImageUrl,
//       isSubVariant: !!subVariantId
//     });

//     // Check stock
//     if (stockQuantity < requestedQuantity) {
//       return res.status(400).json({ 
//         success: false, 
//         error: `Only ${stockQuantity} items available in stock` 
//       });
//     }
    
//     // Validate color if provided
//     if (selectedColor && product.colors && product.colors.length > 0) {
//       if (!product.colors.includes(selectedColor)) {
//         return res.status(400).json({ success: false, error: 'Color not available for this product' });
//       }
//     }
    
//     const productHasColors = product.colors && product.colors.length > 0;
//     const colorToUse = productHasColors ? (selectedColor || null) : null;
    
//     // Generate variant group ID for grouping
//     const variantGroupId = generateVariantGroupId(productId, variantId, subVariantId);
    
//     let cart;
//     let sessionId = getSessionId(req);
//     let isNewSession = false;
    
//     if (userId) {
//       cart = await Cart.findOne({ userId });
//       if (!cart) {
//         cart = new Cart({
//           userId: userId,
//           sessionId: null,
//           items: []
//         });
//       }
//     } else {
//       if (!sessionId) {
//         sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//         isNewSession = true;
//       }
      
//       cart = await Cart.findOne({ sessionId });
//       if (!cart) {
//         cart = new Cart({
//           userId: null,
//           sessionId: sessionId,
//           items: []
//         });
//         isNewSession = true;
//       }
//     }
    
//     // Check if item with same variant/sub-variant already exists
//     const existingItemIndex = cart.items.findIndex(
//       item => item.productId.toString() === productId && 
//               item.variantId === variantId &&
//               item.subVariantId === subVariantId &&
//               (item.selectedColor === colorToUse || (!item.selectedColor && !colorToUse))
//     );
    
//     if (existingItemIndex >= 0) {
//       const newQuantity = cart.items[existingItemIndex].quantity + requestedQuantity;
//       if (stockQuantity < newQuantity) {
//         return res.status(400).json({ 
//           success: false, 
//           error: `Cannot add ${requestedQuantity} more. Only ${stockQuantity - cart.items[existingItemIndex].quantity} additional items available.` 
//         });
//       }
//       cart.items[existingItemIndex].quantity = newQuantity;
      
//       // ✅ Update variant prices if they changed (using server values)
//       if (variantRegularPriceValue > 0) {
//         cart.items[existingItemIndex].variantRegularPrice = variantRegularPriceValue;
//       }
//       if (variantDiscountPriceValue > 0) {
//         cart.items[existingItemIndex].variantDiscountPrice = variantDiscountPriceValue;
//       }
//       if (variantImageUrl) {
//         cart.items[existingItemIndex].variantImage = variantImageUrl;
//         cart.items[existingItemIndex].image = variantImageUrl;
//       }
      
//     } else {
//       // ✅ Use the server-derived image
//       let imageToUse = variantImageUrl;
      
//       // Final fallback
//       if (!imageToUse || imageToUse === '') {
//         imageToUse = 'https://via.placeholder.com/100?text=Product';
//       }
      
//       // ✅ Build the cart item with server-derived values
//       const cartItem = {
//         productId: product._id,
//         productName: product.productName,
//         productSlug: product.slug || product._id.toString(),
//         image: imageToUse,
//         regularPrice: product.regularPrice,
//         discountPrice: product.discountPrice || 0,
//         quantity: requestedQuantity,
//         stockQuantity: stockQuantity,
//         unit: product.unit || 'pcs',
//         selectedColor: colorToUse,
//         productHasColors: productHasColors,
//         // Variant fields
//         variantId: variantId,
//         variantName: variantName || (subVariantName ? null : null),
//         variantType: variantType,
//         subVariantId: subVariantId,
//         subVariantName: subVariantName,
//         // ✅ Server-derived prices (authoritative)
//         variantRegularPrice: variantRegularPriceValue,
//         variantDiscountPrice: variantDiscountPriceValue,
//         hasVariants: hasVariants || !!variantId,
//         variantGroupId: variantGroupId,
//         // Store variant-specific image
//         variantImage: imageToUse,
//         addedAt: new Date()
//       };
      
//       cart.items.push(cartItem);
//     }
    
//     cart.updateTotals();
//     await cart.save();
    
//     const responseData = {
//       success: true,
//       data: cart,
//       message: requestedQuantity > 1 ? `${requestedQuantity} items added to cart` : 'Item added to cart'
//     };
    
//     if (!userId && sessionId) {
//       responseData.sessionId = sessionId;
//       responseData.isNewSession = isNewSession;
//     }
    
//     res.json(responseData);
    
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
// ========== ADD TO CART (WITH VARIANT SUPPORT) - FIXED ==========
const addToCart = async (req, res) => {
  try {
    const { 
      productId, 
      quantity = 1, 
      selectedColor = null,
      variantId = null,
      variantName = null,
      variantType = null,
      subVariantId = null,
      subVariantName = null,
      variantRegularPrice = 0,
      variantDiscountPrice = 0,
      variantImage = null
    } = req.body;
    
    const userId = req.user?._id;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // ✅ Allow quantity 0 for pending variants
    const parsedQuantity = Number(quantity);
    const requestedQuantity = 
      quantity === undefined || quantity === null || Number.isNaN(parsedQuantity)
        ? 1
        : parsedQuantity;
    
    // ✅ Allow quantity 0 ONLY for a parent variant that has sub-variants
    const isPendingParentVariant =
      requestedQuantity === 0 &&
      variantId &&
      !subVariantId;
    
    if (requestedQuantity < 0 || (!isPendingParentVariant && requestedQuantity < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }
    
    // ============================================================
    // Server authoritative lookup
    // ============================================================
    let stockQuantity = product.stockQuantity;
    let variantRegularPriceValue = 0;
    let variantDiscountPriceValue = 0;
    let hasVariants = false;
    let variantImageUrl = (product.images && product.images[0]?.url) || '';
    let foundVariantName = '';
    let foundVariantType = '';
    let foundSubVariantName = '';

    if (variantId || subVariantId) {
      hasVariants = true;
      
      outer:
      for (const vt of product.variantTypes || []) {
        for (const v of vt.variants || []) {
          if (v.id === variantId || v._id?.toString() === variantId) {
            foundVariantName = v.name || '';
            foundVariantType = vt.type || '';
            
            if (subVariantId) {
              const sv = (v.subVariants || []).find(s => s.id === subVariantId || s._id?.toString() === subVariantId);
              if (sv) {
                foundSubVariantName = sv.name || '';
                stockQuantity = sv.stockQuantity || 0;
                variantRegularPriceValue = Number(sv.regularPrice) || 0;
                variantDiscountPriceValue = Number(sv.discountPrice) || 0;
                if (sv.images && sv.images[0]) {
                  variantImageUrl = sv.images[0];
                }
              }
            } else {
              stockQuantity = v.stockQuantity || 0;
              variantRegularPriceValue = Number(v.regularPrice) || 0;
              variantDiscountPriceValue = Number(v.discountPrice) || 0;
              if (v.images && v.images[0]) {
                variantImageUrl = v.images[0];
              }
            }
            break outer;
          }
        }
      }
    }
    
    // ✅ If request has explicit prices, use them
    if (variantRegularPrice && Number(variantRegularPrice) > 0) {
      variantRegularPriceValue = Number(variantRegularPrice);
    }
    if (variantDiscountPrice && Number(variantDiscountPrice) > 0) {
      variantDiscountPriceValue = Number(variantDiscountPrice);
    }
    
    // ✅ If request has explicit image, use it
    if (variantImage) {
      variantImageUrl = variantImage;
    }
    if (req.body.image) {
      variantImageUrl = req.body.image;
    }
    
    // ✅ Ensure values are numbers
    variantRegularPriceValue = Number(variantRegularPriceValue) || 0;
    variantDiscountPriceValue = Number(variantDiscountPriceValue) || 0;
    
    // ✅ Check stock - skip for pending parent variants
    if (!isPendingParentVariant && stockQuantity < requestedQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${stockQuantity} items available in stock` 
      });
    }
    
    // Validate color if provided
    if (selectedColor && product.colors && product.colors.length > 0) {
      if (!product.colors.includes(selectedColor)) {
        return res.status(400).json({ success: false, error: 'Color not available for this product' });
      }
    }
    
    const productHasColors = product.colors && product.colors.length > 0;
    const colorToUse = productHasColors ? (selectedColor || null) : null;
    const variantGroupId = generateVariantGroupId(productId, variantId, subVariantId);
    
    let cart;
    let sessionId = getSessionId(req);
    let isNewSession = false;
    
    // Find or create cart
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
          userId: userId,
          sessionId: null,
          items: []
        });
      }
    } else {
      if (!sessionId) {
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        isNewSession = true;
      }
      
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({
          userId: null,
          sessionId: sessionId,
          items: []
        });
        isNewSession = true;
      }
    }
    
    // Check if item with same variant/sub-variant already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
              item.variantId === variantId &&
              item.subVariantId === subVariantId &&
              (item.selectedColor === colorToUse || (!item.selectedColor && !colorToUse))
    );
    
    if (existingItemIndex >= 0) {
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + requestedQuantity;
      
      if (!isPendingParentVariant && stockQuantity < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot add ${requestedQuantity} more. Only ${stockQuantity - existingItem.quantity} additional items available.` 
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      
      // Update variant prices if they changed
      if (variantRegularPriceValue > 0) {
        cart.items[existingItemIndex].variantRegularPrice = variantRegularPriceValue;
      }
      if (variantDiscountPriceValue > 0) {
        cart.items[existingItemIndex].variantDiscountPrice = variantDiscountPriceValue;
      }
      if (variantImageUrl) {
        cart.items[existingItemIndex].variantImage = variantImageUrl;
        cart.items[existingItemIndex].image = variantImageUrl;
      }
      
    } else {
      // Create new cart item
      let imageToUse = variantImageUrl;
      if (!imageToUse || imageToUse === '') {
        imageToUse = 'https://via.placeholder.com/100?text=Product';
      }
      
      const cartItem = {
        productId: product._id,
        productName: product.productName,
        productSlug: product.slug || product._id.toString(),
        image: imageToUse,
        regularPrice: product.regularPrice,
        discountPrice: product.discountPrice || 0,
        quantity: requestedQuantity,
        stockQuantity: stockQuantity,
        unit: product.unit || 'pcs',
        selectedColor: colorToUse,
        productHasColors: productHasColors,
        variantId: variantId,
        variantName: variantName || foundVariantName || null,
        variantType: variantType || foundVariantType || null,
        subVariantId: subVariantId,
        subVariantName: subVariantName || foundSubVariantName || null,
        variantRegularPrice: variantRegularPriceValue,
        variantDiscountPrice: variantDiscountPriceValue,
        hasVariants: hasVariants || !!variantId,
        variantGroupId: variantGroupId,
        variantImage: imageToUse,
        addedAt: new Date()
      };
      
      cart.items.push(cartItem);
    }
    
    // ============================================================
    // ✅ FIX: Clean up any orphaned "base" item for this product
    // Now that a real variant has been selected, remove any item
    // with no variantId/subVariantId for the same product
    // ============================================================
    if (variantId) {
      const beforeFilter = cart.items.length;
      cart.items = cart.items.filter(item => {
        const isSameProduct = item.productId.toString() === productId;
        const isOrphanBase = !item.variantId && !item.subVariantId;
        // Keep the item if it's not an orphaned base item for this product
        return !(isSameProduct && isOrphanBase);
      });
      
      if (cart.items.length < beforeFilter) {
        console.log(`🧹 Removed ${beforeFilter - cart.items.length} orphaned base item(s) for product ${productId}`);
      }
    }
    
    // ============================================================
    // ✅ ALSO: If a sub-variant is being added, clean up any
    // parent variant with quantity 0 for this same product/variant
    // ============================================================
    if (subVariantId && variantId) {
      const beforeFilter = cart.items.length;
      cart.items = cart.items.filter(item => {
        const isSameProduct = item.productId.toString() === productId;
        const isSameVariant = item.variantId === variantId;
        const isPendingParent = !item.subVariantId && item.quantity === 0;
        // Remove pending parent if we're adding a sub-variant
        return !(isSameProduct && isSameVariant && isPendingParent);
      });
      
      if (cart.items.length < beforeFilter) {
        console.log(`🧹 Removed ${beforeFilter - cart.items.length} pending parent variant(s) for product ${productId}, variant ${variantId}`);
      }
    }
    
    // Update totals
    cart.updateTotals();
    await cart.save();
    
    const responseData = {
      success: true,
      data: cart,
      message: requestedQuantity > 1 ? `${requestedQuantity} items added to cart` : 'Item added to cart'
    };
    
    if (!userId && sessionId) {
      responseData.sessionId = sessionId;
      responseData.isNewSession = isNewSession;
    }
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error while adding to cart' 
    });
  }
};

// ========== UPDATE CART ITEM ==========
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, selectedColor, variantId, subVariantId } = req.body;
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    } else {
      return res.status(401).json({ success: false, error: 'Cart not found' });
    }
    
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }
    
    const currentItem = cart.items[itemIndex];
    const product = await Product.findById(currentItem.productId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Handle color change
    if (selectedColor !== undefined) {
      if (product.colors && product.colors.length > 0) {
        if (!product.colors.includes(selectedColor)) {
          return res.status(400).json({ success: false, error: 'Selected color is not available' });
        }
        
        // Check if same product with same color already exists (merge)
        const duplicateItemIndex = cart.items.findIndex(
          (item, idx) => idx !== itemIndex && 
                        item.productId.toString() === currentItem.productId.toString() && 
                        item.selectedColor === selectedColor &&
                        item.variantId === currentItem.variantId &&
                        item.subVariantId === currentItem.subVariantId
        );
        
        if (duplicateItemIndex !== -1) {
          const newQuantity = cart.items[duplicateItemIndex].quantity + currentItem.quantity;
          cart.items[duplicateItemIndex].quantity = newQuantity;
          cart.items.splice(itemIndex, 1);
          
          cart.updateTotals();
          await cart.save();
          
          return res.json({ success: true, data: cart });
        }
        
        currentItem.selectedColor = selectedColor;
      }
    }
    
    // Handle quantity change
    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock
        let stockCheck = currentItem.stockQuantity;
        if (stockCheck < quantity) {
          return res.status(400).json({ success: false, error: 'Insufficient stock' });
        }
        currentItem.quantity = quantity;
      }
    }
    
    cart.updateTotals();
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE FROM CART ==========
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    let cart;
    
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    } else {
      return res.status(401).json({ success: false, error: 'Cart not found' });
    }
    
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    const itemToRemove = cart.items.find(item => item._id.toString() === itemId);
    if (!itemToRemove) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    cart.updateTotals();
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE PRODUCT FROM CART ==========
const removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    let cart;
    
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    } else {
      return res.status(401).json({ success: false, error: 'Cart not found' });
    }
    
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    
    if (cart.items.length === originalLength) {
      return res.status(404).json({ success: false, error: 'Product not found in cart' });
    }
    
    cart.updateTotals();
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Remove product from cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CLEAR CART ==========
const clearCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    if (!userId && !sessionId) {
      return res.status(401).json({ success: false, error: 'Cart not found' });
    }
    
    let cart = null;
    
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.json({ 
        success: true, 
        message: 'Cart already empty', 
        data: { items: [], totalItems: 0, subtotal: 0 } 
      });
    }
    
    cart.items = [];
    cart.totalItems = 0;
    cart.subtotal = 0;
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({ 
      success: true, 
      message: 'Cart cleared', 
      data: { items: [], totalItems: 0, subtotal: 0 } 
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== MERGE CART ==========
const mergeCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.body.sessionId || getSessionId(req);
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No session ID provided for merge' 
      });
    }
    
    if (userId) {
      const guestCart = await Cart.findOne({ sessionId });
      
      if (!guestCart || guestCart.items.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No items to merge',
          data: await Cart.findOne({ userId }) || { items: [], totalItems: 0, subtotal: 0 }
        });
      }
      
      let userCart = await Cart.findOne({ userId });
      
      if (!userCart) {
        guestCart.userId = userId;
        guestCart.sessionId = null;
        userCart = guestCart;
        userCart.updateTotals();
        await userCart.save();
      } else {
        for (const guestItem of guestCart.items) {
          const existingItemIndex = userCart.items.findIndex(
            item => item.productId.toString() === guestItem.productId.toString() && 
                    item.variantId === guestItem.variantId &&
                    item.subVariantId === guestItem.subVariantId &&
                    item.selectedColor === guestItem.selectedColor
          );
          
          if (existingItemIndex >= 0) {
            userCart.items[existingItemIndex].quantity += guestItem.quantity;
          } else {
            userCart.items.push(guestItem);
          }
        }
        
        userCart.updateTotals();
        await userCart.save();
        await guestCart.deleteOne();
      }
      
      return res.json({ 
        success: true, 
        message: 'Cart merged successfully',
        data: userCart
      });
    } else {
      const guestCart = await Cart.findOne({ sessionId });
      
      if (!guestCart) {
        return res.json({ 
          success: true, 
          message: 'No guest cart found',
          data: { items: [], totalItems: 0, subtotal: 0 }
        });
      }
      
      return res.json({ 
        success: true, 
        message: 'Guest cart retrieved',
        data: guestCart
      });
    }
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CHECK CART STATUS ==========
const checkCartStatus = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.json({ success: true, data: {} });
    }
    
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId }).select('items').lean();
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).select('items').lean();
    }
    
    const inCartMap = {};
    if (cart && cart.items && cart.items.length > 0) {
      const productIdSet = new Set();
      cart.items.forEach(item => {
        productIdSet.add(item.productId.toString());
      });
      
      productIds.forEach(productId => {
        inCartMap[productId] = productIdSet.has(productId);
      });
    } else {
      productIds.forEach(productId => {
        inCartMap[productId] = false;
      });
    }
    
    res.json({ success: true, data: inCartMap });
  } catch (error) {
    console.error('Check cart status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CHECK CART ITEM ==========
const checkCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId = getSessionId(req);
    
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId }).select('items').lean();
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).select('items').lean();
    }
    
    let inCart = false;
    if (cart && cart.items && cart.items.length > 0) {
      inCart = cart.items.some(item => item.productId.toString() === productId);
    }
    
    res.json({ success: true, data: { inCart } });
  } catch (error) {
    console.error('Check cart item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCartItems,
  addToCart,
  getUserCart,
  updateCartItem,
  removeFromCart,
  removeProductFromCart,
  clearCart,
  mergeCart,
  checkCartStatus,
  checkCartItem,
};