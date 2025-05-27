const { BufferMemory } = require('langchain/memory');
const { ChatMessageHistory } = require('langchain/stores/message/in_memory');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');

/**
 * Lớp quản lý bộ nhớ cuộc trò chuyện cho chatbot
 */
class ChatMemoryManager {
  constructor() {
    // Lưu trữ bộ nhớ cho từng session người dùng
    this.userMemories = new Map();
    
    // Thời gian hết hạn cho bộ nhớ (4 giờ)
    this.expirationTime = 4 * 60 * 60 * 1000;
    
    // Thiết lập xóa bộ nhớ hết hạn mỗi giờ
    setInterval(() => this.cleanupExpiredMemories(), 60 * 60 * 1000);
  }

  /**
   * Lấy hoặc tạo bộ nhớ cho một session
   * @param {string} sessionId - ID phiên người dùng
   * @returns {BufferMemory} - Bộ nhớ của phiên người dùng
   */
  getMemory(sessionId) {
    if (!this.userMemories.has(sessionId)) {
      // Tạo bộ nhớ mới nếu chưa có
      const chatHistory = new ChatMessageHistory();
      
      const memory = new BufferMemory({
        chatHistory,
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "query",
        outputKey: "response",
      });
      
      this.userMemories.set(sessionId, {
        memory,
        lastAccessed: Date.now()
      });
    } else {
      // Cập nhật thời gian truy cập
      const memoryData = this.userMemories.get(sessionId);
      memoryData.lastAccessed = Date.now();
      this.userMemories.set(sessionId, memoryData);
    }
    
    return this.userMemories.get(sessionId).memory;
  }

  /**
   * Thêm tin nhắn người dùng vào bộ nhớ
   * @param {string} sessionId - ID phiên người dùng
   * @param {string} message - Nội dung tin nhắn
   */
  async addUserMessage(sessionId, message) {
    const memoryObj = this.getMemory(sessionId);
    const history = memoryObj.chatHistory;
    await history.addMessage(new HumanMessage(message));
  }

  /**
   * Thêm phản hồi của AI vào bộ nhớ
   * @param {string} sessionId - ID phiên người dùng
   * @param {string} message - Nội dung phản hồi
   */
  async addAIMessage(sessionId, message) {
    const memoryObj = this.getMemory(sessionId);
    const history = memoryObj.chatHistory;
    await history.addMessage(new AIMessage(message));
  }

  /**
   * Lấy toàn bộ lịch sử trò chuyện
   * @param {string} sessionId - ID phiên người dùng
   * @returns {Promise<Array>} - Mảng các tin nhắn
   */
  async getChatHistory(sessionId) {
    const memoryObj = this.getMemory(sessionId);
    const variables = await memoryObj.loadMemoryVariables({});
    return variables.chat_history || [];
  }

  /**
   * Lấy n tin nhắn gần nhất
   * @param {string} sessionId - ID phiên người dùng
   * @param {number} count - Số lượng tin nhắn cần lấy
   * @returns {Promise<Array>} - Mảng các tin nhắn gần nhất
   */
  async getRecentMessages(sessionId, count = 5) {
    const allMessages = await this.getChatHistory(sessionId);
    return allMessages.slice(-count);
  }

  /**
   * Xóa bộ nhớ của một phiên
   * @param {string} sessionId - ID phiên người dùng
   */
  clearMemory(sessionId) {
    if (this.userMemories.has(sessionId)) {
      this.userMemories.delete(sessionId);
      console.log(`✅ Đã xóa bộ nhớ chat cho phiên ${sessionId}`);
    }
  }

  /**
   * Xóa các bộ nhớ đã hết hạn
   */
  cleanupExpiredMemories() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [sessionId, memoryData] of this.userMemories.entries()) {
      if (now - memoryData.lastAccessed > this.expirationTime) {
        this.userMemories.delete(sessionId);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`🧹 Đã xóa ${expiredCount} bộ nhớ chat hết hạn`);
    }
  }
}

module.exports = new ChatMemoryManager(); 