// backend/src/controllers/chatFAQController.js

const ChatFAQ = require('../models/ChatFAQ');

// ============================================
// FAQ MANAGEMENT CONTROLLER (Admin Only)
// ============================================

// @desc    Get all FAQs
// @route   GET /api/chat/faq/admin/faqs
// @access  Private (Admin/Moderator)
const getFAQs = async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    
    const faqs = await ChatFAQ.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    res.json({
      success: true,
      data: faqs,
      count: faqs.length
    });
    
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all active FAQs (for public use)
// @route   GET /api/chat/faq/public/faqs
// @access  Public
const getPublicFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    
    const faqs = await ChatFAQ.find(query)
      .sort({ priority: -1, timesUsed: 1 })
      .select('question answer category keywords priority');
    
    res.json({
      success: true,
      data: faqs,
      count: faqs.length
    });
    
  } catch (error) {
    console.error('Get public FAQs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get FAQ by ID
// @route   GET /api/chat/faq/admin/faqs/:id
// @access  Private (Admin/Moderator)
const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await ChatFAQ.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    res.json({
      success: true,
      data: faq
    });
    
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/chat/faq/admin/faqs
// @access  Private (Admin/Moderator)
const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, keywords, priority } = req.body;
    
    // Validate
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Question and answer are required'
      });
    }
    
    // Check if FAQ already exists
    const existing = await ChatFAQ.findOne({ 
      question: { $regex: new RegExp(`^${question}$`, 'i') } 
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'FAQ with this question already exists'
      });
    }
    
    const faq = await ChatFAQ.create({
      question,
      answer,
      category: category || 'general',
      keywords: keywords || [],
      priority: priority || 0,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: faq,
      message: 'FAQ created successfully'
    });
    
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update a FAQ
// @route   PUT /api/chat/faq/admin/faqs/:id
// @access  Private (Admin/Moderator)
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, keywords, priority, isActive } = req.body;
    
    const faq = await ChatFAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    // Check duplicate question
    if (question && question !== faq.question) {
      const existing = await ChatFAQ.findOne({ 
        question: { $regex: new RegExp(`^${question}$`, 'i') },
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'FAQ with this question already exists'
        });
      }
    }
    
    // Update fields
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (keywords) faq.keywords = keywords;
    if (priority !== undefined) faq.priority = priority;
    if (isActive !== undefined) faq.isActive = isActive;
    
    faq.updatedBy = req.user.id;
    await faq.save();
    
    res.json({
      success: true,
      data: faq,
      message: 'FAQ updated successfully'
    });
    
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete a FAQ
// @route   DELETE /api/chat/faq/admin/faqs/:id
// @access  Private (Admin/Moderator)
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await ChatFAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    await faq.deleteOne();
    
    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get FAQ categories
// @route   GET /api/chat/faq/admin/faqs/categories
// @access  Private (Admin/Moderator)
const getFAQCategories = async (req, res) => {
  try {
    const categories = await ChatFAQ.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Bulk import FAQs
// @route   POST /api/chat/faq/admin/faqs/bulk
// @access  Private (Admin/Moderator)
const bulkImportFAQs = async (req, res) => {
  try {
    const { faqs } = req.body;
    
    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of FAQs'
      });
    }
    
    const createdFAQs = [];
    const errors = [];
    
    for (const faqData of faqs) {
      try {
        const existing = await ChatFAQ.findOne({ 
          question: { $regex: new RegExp(`^${faqData.question}$`, 'i') } 
        });
        
        if (existing) {
          errors.push({ question: faqData.question, error: 'Already exists' });
          continue;
        }
        
        const faq = await ChatFAQ.create({
          ...faqData,
          createdBy: req.user.id
        });
        createdFAQs.push(faq);
      } catch (error) {
        errors.push({ question: faqData.question, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Imported ${createdFAQs.length} FAQs`,
      data: {
        created: createdFAQs,
        errors: errors
      }
    });
    
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Export FAQs as JSON
// @route   GET /api/chat/faq/admin/faqs/export
// @access  Private (Admin/Moderator)
const exportFAQs = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const faqs = await ChatFAQ.find(query)
      .sort({ category: 1, priority: -1 })
      .select('-__v -createdBy -updatedBy');
    
    res.json({
      success: true,
      data: faqs,
      count: faqs.length
    });
    
  } catch (error) {
    console.error('Export FAQs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getFAQs,
  getPublicFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
  bulkImportFAQs,
  exportFAQs
};