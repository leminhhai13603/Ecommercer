import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaUser, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Mô phỏng gửi form với setTimeout
        setTimeout(() => {
            // Xử lý gửi form liên hệ ở đây
            console.log('Form submitted:', formData);
            toast.success('Tin nhắn của bạn đã được gửi thành công!');
            // Reset form sau khi gửi
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="contact-page py-5">
            <div className="container">
                <div className="row mb-5">
                    <div className="col-lg-6 mx-auto text-center">
                        <h2 className="fw-bold mb-3">Liên hệ với chúng tôi</h2>
                        <p className="text-muted">Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào. Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.</p>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                            <div className="card-body p-4 text-center">
                                <div className="icon-box mb-3 mx-auto d-flex align-items-center justify-content-center">
                                    <FaMapMarkerAlt size={22} className="text-primary" />
                                </div>
                                <h5 className="card-title">Địa chỉ</h5>
                                <p className="card-text text-muted">206 tổ 2, Kiến Hưng, Hà Đông, Hà Nội</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                            <div className="card-body p-4 text-center">
                                <div className="icon-box mb-3 mx-auto d-flex align-items-center justify-content-center">
                                    <FaPhoneAlt size={22} className="text-primary" />
                                </div>
                                <h5 className="card-title">Điện thoại</h5>
                                <p className="card-text">
                                    <a href="tel:+84123456789" className="text-muted text-decoration-none">+84 123 456 789</a>
                                    <br />
                                    <a href="tel:+84987654321" className="text-muted text-decoration-none">+84 987 654 321</a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                            <div className="card-body p-4 text-center">
                                <div className="icon-box mb-3 mx-auto d-flex align-items-center justify-content-center">
                                    <FaEnvelope size={22} className="text-primary" />
                                </div>
                                <h5 className="card-title">Email</h5>
                                <p className="card-text">
                                    <a href="mailto:info@haifashion.com" className="text-muted text-decoration-none">info@haifashion.com</a>
                                    <br />
                                    <a href="mailto:support@haifashion.com" className="text-muted text-decoration-none">support@haifashion.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-body p-4">
                                <h3 className="mb-4 fw-bold">Gửi tin nhắn cho chúng tôi</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaUser className="text-muted" />
                                            </span>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="name" 
                                                name="name" 
                                                placeholder="Họ tên của bạn"
                                                value={formData.name} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaEnvelope className="text-muted" />
                                            </span>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                name="email" 
                                                placeholder="Địa chỉ email"
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="subject" 
                                            name="subject" 
                                            placeholder="Tiêu đề"
                                            value={formData.subject} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <textarea 
                                            className="form-control" 
                                            id="message" 
                                            name="message" 
                                            rows="5" 
                                            placeholder="Nội dung tin nhắn..."
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            required
                                        ></textarea>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary d-flex align-items-center"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane className="me-2" /> Gửi tin nhắn
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-body p-4">
                                <h3 className="mb-4 fw-bold">Giờ làm việc</h3>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="icon-box me-3">
                                        <FaClock className="text-primary" size={18} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-medium">Thứ 2 - Thứ 6</h6>
                                        <p className="text-muted mb-0">8:00 - 20:00</p>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center mb-3">
                                    <div className="icon-box me-3">
                                        <FaClock className="text-primary" size={18} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-medium">Thứ 7</h6>
                                        <p className="text-muted mb-0">9:00 - 18:00</p>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center mb-4">
                                    <div className="icon-box me-3">
                                        <FaClock className="text-primary" size={18} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-medium">Chủ nhật</h6>
                                        <p className="text-muted mb-0">10:00 - 16:00</p>
                                    </div>
                                </div>

                                <div className="map-container rounded-3 overflow-hidden mt-4">
                                    <iframe 
                                        src="https://www.google.com/maps?q=206+tổ+2+Kiến+Hưng+Hà+Đông+Hà+Nội&output=embed" 
                                        width="100%" 
                                        height="300" 
                                        style={{ border: 0 }} 
                                        allowFullScreen="" 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="HaiFashion Location"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .contact-page {
                    min-height: 80vh;
                }
                
                .icon-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: #f0f5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .form-control:focus {
                    box-shadow: none;
                    border-color: #86b7fe;
                }
                
                .input-group-text {
                    border-right: none;
                }
                
                .form-control {
                    border-left: none;
                }
                
                @media (max-width: 767.98px) {
                    .card {
                        margin-bottom: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;