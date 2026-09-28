// backend/src/routes/chatFAQRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getFAQs,
  getPublicFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
  bulkImportFAQs,
  exportFAQs
} = require('../controllers/chatFAQController');

// ============================================
// PUBLIC FAQ ROUTES
// ============================================

// Get all active FAQs (public)
router.get('/public/faqs', getPublicFAQs);

// ============================================
// ADMIN FAQ ROUTES (Protected)
// ============================================

// Get all FAQs (with filters)
router.get('/admin/faqs', protect, isModeratorOrAdmin, getFAQs);

// Get FAQ categories
router.get('/admin/faqs/categories', protect, isModeratorOrAdmin, getFAQCategories);

// Export FAQs
router.get('/admin/faqs/export', protect, isModeratorOrAdmin, exportFAQs);

// Get FAQ by ID
router.get('/admin/faqs/:id', protect, isModeratorOrAdmin, getFAQById);

// Create FAQ
router.post('/admin/faqs', protect, isModeratorOrAdmin, createFAQ);

// Bulk import FAQs
router.post('/admin/faqs/bulk', protect, isModeratorOrAdmin, bulkImportFAQs);

// Update FAQ
router.put('/admin/faqs/:id', protect, isModeratorOrAdmin, updateFAQ);

// Delete FAQ
router.delete('/admin/faqs/:id', protect, isModeratorOrAdmin, deleteFAQ);

module.exports = router;