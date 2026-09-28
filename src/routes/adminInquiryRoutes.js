// src/routes/adminInquiryRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware'); // protect + isAdmin
const {
  getAllInquiries,
  getAllInquiriesForStats,
  getAdminInquiryById,
  updateInquiryStatus,
  addInternalNote,
  getDashboardStats,
  deleteInquiry,
  updateInquiryWithQuotation
  
} = require('../controllers/inquiryController');

// All routes require authentication AND admin
router.use(protect);
router.use(isAdmin); // or use authorize('admin')

router.get('/stats/dashboard', getDashboardStats);
router.get('/', getAllInquiries);
router.get('/all', getAllInquiriesForStats);
router.get('/:id', getAdminInquiryById);
router.put('/:id/status', updateInquiryStatus);
router.put('/:id/quotation', updateInquiryWithQuotation);
router.post('/:id/notes', addInternalNote);
router.delete('/:id', deleteInquiry);

module.exports = router;