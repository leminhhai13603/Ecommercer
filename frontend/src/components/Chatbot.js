import React, { useState, useEffect, useRef, useContext } from 'react';
import { BsSend, BsRobot, BsPersonCircle, BsXLg, BsChatDots, BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { sendChatbotQuery, getChatbotSuggestions, clearChatbotHistory } from '../api';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin');
  
  // Sử dụng context để kiểm tra đăng nhập
  const { isAuthenticated } = useContext(AuthContext);
  
  // CSS styles object
  const styles = {
    chatbotDialog: {
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '400px',
      maxWidth: '95vw',
      height: '620px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      animation: 'chatbot-fade-in 0.2s'
    },
    chatbotHeader: {
      background: '#3B82F6',
      color: '#fff',
      padding: '14px 18px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    chatbotActions: {
      display: 'flex',
      alignItems: 'center'
    },
    chatbotActionButton: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '18px',
      marginLeft: '2px',
      cursor: 'pointer',
      transition: 'color 0.2s',
      borderRadius: '50%',
      padding: '4px 6px'
    },
    chatbotMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 14px 8px 14px',
      background: '#f7f7f7'
    },
    message: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    userMessage: {
      flexDirection: 'row-reverse'
    },
    messageAvatar: {
      margin: '0 8px',
      color: '#3B82F6'
    },
    messageContent: {
      background: '#fff',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      maxWidth: '75%',
      minWidth: '60px',
      fontSize: '15px',
      position: 'relative',
      border: '1px solid #e5e7eb'
    },
    userMessageContent: {
      background: '#3B82F6',
      color: '#fff',
      border: 'none'
    },
    messageTime: {
      fontSize: '11px',
      color: '#888',
      marginTop: '4px',
      textAlign: 'right'
    },
    chatbotSuggestions: {
      padding: '8px 14px 0 14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    suggestionButton: {
      background: '#f1f5f9',
      color: '#222',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background 0.2s, color 0.2s'
    },
    chatbotInput: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 14px',
      borderTop: '1px solid #e0e0e0',
      background: '#fff'
    },
    inputField: {
      flex: 1,
      border: '1px solid #e0e0e0',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '15px',
      outline: 'none',
      marginRight: '8px',
      background: '#f8fafc',
      transition: 'border 0.2s'
    },
    inputFieldFocus: {
      border: '1.5px solid #3B82F6',
      background: '#fff'
    },
    submitButton: {
      background: '#3B82F6',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    chatbotAuthMessage: {
      padding: '18px 14px 18px 14px',
      textAlign: 'center'
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '10px',
      marginBottom: '8px'
    },
    typingDot: {
      width: '8px',
      height: '8px',
      background: '#bbb',
      borderRadius: '50%',
      margin: '0 2px',
      opacity: 0.5,
      animation: 'typing-bounce 1.2s infinite alternate'
    }
  };
  
  // Tạo hoặc lấy sessionId
  useEffect(() => {
    // Lấy sessionId từ localStorage, tạo mới nếu chưa có
    const savedSessionId = localStorage.getItem('chatbot_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem('chatbot_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Kiểm tra đăng nhập khi mở chatbot
      if (isAuthenticated) {
        // Nếu đã đăng nhập và không có tin nhắn, hiển thị tin nhắn chào mừng
        if (messages.length === 0) {
          setMessages([{
            sender: 'bot',
            text: 'Xin chào! Tôi là trợ lý thời trang ảo của cửa hàng quần áo. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn phong cách, hoặc trả lời các câu hỏi về thời trang. Bạn cần hỗ trợ gì?',
            timestamp: new Date()
          }]);
        }
      } else {
        // Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập
        setMessages([{
          sender: 'bot',
          text: 'Vui lòng đăng nhập để sử dụng tính năng chatbot. Bạn có thể đăng nhập hoặc đăng ký tài khoản để tiếp tục.',
          timestamp: new Date(),
          requireAuth: true // Flag để hiển thị nút đăng nhập
        }]);
      }
    }
  };

  // Lấy các gợi ý khi component được mount
  useEffect(() => {
    // Chỉ lấy gợi ý khi đã đăng nhập
    if (isAuthenticated) {
      const fetchSuggestions = async () => {
        try {
          const response = await getChatbotSuggestions();
          if (response.data.success && response.data.suggestions) {
            setSuggestions(response.data.suggestions);
          }
        } catch (error) {
          console.error('Lỗi khi lấy gợi ý:', error);
        }
      };
  
      fetchSuggestions();
    }
  }, [isAuthenticated]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Xóa message requireAuth khi đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated) {
      setMessages((prev) => prev.filter(msg => !msg.requireAuth));
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async (text) => {
    // Kiểm tra xác thực trước khi gửi tin nhắn
    if (!isAuthenticated) {
      setMessages([{
        sender: 'bot',
        text: 'Vui lòng đăng nhập để sử dụng tính năng chatbot.',
        timestamp: new Date(),
        requireAuth: true
      }]);
      setSuggestions([]); // Luôn ẩn gợi ý nếu chưa đăng nhập
      return;
    }
    
    if (!text.trim()) return;

    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setSuggestions([]); // Luôn ẩn gợi ý khi gửi câu hỏi

    try {
      // Gửi câu hỏi đến API với sessionId
      const response = await sendChatbotQuery(text, sessionId);
      
      if (response.data.success) {
        const botMessage = {
          sender: 'bot',
          text: response.data.answer,
          timestamp: new Date(),
          products: response.data.products || []
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Xử lý lỗi
        const errorMessage = {
          sender: 'bot',
          text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      // Thêm tin nhắn lỗi
      const errorMessage = {
        sender: 'bot',
        text: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSuggestions([]); // Luôn ẩn gợi ý sau khi gửi câu hỏi
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const clearChat = async () => {
    try {
      // Xóa lịch sử trên server (nếu đã đăng nhập)
      if (isAuthenticated) {
        await clearChatbotHistory(sessionId);
        
        // Xóa lịch sử local
        setMessages([{
          sender: 'bot',
          text: 'Lịch sử trò chuyện đã được xóa. Bạn cần hỗ trợ gì?',
          timestamp: new Date()
        }]);
      } else {
        // Nếu chưa đăng nhập
        setMessages([{
          sender: 'bot',
          text: 'Vui lòng đăng nhập để sử dụng tính năng chatbot.',
          timestamp: new Date(),
          requireAuth: true
        }]);
      }
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử chat:', error);
      
      // Thêm tin nhắn lỗi
      const errorMessage = {
        sender: 'bot',
        text: 'Đã xảy ra lỗi khi xóa lịch sử trò chuyện. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Render sản phẩm được gợi ý
  const renderProductSuggestions = (products) => {
    if (!products || products.length === 0) return null;

    return (
      <div style={{ marginTop: '10px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#4B5563' }}>Sản phẩm gợi ý:</p>
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '10px', 
          paddingBottom: '10px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F1F5F9',
          maxWidth: '100%',
          msOverflowStyle: 'none', // IE and Edge
          WebkitOverflowScrolling: 'touch', // Mượt hơn trên iOS
        }}>
          {products.map(product => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              style={{ 
                minWidth: '150px', 
                maxWidth: '150px',
                height: '180px',
                textDecoration: 'none', 
                color: 'inherit',
                display: 'block',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ 
                height: '100px', 
                backgroundColor: '#F9FAFB', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '5px'
              }}>
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    style={{ 
                      maxHeight: '90px', 
                      maxWidth: '90%', 
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                ) : (
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Không có ảnh</div>
                )}
              </div>
              <div style={{ padding: '8px' }}>
                <h4 style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  margin: '0 0 5px 0',
                  lineHeight: '1.3',
                  height: '32px'
                }}>
                  {product.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#EF4444'
                  }}>
                    {product.price?.toLocaleString()} ₫
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Hàm chuyển markdown đơn giản sang HTML (bold, xuống dòng)
  function formatBotText(text) {
    if (!text) return '';
    // Chuyển **text** thành <b>text</b>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Chuyển \n thành <br>
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  return (
    <div className="chatbot-container">
      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes chatbot-fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-bounce {
          0% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.5; }
        }
        @media (max-width: 600px) {
          .chatbot-dialog-mobile {
            width: 98vw !important;
            min-width: 0 !important;
            right: 1vw !important;
            left: 1vw !important;
            height: 90vh !important;
            bottom: 70px !important;
          }
        }
      `}</style>

      {/* Toggle button */}
      {!isAdminPage && (
        <button 
        onClick={toggleChatbot} 
        className="chatbot-toggle-button"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
        }}
      >
        <BsChatDots size={24} />
        </button>
      )}
      {/* Chatbot dialog */}
      {isOpen && (
        <div 
          className={window.innerWidth <= 600 ? "chatbot-dialog-mobile" : ""}
          style={styles.chatbotDialog}
        >
          <div style={styles.chatbotHeader}>
            <div className="d-flex align-items-center">
              <BsRobot className="me-2" size={20} />
              <h4 className="mb-0 fw-bold">Trợ lý thời trang</h4>
            </div>
            <div style={styles.chatbotActions}>
              {isAuthenticated && messages.length > 0 && (
                <button 
                  onClick={clearChat} 
                  style={styles.chatbotActionButton}
                  title="Xóa cuộc trò chuyện"
                  onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <BsTrash />
                </button>
              )}
              <button 
                onClick={toggleChatbot} 
                style={styles.chatbotActionButton}
                title="Đóng"
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <BsXLg />
              </button>
            </div>
          </div>
          
          <div style={styles.chatbotMessages}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.message,
                  ...(message.sender === 'user' ? styles.userMessage : {})
                }}
              >
                <div style={styles.messageAvatar}>
                  {message.sender === 'user' ? 
                    <BsPersonCircle size={24} /> : 
                    <BsRobot size={24} />
                  }
                </div>
                <div style={{
                  ...styles.messageContent,
                  ...(message.sender === 'user' ? styles.userMessageContent : {})
                }}>
                  {/* Hiển thị text: nếu là bot thì render HTML đã xử lý, nếu là user thì render thường */}
                  {message.sender === 'bot' ? (
                    <div className="message-text" dangerouslySetInnerHTML={{ __html: formatBotText(message.text) }} />
                  ) : (
                    <div className="message-text">{message.text}</div>
                  )}
                  {/* Hiển thị nút đăng nhập nếu cần */}
                  {message.requireAuth && (
                    <div className="auth-buttons mt-2">
                      <Link to="/login" className="btn btn-primary btn-sm me-2">Đăng nhập</Link>
                      <Link to="/register" className="btn btn-outline-primary btn-sm">Đăng ký</Link>
                    </div>
                  )}
                  {/* Hiển thị sản phẩm nếu có */}
                  {message.products && message.products.length > 0 && renderProductSuggestions(message.products)}
                  <div style={styles.messageTime}>{formatTimestamp(message.timestamp)}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={styles.typingIndicator}>
                <div style={{...styles.typingDot, animationDelay: '0s'}}></div>
                <div style={{...styles.typingDot, animationDelay: '0.2s'}}></div>
                <div style={{...styles.typingDot, animationDelay: '0.4s'}}></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {isAuthenticated ? (
            <>
              {suggestions.length > 0 && (
                <div style={styles.chatbotSuggestions}>
                  {suggestions.map((suggestion, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={styles.suggestionButton}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#3B82F6';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f1f5f9';
                        e.target.style.color = '#222';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} style={styles.chatbotInput}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isLoading}
                  style={styles.inputField}
                  onFocus={(e) => {
                    e.target.style.border = '1.5px solid #3B82F6';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid #e0e0e0';
                    e.target.style.background = '#f8fafc';
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !inputValue.trim()}
                  style={styles.submitButton}
                  onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.background = '#3B82F6'}
                >
                  <BsSend />
                </button>
              </form>
            </>
          ) : (
            <div style={styles.chatbotAuthMessage}>
              <p className="text-center mb-2">Vui lòng đăng nhập để tiếp tục trò chuyện</p>
              <div className="d-flex justify-content-center">
                <Link to="/login" className="btn btn-primary btn-sm me-2">Đăng nhập</Link>
                <Link to="/register" className="btn btn-outline-primary btn-sm">Đăng ký</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;