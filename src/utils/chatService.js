// backend/src/utils/chatService.js

const ChatFAQ = require('../models/ChatFAQ');
const ChatSession = require('../models/ChatSession');
const Product = require('../models/Product');
const defaultFAQs = require('../knowledge/defaultFAQs');

class ChatService {
  /**
   * Initialize default FAQs if none exist
   */
  async initializeDefaultFAQs() {
    try {
      const count = await ChatFAQ.countDocuments();
      if (count === 0) {
        console.log('📚 No FAQs found. Loading defaults...');
        await ChatFAQ.insertMany(defaultFAQs);
        console.log(`✅ ${defaultFAQs.length} default FAQs loaded!`);
      }
    } catch (error) {
      console.error('Error initializing FAQs:', error);
    }
  }

  /**
   * Get or create a chat session
   */
  async getOrCreateSession(userId, sessionId) {
    let query = {};
    
    if (userId) {
      query = { userId };
    } else if (sessionId) {
      query = { sessionId };
    } else {
      sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      query = { sessionId };
    }
    
    let session = await ChatSession.findOne(query);
    
    if (!session) {
      session = new ChatSession({
        userId: userId || null,
        sessionId: sessionId || null,
        messages: [],
        context: {},
        messageCount: 0,
        isActive: true
      });
      await session.save();
    }
    
    return session;
  }

  /**
   * Find best matching FAQ from static knowledge base
   */
  async findBestFAQ(message) {
    try {
      const faqs = await ChatFAQ.find({ isActive: true })
        .sort({ priority: -1, timesUsed: 1 });
      
      if (faqs.length === 0) return null;
      
      const normalizedMessage = message.toLowerCase().trim();
      let bestMatch = null;
      let bestScore = 0;
      
      for (const faq of faqs) {
        const allKeywords = faq.allKeywords || [];
        let score = 0;
        const matched = [];
        
        for (const keyword of allKeywords) {
          if (normalizedMessage.includes(keyword.toLowerCase())) {
            score += 1;
            matched.push(keyword);
          }
        }
        
        // Check if entire question phrase matches
        const questionPhrase = faq.question.toLowerCase();
        if (normalizedMessage.includes(questionPhrase) || questionPhrase.includes(normalizedMessage)) {
          score += 3;
        }
        
        score += (faq.priority || 0) * 0.5;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            faq,
            score,
            matchedKeywords: matched
          };
        }
      }
      
      if (bestMatch && bestMatch.score >= 1) {
        await ChatFAQ.findByIdAndUpdate(bestMatch.faq._id, {
          $inc: { timesUsed: 1 }
        });
        return bestMatch;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding FAQ:', error);
      return null;
    }
  }

  /**
   * Search products based on user message
   */
  async searchProducts(message) {
    try {
      const keywords = message
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      if (keywords.length === 0) return [];
      
      const searchRegex = keywords.map(word => ({
        $or: [
          { productName: { $regex: word, $options: 'i' } },
          { brand: { $regex: word, $options: 'i' } },
          { categoryName: { $regex: word, $options: 'i' } },
          { fullDescription: { $regex: word, $options: 'i' } }
        ]
      }));
      
      const products = await Product.find({
        $and: [
          { isActive: true },
          { $or: searchRegex }
        ]
      })
      .select('productName slug regularPrice discountPrice images rating brand categoryName')
      .limit(6)
      .lean();
      
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Get fallback response when no match found
   */
  getFallbackResponse(message) {
    return `🌸 I'm not sure I understand "${message}". Here are some things I can help with:\n\n` +
      `• **Products** – Ask about skincare, makeup, fragrances, hair care\n` +
      `• **Policies** – Returns, shipping, payment methods\n` +
      `• **Orders** – Tracking, cancellation, damaged items\n` +
      `• **Contact** – Email, phone, address\n\n` +
      `💡 Try being more specific, or visit our product pages directly!\n\n` +
      `📧 Or email support@beautybucket.com for personal assistance.`;
  }

  /**
   * Process a chat message (main entry point)
   */
  async processMessage(userId, sessionId, message, options = {}) {
    try {
      // 1. Get or create session
      const session = await this.getOrCreateSession(userId, sessionId);
      
      // 2. Add user message to history
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      session.totalInteractions += 1;
      
      // 3. Find best matching FAQ
      const faqMatch = await this.findBestFAQ(message);
      
      // 4. Check if it's a product search query
      const productKeywords = ['show', 'find', 'search', 'looking for', 'want', 'need', 'recommend'];
      const isProductQuery = productKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      let response = null;
      let productResults = [];
      let faqMatched = false;
      let matchedFaqId = null;
      
      // 5. Generate response
      if (faqMatch && faqMatch.score >= 2) {
        response = faqMatch.faq.answer;
        faqMatched = true;
        matchedFaqId = faqMatch.faq._id;
        session.faqMatches += 1;
        
      } else if (isProductQuery || faqMatch?.score < 2) {
        productResults = await this.searchProducts(message);
        session.productSearches += 1;
        
        if (productResults.length > 0) {
          let productResponse = '🛍️ **Here are some products I found:**\n\n';
          productResults.forEach((product, index) => {
            const price = product.discountPrice || product.regularPrice;
            productResponse += `${index + 1}. **${product.productName}**\n`;
            productResponse += `   💰 ৳${price.toFixed(2)}`;
            if (product.brand) productResponse += ` | Brand: ${product.brand}`;
            productResponse += `\n   🔗 View: /product/${product.slug}\n\n`;
          });
          response = productResponse;
          
        } else if (faqMatch) {
          response = faqMatch.faq.answer;
          faqMatched = true;
          matchedFaqId = faqMatch.faq._id;
          session.faqMatches += 1;
          
        } else {
          response = this.getFallbackResponse(message);
        }
      } else {
        response = this.getFallbackResponse(message);
      }
      
      // 6. Add assistant response to history
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        products: productResults.map(p => p._id),
        faqMatched: faqMatched,
        faqId: matchedFaqId,
        isError: false
      };
      session.messages.push(assistantMessage);
      
      // 7. Update session metadata
      session.messageCount = session.messages.length;
      session.lastActivity = new Date();
      
      // 8. Save session
      await session.save();
      
      // 9. Return response
      return {
        success: true,
        message: response,
        sessionId: session.sessionId || session._id.toString(),
        userId: session.userId,
        products: productResults,
        hasProducts: productResults.length > 0,
        faqMatched: faqMatched,
        messageCount: session.messageCount,
        isNewSession: session.messages.length === 2
      };
      
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        success: false,
        error: error.message,
        fallback: "🌸 I'm having trouble right now. Please contact support@beautybucket.com for assistance."
      };
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(userId, sessionId) {
    try {
      let query = {};
      if (userId) {
        query = { userId };
      } else if (sessionId) {
        query = { sessionId };
      } else {
        return { success: false, error: 'No identifier provided' };
      }
      
      const session = await ChatSession.findOne(query)
        .populate('messages.faqId', 'question answer')
        .populate('messages.products', 'productName slug regularPrice discountPrice images');
      
      if (!session) {
        return { success: true, data: { messages: [], messageCount: 0 } };
      }
      
      const formattedMessages = session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        products: msg.products || [],
        isError: msg.isError || false,
        faqMatched: msg.faqMatched || false
      }));
      
      return {
        success: true,
        data: {
          messages: formattedMessages,
          messageCount: session.messageCount,
          sessionId: session.sessionId || session._id.toString(),
          userId: session.userId,
          totalInteractions: session.totalInteractions || 0,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      };
    } catch (error) {
      console.error('Get chat history error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear chat session (keep session, clear messages)
   */
  async clearSession(userId, sessionId) {
    try {
      let query = {};
      if (userId) {
        query = { userId };
      } else if (sessionId) {
        query = { sessionId };
      } else {
        return { success: false, error: 'No identifier provided' };
      }
      
      const session = await ChatSession.findOne(query);
      
      if (!session) {
        return { success: false, error: 'Session not found' };
      }
      
      session.messages = [];
      session.messageCount = 0;
      session.totalInteractions = 0;
      session.faqMatches = 0;
      session.productSearches = 0;
      session.lastActivity = new Date();
      await session.save();
      
      return { success: true };
    } catch (error) {
      console.error('Clear session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete chat session (completely remove)
   */
  async deleteSession(userId, sessionId) {
    try {
      let query = {};
      if (userId) {
        query = { userId };
      } else if (sessionId) {
        query = { sessionId };
      } else {
        return { success: false, error: 'No identifier provided' };
      }
      
      const result = await ChatSession.findOneAndDelete(query);
      
      if (!result) {
        return { success: false, error: 'Session not found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Delete session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get session stats
   */
  async getSessionStats(userId, sessionId) {
    try {
      let query = {};
      if (userId) {
        query = { userId };
      } else if (sessionId) {
        query = { sessionId };
      } else {
        return { success: false, error: 'No identifier provided' };
      }
      
      const session = await ChatSession.findOne(query);
      
      if (!session) {
        return { success: true, data: { exists: false } };
      }
      
      return {
        success: true,
        data: {
          exists: true,
          messageCount: session.messageCount,
          totalInteractions: session.totalInteractions || 0,
          faqMatches: session.faqMatches || 0,
          productSearches: session.productSearches || 0,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          lastActivity: session.lastActivity
        }
      };
    } catch (error) {
      console.error('Get session stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ChatService();