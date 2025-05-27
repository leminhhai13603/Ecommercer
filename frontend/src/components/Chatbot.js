import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsSend, BsRobot, BsPersonCircle, BsXLg, BsChatDots, BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { sendChatbotQuery, getChatbotSuggestions, clearChatbotHistory } from '../api';
import { v4 as uuidv4 } from 'uuid';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  
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
    if (!isOpen && messages.length === 0) {
      // Thêm tin nhắn chào mừng khi mở chatbot lần đầu
      setMessages([{
        sender: 'bot',
        text: 'Xin chào! Tôi là KIA - trợ lý thời trang ảo của cửa hàng quần áo. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn phong cách, hoặc trả lời các câu hỏi về thời trang. Bạn cần hỗ trợ gì?',
        timestamp: new Date()
      }]);
    }
  };

  // Lấy các gợi ý khi component được mount
  useEffect(() => {
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
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async (text) => {
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

    try {
      // Gửi câu hỏi đến API với sessionId
      const response = await sendChatbotQuery(text, sessionId);
      
      if (response.data.success) {
        // Thêm tin nhắn phản hồi từ bot
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
      if (localStorage.getItem('token')) {
        await clearChatbotHistory(sessionId);
      }
      
      // Xóa lịch sử local
      setMessages([{
        sender: 'bot',
        text: 'Lịch sử trò chuyện đã được xóa. Bạn cần hỗ trợ gì?',
        timestamp: new Date()
      }]);
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
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '11px', 
                    color: '#6B7280' 
                  }}>
                    {/* Hiển thị sao đánh giá */}
                    <span style={{ 
                      color: '#F59E0B',
                      marginRight: '2px'
                    }}>★</span>
                    <span>{product.rating}</span>
                    {product.reviewCount > 0 && (
                      <span style={{ marginLeft: '3px' }}>({product.reviewCount})</span>
                    )}
                  </div>
                </div>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#DC2626', 
                  margin: '0',
                  textAlign: 'right'
                }}>
                  {product.price.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const chatbotStyles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999
    },
    chatButton: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: '#3B82F6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      border: 'none'
    },
    chatWindow: {
      position: 'absolute',
      bottom: '70px',
      right: '0',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: '#3B82F6',
      color: 'white',
      padding: '12px 16px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      display: 'flex',
      alignItems: 'center'
    },
    messageContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      backgroundColor: '#f7f7f7'
    },
    messageWrapper: {
      marginBottom: '16px',
      display: 'flex'
    },
    userMessageWrapper: {
      justifyContent: 'flex-end'
    },
    botMessageWrapper: {
      justifyContent: 'flex-start'
    },
    message: {
      maxWidth: '80%',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    userMessage: {
      backgroundColor: '#3B82F6',
      color: 'white'
    },
    botMessage: {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0'
    },
    inputContainer: {
      padding: '12px',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: 'white'
    },
    inputForm: {
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '20px',
      border: '1px solid #e0e0e0',
      outline: 'none'
    },
    sendButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3B82F6',
      color: 'white',
      marginLeft: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer'
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '8px'
    },
    typingDot: {
      height: '8px',
      width: '8px',
      margin: '0 2px',
      backgroundColor: '#bbb',
      borderRadius: '50%',
      display: 'inline-block',
      opacity: 0.4,
      animation: 'typing 1.4s infinite ease-in-out'
    }
  };

  return (
    <div style={chatbotStyles.container}>
      {/* Nút chat */}
      <button 
        style={chatbotStyles.chatButton}
        onClick={toggleChatbot}
      >
        {isOpen ? <BsXLg size={24} /> : <BsChatDots size={24} />}
      </button>
      
      {/* Chatbot container */}
      {isOpen && (
        <div style={chatbotStyles.chatWindow}>
          {/* Header */}
          <div style={chatbotStyles.header}>
            <BsRobot size={24} style={{ marginRight: '8px' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Trợ lý ảo</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Hỗ trợ tìm kiếm sản phẩm</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              <button 
                onClick={clearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  opacity: '0.8',
                  transition: 'opacity 0.2s'
                }}
                title="Xóa lịch sử trò chuyện"
                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                <BsTrash size={16} />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div style={chatbotStyles.messageContainer}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...chatbotStyles.messageWrapper,
                  ...(msg.sender === 'user' ? chatbotStyles.userMessageWrapper : chatbotStyles.botMessageWrapper)
                }}
              >
                <div 
                  style={{
                    ...chatbotStyles.message,
                    ...(msg.sender === 'user' ? chatbotStyles.userMessage : chatbotStyles.botMessage)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    {msg.sender === 'user' ? (
                      <>
                        <span style={{ fontSize: '12px', opacity: 0.8, marginRight: '4px' }}>{formatTimestamp(msg.timestamp)}</span>
                        <BsPersonCircle size={14} />
                      </>
                    ) : (
                      <>
                        <BsRobot size={14} style={{ marginRight: '4px' }} />
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>{formatTimestamp(msg.timestamp)}</span>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.sender === 'bot' && msg.products && renderProductSuggestions(msg.products)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ ...chatbotStyles.messageWrapper, ...chatbotStyles.botMessageWrapper }}>
                <div style={{ ...chatbotStyles.message, ...chatbotStyles.botMessage }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BsRobot size={14} style={{ marginRight: '4px' }} />
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>{formatTimestamp(new Date())}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ 
                      height: '8px', 
                      width: '8px', 
                      margin: '0 2px', 
                      backgroundColor: '#bbb', 
                      borderRadius: '50%', 
                      display: 'inline-block', 
                      opacity: 0.4,
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '0s'
                    }}></div>
                    <div style={{ 
                      height: '8px', 
                      width: '8px', 
                      margin: '0 2px', 
                      backgroundColor: '#bbb', 
                      borderRadius: '50%', 
                      display: 'inline-block', 
                      opacity: 0.4,
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '0.2s'
                    }}></div>
                    <div style={{ 
                      height: '8px', 
                      width: '8px', 
                      margin: '0 2px', 
                      backgroundColor: '#bbb', 
                      borderRadius: '50%', 
                      display: 'inline-block', 
                      opacity: 0.4,
                      animation: 'typing 1.4s infinite ease-in-out',
                      animationDelay: '0.4s'
                    }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions */}
          {messages.length <= 2 && suggestions.length > 0 && (
            <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f7f7f7' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Gợi ý:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    style={{ 
                      fontSize: '12px', 
                      backgroundColor: '#EBF5FF', 
                      color: '#3B82F6', 
                      padding: '4px 8px', 
                      borderRadius: '16px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <form onSubmit={handleSubmit} style={chatbotStyles.inputContainer}>
            <div style={chatbotStyles.inputForm}>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Nhập câu hỏi của bạn..."
                style={chatbotStyles.input}
                disabled={isLoading}
              />
              <button
                type="submit"
                style={{
                  ...chatbotStyles.sendButton,
                  opacity: !inputValue.trim() || isLoading ? 0.5 : 1
                }}
                disabled={!inputValue.trim() || isLoading}
              >
                <BsSend size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* CSS cho typing animation */}
      <style>
        {`
          @keyframes typing {
            0% {
              transform: translateY(0px);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-5px);
              opacity: 0.9;
            }
            100% {
              transform: translateY(0px);
              opacity: 0.4;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;