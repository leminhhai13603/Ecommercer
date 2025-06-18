import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setIsAuthenticated, setUser } = useContext(AuthContext); 
    const navigate = useNavigate();
    const [redirect, setRedirect] = useState('/');

    // Kiểm tra xem có URL chuyển hướng đã lưu hay không
    useEffect(() => {
        const savedRedirect = localStorage.getItem('redirectAfterLogin');
        if (savedRedirect) {
            setRedirect(savedRedirect);
        }
        
        // Kiểm tra nếu đã lưu email trong localStorage
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await loginUser({ email, password });

            if (response && response.data) {
                const { token, refreshToken, ...user } = response.data;

                // ✅ Lưu token và thông tin người dùng vào localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Nếu người dùng chọn "Ghi nhớ đăng nhập"
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setIsAuthenticated(true); 
                setUser(user);

                toast.success('Đăng nhập thành công');

                // ✅ Điều hướng sau khi đăng nhập
                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    // Kiểm tra và sử dụng URL chuyển hướng đã lưu
                    const savedRedirect = localStorage.getItem('redirectAfterLogin');
                    // Xóa URL chuyển hướng sau khi sử dụng
                    localStorage.removeItem('redirectAfterLogin');
                    
                    if (savedRedirect) {
                        navigate(savedRedirect);
                    } else {
                        navigate('/');
                    }
                }
            } else {
                throw new Error('Phản hồi API không hợp lệ');
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        toast.error('Tài khoản hoặc mật khẩu không đúng');
                        break;
                    case 404:
                        toast.error('Tài khoản không tồn tại');
                        break;
                    default:
                        toast.error('Đăng nhập thất bại. Vui lòng thử lại sau.');
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
        <div className="login-page py-5 my-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-lg rounded-3">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">Đăng nhập</h2>
                                    <p className="text-muted">Đăng nhập để tiếp tục mua sắm</p>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaEnvelope className="text-primary" />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg bg-light"
                                                id="email"
                                                placeholder="Nhập địa chỉ email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between">
                                            <label htmlFor="password" className="form-label">Mật khẩu</label>
                                            <Link to="/forgot-password" className="text-primary text-decoration-none small">
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaLock className="text-primary" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control form-control-lg bg-light"
                                                id="password"
                                                placeholder="Nhập mật khẩu"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                className="input-group-text bg-light border-start-0"
                                                type="button"
                                                onClick={toggleShowPassword}
                                            >
                                                {showPassword ? <FaEyeSlash className="text-secondary" /> : <FaEye className="text-secondary" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="rememberMe">
                                            Ghi nhớ đăng nhập
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
                                                    Đang đăng nhập...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSignInAlt className="me-2" />
                                                    Đăng nhập
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                                
                                <div className="text-center pt-3 border-top">
                                    <p className="mb-0">
                                        Chưa có tài khoản? <Link to="/register" className="text-primary text-decoration-none fw-bold">Đăng ký ngay</Link>
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
                .login-page {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default Login;
