import React, { useState } from 'react';
import { loginUser } from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            console.log('Đăng nhập thành công:', response.data);
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
        }
    };

    return (
        <div>
            <h1>Đăng Nhập</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Đăng Nhập</button>
            </form>
        </div>
    );
};

export default Login;