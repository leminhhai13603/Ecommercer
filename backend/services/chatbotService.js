const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Category = require('../models/prodCategoryModel');
const chatMemory = require('./chatMemoryManager');

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ChatbotService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.langChainModel = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-2.0-flash",
      maxOutputTokens: 2048,
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });
    this.productSearchHistory = new Map(); // Cache kết quả tìm kiếm
    
    // Tạo template cho câu trả lời
    this.answerTemplate = PromptTemplate.fromTemplate(`
Bạn là KIA - Chuyên gia tư vấn thời trang chuyên nghiệp tại cửa hàng quần áo cao cấp. Bạn có kiến thức sâu rộng về xu hướng thời trang, chất liệu vải, phong cách ăn mặc, và cách phối đồ. Hãy tư vấn khách hàng một cách NHIỆT TÌNH, THÂN THIỆN nhưng vẫn CHUYÊN NGHIỆP và ĐẲNG CẤP.

LỊCH SỬ CUỘC TRÒ CHUYỆN:
{chat_history}

THÔNG TIN SẢN PHẨM HIỆN CÓ:
{product_context}

CÂU HỎI HIỆN TẠI CỦA KHÁCH HÀNG: {query}

KIẾN THỨC THỜI TRANG CẦN THỂ HIỆN (nếu phù hợp với câu hỏi):
- Xu hướng thời trang hiện tại (minimalism, streetwear, vintage, v.v.)
- Cách phối đồ theo màu sắc, kiểu dáng, hoàn cảnh sử dụng
- Chất liệu phù hợp theo mùa (cotton, linen, wool, polyester, v.v.)
- Kiểu dáng phù hợp với từng vóc dáng
- Phong cách phù hợp (casual, formal, athleisure, v.v.)
- Bảo quản quần áo đúng cách

CÁCH TRẢ LỜI:
1. Luôn gọi khách là "bạn" hoặc "anh/chị", giữ ngữ điệu lịch sự nhưng thân thiện
2. Trả lời NGẮN GỌN (2-3 câu), SÚC TÍCH và CHÍNH XÁC
3. Tham khảo LỊCH SỬ CUỘC TRÒ CHUYỆN để hiểu rõ ngữ cảnh và nhu cầu khách hàng
4. Nếu câu hỏi liên quan đến phong cách/xu hướng: trả lời với kiến thức thời trang
5. Nếu câu hỏi về sản phẩm cụ thể: tư vấn dựa trên thông tin sản phẩm có sẵn
6. Nếu câu hỏi chung chung: giới thiệu 1-2 sản phẩm nổi bật, giải thích lý do gợi ý
7. LUÔN KẾT THÚC với câu gợi mở tư vấn thêm hoặc câu hỏi giúp khách hàng cụ thể hóa nhu cầu

Những điều KHÔNG được làm:
- KHÔNG nói rằng "hệ thống gặp sự cố" ngay cả khi không tìm thấy sản phẩm
- KHÔNG trả lời chung chung, mơ hồ, thiếu chuyên nghiệp
- KHÔNG bịa thông tin về sản phẩm không có trong dữ liệu
- KHÔNG sử dụng tiếng lóng hoặc tiếng Anh không cần thiết
- KHÔNG lặp lại câu trả lời trước đó một cách máy móc

LƯU Ý ĐẶC BIỆT:
- Tham khảo LỊCH SỬ CUỘC TRÒ CHUYỆN để tránh lặp lại thông tin và đảm bảo mạch trò chuyện liên tục
- Nếu không có sản phẩm phù hợp, hãy vẫn cố gắng tư vấn về phong cách/xu hướng liên quan
- Nếu câu hỏi quá chung như "mua hàng kiểu gì", hãy giới thiệu về các phong cách thời trang phổ biến và hỏi thêm về sở thích
- Nếu không hiểu rõ câu hỏi, hãy nhẹ nhàng đề nghị khách hàng cung cấp thêm thông tin cụ thể

Hãy trả lời với sự tự tin và chuyên nghiệp như một chuyên gia thời trang thực thụ!
`);

    // Tạo chuỗi xử lý cho LangChain
    this.langChainChain = RunnableSequence.from([
      {
        query: (input) => input.query,
        chat_history: (input) => this.formatChatHistoryForPrompt(input.chat_history),
        product_context: (input) => input.product_context
      },
      this.answerTemplate,
      this.langChainModel,
      new StringOutputParser()
    ]);
  }

  /**
   * Tìm kiếm sản phẩm dựa trên câu hỏi sử dụng MongoDB Atlas Search
   * @param {string} query - Câu hỏi của khách hàng
   * @returns {Promise<Array>} - Danh sách sản phẩm phù hợp
   */
  async searchProducts(query) {
    try {
      // Kiểm tra cache
      if (this.productSearchHistory.has(query)) {
        console.log('✅ Sử dụng kết quả từ cache');
        return this.productSearchHistory.get(query);
      }

      console.log(`🔍 Tìm kiếm sản phẩm với query: "${query}"`);

      // Tạo pipeline tìm kiếm
      const searchPipeline = [
        {
          $search: {
            index: "product_search_index",
            compound: {
              should: [
                {
                  text: {
                    query: query,
                    path: ["title", "description", "color"],
                    score: { boost: { value: 3 } }
                  }
                },
                {
                  range: {
                    path: "quantity",
                    gt: 0,
                    score: { boost: { value: 1 } }
                  }
                }
              ]
            }
          }
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brandDetails"
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        {
          $addFields: {
            score: { $meta: "searchScore" },
            brandName: { $arrayElemAt: ["$brandDetails.title", 0] },
            categoryName: { $arrayElemAt: ["$categoryDetails.title", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            description: 1,
            price: 1,
            quantity: 1,
            color: 1,
            images: 1,
            score: 1,
            brandName: 1,
            categoryName: 1,
            ratings: 1,
            totalrating: 1,
            coupon: 1,
          }
        },
        { $limit: 10 }
      ];

      const products = await Product.aggregate(searchPipeline);
      
      // Lưu vào cache
      this.productSearchHistory.set(query, products);
      
      return products;
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  }

  /**
   * Tiền xử lý câu hỏi để xác định ý định và thông tin quan trọng
   * @param {string} query - Câu hỏi của khách hàng
   * @returns {Promise<Object>} - Thông tin phân tích từ câu hỏi
   */
  async preprocessQuery(query) {
    try {
      const prompt = `
      Phân tích chi tiết câu hỏi của khách hàng tại cửa hàng thời trang và trả về thông tin dưới dạng JSON:
      
      1. Ý định: 
         - tìm_sản_phẩm: Tìm kiếm sản phẩm cụ thể
         - hỏi_giá: Hỏi về giá cả
         - hỏi_size: Hỏi về kích thước
         - hỏi_màu: Hỏi về màu sắc có sẵn
         - tư_vấn_phong_cách: Hỏi về cách phối đồ, phong cách thời trang
         - tư_vấn_chất_liệu: Hỏi về chất liệu vải, bảo quản
         - so_sánh: So sánh giữa các sản phẩm
         - đánh_giá: Hỏi về đánh giá, review của sản phẩm
         - khác: Các ý định khác

      2. Loại sản phẩm: áo sơ mi, áo thun, quần jeans, đầm, váy, blazer, hoodie, cardigan, v.v. (để trống nếu không rõ)
      
      3. Thuộc tính quan tâm:
         - màu_sắc: Màu sắc cụ thể được đề cập
         - kích_thước: Size được đề cập
         - giá_cả: Phạm vi giá được đề cập
         - chất_liệu: Loại vải được đề cập
         - mùa: Mùa phù hợp được đề cập
         - phong_cách: Phong cách được đề cập (casual, formal, streetwear, etc.)
         - giới_tính: Nam/Nữ/Unisex được đề cập
         - dịp: Dịp sử dụng được đề cập (đi làm, tiệc, thể thao, v.v.)
      
      4. Mức độ rõ ràng: (1-5)
         1: Rất mơ hồ - câu hỏi quá chung, không xác định được nhu cầu
         5: Rất cụ thể - biết chính xác khách hàng đang tìm kiếm gì
      
      Câu hỏi: "${query}"
      
      Trả về duy nhất JSON, không chứa văn bản khác.
      `;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Xử lý kết quả thành JSON
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("❌ Lỗi khi phân tích JSON:", e);
        return {
          intention: "tìm sản phẩm",
          keywords: query.split(" "),
          attributes: {}
        };
      }
    } catch (error) {
      console.error("❌ Lỗi khi tiền xử lý câu hỏi:", error);
      return {
        intention: "tìm sản phẩm",
        keywords: query.split(" "),
        attributes: {}
      };
    }
  }

  /**
   * Chuyển đổi lịch sử chat thành định dạng phù hợp cho prompt
   * @param {Array} messages - Mảng tin nhắn
   * @returns {string} - Chuỗi lịch sử chat
   */
  formatChatHistoryForPrompt(messages) {
    if (!messages || messages.length === 0) return "Đây là cuộc trò chuyện đầu tiên.";
    
    return messages.map(message => {
      const type = message._getType ? message._getType() : (message.type || 'unknown');
      if (type === 'human') {
        return `Khách hàng: ${message.content}`;
      } else if (type === 'ai') {
        return `KIA: ${message.content}`;
      } else {
        return `${type}: ${message.content}`;
      }
    }).join('\n\n');
  }

  /**
   * Tạo context từ sản phẩm tìm được
   * @param {Array} products - Danh sách sản phẩm
   * @returns {string} - Chuỗi context sản phẩm
   */
  formatProductContext(products) {
    let productContext = "";
    if (products && products.length > 0) {
      productContext = products.map((product, index) => {
        // Xác định kiểu dáng dựa vào tên và mô tả
        let style = "";
        const title = product.title.toLowerCase();
        const desc = product.description.toLowerCase();
        
        if (title.includes("áo sơ mi") || desc.includes("áo sơ mi") || desc.includes("formal")) {
          style = "formal";
        } else if (title.includes("áo thun") || title.includes("t-shirt") || desc.includes("áo thun") || desc.includes("t-shirt")) {
          style = "casual";
        } else if (title.includes("hoodie") || title.includes("nỉ") || desc.includes("hoodie") || desc.includes("nỉ")) {
          style = "streetwear";
        } else if (title.includes("blazer") || title.includes("vest") || desc.includes("blazer") || desc.includes("vest")) {
          style = "smart casual";
        } else {
          style = "casual";
        }

        // Xác định chất liệu dựa vào mô tả
        let material = "";
        if (desc.includes("cotton")) {
          material = "cotton";
        } else if (desc.includes("linen") || desc.includes("lanh")) {
          material = "linen";
        } else if (desc.includes("len") || desc.includes("wool")) {
          material = "wool";
        } else if (desc.includes("polyester") || desc.includes("poly")) {
          material = "polyester";
        } else if (desc.includes("kaki") || desc.includes("khaki")) {
          material = "khaki";
        } else if (desc.includes("jeans") || desc.includes("denim")) {
          material = "denim";
        } else {
          material = "cotton blend";
        }

        return `
Sản phẩm ${index + 1}:
- Tên: ${product.title}
- Giá: ${product.price.toLocaleString('vi-VN')} VNĐ
- Màu sắc: ${product.color || "Không có thông tin"}
- Kích thước: ${product.size || "Free Size"}
- Dành cho: ${product.gender || "Unisex"}
- Thương hiệu: ${product.brandName || "Không có thông tin"}
- Danh mục: ${product.categoryName || "Không có thông tin"}
- Phong cách: ${style}
- Chất liệu: ${material}
- Đánh giá: ${product.totalrating || "Chưa có đánh giá"} sao
- Số lượng đánh giá: ${product.ratings ? product.ratings.length : 0}
- Mô tả: ${product.description}
- Số lượng còn: ${product.quantity}
`;
      }).join("\n");
    } else {
      productContext = "Không tìm thấy sản phẩm phù hợp.";
    }
    
    return productContext;
  }

  /**
   * Tạo câu trả lời dựa trên lịch sử và kết quả tìm kiếm sản phẩm sử dụng LangChain
   * @param {string} query - Câu hỏi của khách hàng
   * @param {Array} products - Danh sách sản phẩm phù hợp
   * @param {string} sessionId - ID phiên người dùng
   * @returns {Promise<string>} - Câu trả lời 
   */
  async generateAnswer(query, products, sessionId) {
    try {
      // Lấy lịch sử trò chuyện
      const chatHistory = await chatMemory.getRecentMessages(sessionId, 10);
      
      // Tạo context sản phẩm
      const productContext = this.formatProductContext(products);
      
      // Sử dụng LangChain để tạo câu trả lời
      const answer = await this.langChainChain.invoke({
        query: query,
        chat_history: chatHistory,
        product_context: productContext
      });
      
      return answer;
    } catch (error) {
      console.error("❌ Lỗi khi tạo câu trả lời:", error);
      return "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
    }
  }

  /**
   * Xử lý trọn vẹn câu hỏi của khách hàng với lịch sử trò chuyện
   * @param {string} query - Câu hỏi của khách hàng 
   * @param {string} sessionId - ID phiên người dùng
   * @returns {Promise<Object>} - Kết quả xử lý bao gồm câu trả lời và sản phẩm liên quan
   */
  async processQuery(query, sessionId = 'default') {
    try {
      // Thêm tin nhắn người dùng vào bộ nhớ
      await chatMemory.addUserMessage(sessionId, query);
      
      // Tiền xử lý truy vấn
      const queryInfo = await this.preprocessQuery(query);
      console.log("✅ Thông tin phân tích từ câu hỏi:", queryInfo);
      
      // Tìm kiếm sản phẩm
      const products = await this.searchProducts(query);
      
      // Tạo câu trả lời với lịch sử
      const answer = await this.generateAnswer(query, products, sessionId);
      
      // Thêm câu trả lời vào bộ nhớ
      await chatMemory.addAIMessage(sessionId, answer);
      
      return {
        answer,
        products: products.map(p => ({
          id: p._id,
          title: p.title,
          price: p.price,
          image: p.images && p.images.length > 0 ? p.images[0].url : null,
          slug: p.slug,
          rating: p.totalrating || "0",
          reviewCount: p.ratings ? p.ratings.length : 0
        }))
      };
    } catch (error) {
      console.error("❌ Lỗi khi xử lý câu hỏi:", error);
      return {
        answer: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn ngay bây giờ. Vui lòng thử lại sau.",
        products: []
      };
    }
  }

  /**
   * Xóa cache tìm kiếm sản phẩm
   */
  clearCache() {
    this.productSearchHistory.clear();
    console.log("✅ Đã xóa cache tìm kiếm sản phẩm");
  }
  
  /**
   * Xóa lịch sử trò chuyện của một phiên
   * @param {string} sessionId - ID phiên người dùng
   */
  clearChatHistory(sessionId) {
    chatMemory.clearMemory(sessionId);
  }
}

module.exports = new ChatbotService(); 