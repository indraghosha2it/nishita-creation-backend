// backend/src/routes/chatConversationRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getChatHistory,
  clearSession,
  deleteSession,
  getSessionStats
} = require('../controllers/chatConversationController');

// ============================================
// CONVERSATION ROUTES (Public)
// ============================================

// Send a message (public - works for both logged-in and guest users)
router.post('/message', sendMessage);

// Get chat history
router.get('/history', getChatHistory);

// Clear session (keep session, clear messages)
router.delete('/session', clearSession);

// Delete session (completely remove)
router.delete('/session/delete', deleteSession);

// Get session stats
router.get('/session/stats', getSessionStats);

module.exports = router;