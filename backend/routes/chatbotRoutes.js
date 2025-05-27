const express = require('express');
const chatbotController = require('../controller/chatbotController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint xử lý câu hỏi - ai cũng có thể sử dụng
router.post('/query', chatbotController.handleQuery);

// Endpoint lấy gợi ý - ai cũng có thể sử dụng
router.get('/suggest', chatbotController.getSuggestions);

// Endpoint xóa cache - chỉ admin
router.delete('/cache', authMiddleware, isAdmin, chatbotController.clearCache);

// Endpoint xóa lịch sử chat - cần xác thực
router.delete('/history/:sessionId', authMiddleware, chatbotController.clearChatHistory);

// Endpoint lấy lịch sử chat - cần xác thực
router.get('/history/:sessionId', authMiddleware, chatbotController.getChatHistory);

module.exports = router; 