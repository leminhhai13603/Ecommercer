import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { changePassword } from '../api';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await changePassword(token, { currentPassword, newPassword });
            toast.success('Đổi mật khẩu thành công!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error('Đổi mật khẩu thất bại!');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Đổi Mật Khẩu</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label>Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Mật khẩu mới</label>
                    <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Đổi Mật Khẩu
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;
