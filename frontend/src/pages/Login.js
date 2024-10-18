import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            localStorage.setItem('token', response.data.token);
            if (response.data.isBlocked === true) {
                setError('Tài khoản của bạn đã bị chặn. Vui lòng liên hệ với quản trị viên để được giải quyết.');
                console.log("ngu");
            } if (response.data.role === 'admin') {
                navigate('/admin');
            } if (response.data.role === 'user') {
                navigate('/');
            }
        } catch (error) {
            setError('Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.');
        }
    };

    return (
        <div className="container">
            <h1 className="my-4">Đăng nhập</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                    <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Đăng nhập</button>
            </form>
        </div>
    );
};

export default Login;