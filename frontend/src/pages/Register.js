import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaMobile, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        password: '',
        role: 'user' 
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await registerUser(formData);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            
            if (error.response) {
                // Xử lý các mã lỗi từ server
                switch (error.response.status) {
                    case 400:
                        toast.error('Thông tin không hợp lệ. Vui lòng kiểm tra lại.');
                        break;
                    case 409:
                        toast.error('Email hoặc số điện thoại đã được sử dụng.');
                        break;
                    default:
                        toast.error('Đăng ký thất bại. Vui lòng thử lại.');
                }
            } else if (error.request) {
                toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
            } else {
                toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page py-5 my-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-lg rounded-3">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">Đăng ký tài khoản</h2>
                                    <p className="text-muted">Tạo tài khoản để mua sắm nhanh hơn</p>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <label htmlFor="firstname" className="form-label">Họ</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaUser className="text-primary" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg bg-light"
                                                    id="firstname"
                                                    name="firstname"
                                                    placeholder="Nhập họ"
                                                    value={formData.firstname}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="lastname" className="form-label">Tên</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaUser className="text-primary" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg bg-light"
                                                    id="lastname"
                                                    name="lastname"
                                                    placeholder="Nhập tên"
                                                    value={formData.lastname}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaEnvelope className="text-primary" />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg bg-light"
                                                id="email"
                                                name="email"
                                                placeholder="Nhập địa chỉ email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <small className="text-muted">Chúng tôi sẽ không bao giờ chia sẻ email của bạn với bất kỳ ai khác.</small>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="mobile" className="form-label">Số điện thoại</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaMobile className="text-primary" />
                                            </span>
                                            <input
                                                type="tel"
                                                className="form-control form-control-lg bg-light"
                                                id="mobile"
                                                name="mobile"
                                                placeholder="Nhập số điện thoại"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaLock className="text-primary" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control form-control-lg bg-light"
                                                id="password"
                                                name="password"
                                                placeholder="Tạo mật khẩu mới"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={toggleShowPassword}
                                            >
                                                {showPassword ? <FaEyeSlash className="text-secondary" /> : <FaEye className="text-secondary" />}
                                            </button>
                                        </div>
                                        <small className="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
                                    </div>
                                    
                                    <div className="form-check mb-4">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="termsCheckbox" 
                                            required 
                                        />
                                        <label className="form-check-label" htmlFor="termsCheckbox">
                                            Tôi đồng ý với <Link to="/privacy" className="text-decoration-none">điều khoản và chính sách</Link>
                                        </label>
                                    </div>
                                    
                                    <div className="d-grid mb-4">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserPlus className="me-2" />
                                                    Đăng ký
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                                
                                <div className="text-center pt-3 border-top">
                                    <p className="mb-0">
                                        Đã có tài khoản? <Link to="/login" className="text-primary text-decoration-none fw-bold">Đăng nhập</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center mt-4">
                            <Link to="/" className="text-decoration-none text-secondary">
                                &larr; Quay về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Thêm CSS inline để đảm bảo đủ khoảng cách với footer */}
            <style jsx>{`
                .register-page {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default Register;