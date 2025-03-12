import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/user/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error) {
            toast.error('Cập nhật thông tin thất bại!');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Trang Cá Nhân</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label>Địa chỉ</label>
                    <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
            </form>
        </div>
    );
};

export default ProfilePage;
