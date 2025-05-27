const chatbotService = require('../services/chatbotService');
const asyncHandler = require('express-async-handler');
const chatMemory = require('../services/chatMemoryManager');

/**
 * Xử lý câu hỏi của người dùng
 * @route POST /api/chatbot/query
 * @access Public
 */
const handleQuery = asyncHandler(async (req, res) => {
  const { query, sessionId = 'default' } = req.body;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập câu hỏi'
    });
  }

  try {
    console.log(`🤖 Nhận câu hỏi từ người dùng: "${query}" (Session: ${sessionId})`);
    
    // Xử lý câu hỏi với ID phiên
    const result = await chatbotService.processQuery(query, sessionId);
    
    // Trả về kết quả
    res.json({
      success: true,
      answer: result.answer,
      products: result.products
    });
  } catch (error) {
    console.error('❌ Lỗi xử lý câu hỏi chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi xử lý câu hỏi',
      error: error.message
    });
  }
});

/**
 * Lấy thông tin sản phẩm gợi ý
 * @route GET /api/chatbot/suggest
 * @access Public
 */
const getSuggestions = asyncHandler(async (req, res) => {
  try {
    // Đây là một số gợi ý mẫu để người dùng bắt đầu
    const suggestions = [
      "Tôi đang tìm áo phông nam",
      "Có áo màu đen nào không?",
      "Áo sơ mi công sở",
      "Làm thế nào để phối đồ mùa hè?"
    ];
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('❌ Lỗi lấy gợi ý:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi lấy gợi ý',
      error: error.message
    });
  }
});

/**
 * Xóa cache tìm kiếm
 * @route DELETE /api/chatbot/cache
 * @access Private (Chỉ admin)
 */
const clearCache = asyncHandler(async (req, res) => {
  try {
    chatbotService.clearCache();
    res.json({
      success: true,
      message: 'Đã xóa cache tìm kiếm sản phẩm'
    });
  } catch (error) {
    console.error('❌ Lỗi xóa cache:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi xóa cache',
      error: error.message
    });
  }
});

/**
 * Xóa lịch sử chat của một phiên
 * @route DELETE /api/chatbot/history/:sessionId
 * @access Private (Cần xác thực)
 */
const clearChatHistory = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp sessionId'
      });
    }
    
    chatbotService.clearChatHistory(sessionId);
    
    res.json({
      success: true,
      message: `Đã xóa lịch sử chat cho phiên ${sessionId}`
    });
  } catch (error) {
    console.error('❌ Lỗi xóa lịch sử chat:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi xóa lịch sử chat',
      error: error.message
    });
  }
});

/**
 * Lấy lịch sử chat của một phiên
 * @route GET /api/chatbot/history/:sessionId
 * @access Private (Cần xác thực)
 */
const getChatHistory = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp sessionId'
      });
    }
    
    const history = await chatMemory.getChatHistory(sessionId);
    
    res.json({
      success: true,
      history: history.map(msg => ({
        role: msg._getType() === 'human' ? 'user' : 'bot',
        content: msg.content,
        timestamp: msg.additional_kwargs?.timestamp || new Date().toISOString()
      }))
    });
  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử chat:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi lấy lịch sử chat',
      error: error.message
    });
  }
});

module.exports = {
  handleQuery,
  getSuggestions,
  clearCache,
  clearChatHistory,
  getChatHistory
}; 