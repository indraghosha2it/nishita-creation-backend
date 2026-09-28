// backend/src/controllers/chatConversationController.js

const ChatService = require('../utils/chatService');

// ============================================
// CONVERSATION CONTROLLER
// ============================================

// @desc    Send a chat message
// @route   POST /api/chat/conversation/message
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Get userId from authenticated user
    const userId = req.user?._id || null;
    
    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Process message
    const result = await ChatService.processMessage(
      userId,
      sessionId,
      message.trim()
    );

    if (result.success) {
      return res.json({
        success: true,
        data: {
          message: result.message,
          sessionId: result.sessionId,
          userId: result.userId,
          products: result.products || [],
          hasProducts: result.hasProducts || false,
          faqMatched: result.faqMatched || false,
          messageCount: result.messageCount,
          isNewSession: result.isNewSession || false
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        fallback: result.fallback,
        sessionId: sessionId
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      fallback: "🌸 I'm having trouble right now. Please contact support@beautybucket.com."
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/conversation/history
// @access  Public
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user?._id;
    
    const result = await ChatService.getChatHistory(userId, sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Clear chat session (keep session, clear messages)
// @route   DELETE /api/chat/conversation/session
// @access  Public
const clearSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id;
    
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    const result = await ChatService.clearSession(userId, sessionId);
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Session cleared successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Delete chat session (completely remove)
// @route   DELETE /api/chat/conversation/session/delete
// @access  Public
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id;
    
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    const result = await ChatService.deleteSession(userId, sessionId);
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Get session stats
// @route   GET /api/chat/conversation/session/stats
// @access  Public
const getSessionStats = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user?._id;
    
    const result = await ChatService.getSessionStats(userId, sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearSession,
  deleteSession,
  getSessionStats
};