import React, { useEffect, useState } from 'react';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api';

const CouponPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        expiry: '',
        discount: ''
    });
    const [editingCouponId, setEditingCouponId] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const response = await getAllCoupons();
        setCoupons(response.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCouponId) {
                await updateCoupon(editingCouponId, formData);
            } else {
                await createCoupon(formData);
            }
            setFormData({ name: '', expiry: '', discount: '' });
            setEditingCouponId(null);
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi thêm/sửa mã giảm giá:', error);
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            name: coupon.name,
            expiry: new Date(coupon.expiry).toISOString().split('T')[0],
            discount: coupon.discount
        });
        setEditingCouponId(coupon._id);
    };

    const handleDelete = async (id) => {
        await deleteCoupon(id);
        fetchCoupons();
    };

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Mã giảm giá</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mb-2" placeholder="Tên mã giảm giá" required />
                <input type="date" name="expiry" value={formData.expiry} onChange={handleChange} className="form-control mb-2" required />
                <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="form-control mb-2" placeholder="Phần trăm giảm giá" required />
                <button type="submit" className="btn btn-success">{editingCouponId ? 'Cập nhật' : 'Thêm'} Mã giảm giá</button>
            </form>
            <h2>Danh sách Mã giảm giá</h2>
            <ul className="list-group mb-4">
                {coupons.map(coupon => (
                    <li key={coupon._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h3>{coupon.name}</h3>
                            <p>Giảm giá: {coupon.discount}% - Hết hạn: {new Date(coupon.expiry).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(coupon)}>Sửa</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(coupon._id)}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CouponPage;