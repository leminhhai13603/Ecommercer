import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.data.token);
            setIsAuthenticated(true);
            
            if (response.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            
            toast.success('Đăng nhập thành công');
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
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Đăng nhập</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">Đăng nhập</button>
                                </div>
                            </form>
                            <div className="mt-3 text-center">
                                <Link to="/forgot-password">Quên mật khẩu?</Link>
                            </div>
                            <div className="mt-3 text-center">
                                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
