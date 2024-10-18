import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="container">
            <h1 className="my-4">Admin Dashboard</h1>
            <div className="list-group">
                <Link to="/admin/products" className="list-group-item list-group-item-action">Quản lý Sản phẩm</Link>
                <Link to="/admin/brands" className="list-group-item list-group-item-action">Quản lý Thương hiệu</Link>
                <Link to="/admin/product-categories" className="list-group-item list-group-item-action">Quản lý Danh mục sản phẩm</Link>
                <Link to="/admin/blogs" className="list-group-item list-group-item-action">Quản lý Blog</Link>
                <Link to="/admin/blog-categories" className="list-group-item list-group-item-action">Quản lý Danh mục bài viết</Link>
                <Link to="/admin/coupons" className="list-group-item list-group-item-action">Quản lý Coupon</Link>
                <Link to="/admin/orders" className="list-group-item list-group-item-action">Quản lý Đơn hàng</Link>
                <Link to="/admin/users" className="list-group-item list-group-item-action">Quản lý Người dùng</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;