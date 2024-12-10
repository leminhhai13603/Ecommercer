import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import ProductPage from './ProductPage';
import BrandPage from './BrandPage';
import ProductCategoryPage from './ProductCategoryPage';
import BlogPage from './BlogPage';
import BlogCategoryPage from './BlogCategoryPage';
import CouponPage from './CouponPage';
import OrderPage from './OrderPage';
import UserPage from './UserPage';
import { Navigate } from 'react-router-dom';



const AdminDashboard = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Nội dung chính (trái) */}
        <div className="col-md-9">
          <Routes>
            <Route path="/" element={<Navigate to="products" />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="brands" element={<BrandPage />} />
            <Route path="product-categories" element={<ProductCategoryPage />} />
            <Route path="blogs" element={<BlogPage />} />
            <Route path="blog-categories" element={<BlogCategoryPage />} />
            <Route path="coupons" element={<CouponPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="users" element={<UserPage />} />
          </Routes>
        </div>

        {/* Menu (phải) */}
        <div className="col-md-3">
          <div className="admin-menu">
            <h3 className="mt-4">Menu</h3>
            <ul className="list-group">
              <li className="list-group-item">
                <Link to="/admin/products">Quản lý Sản phẩm</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/brands">Quản lý Thương hiệu</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/product-categories">Quản lý Danh mục Sản phẩm</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/blogs">Quản lý Blog</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/blog-categories">Quản lý Danh mục Blog</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/coupons">Quản lý Coupon</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/orders">Quản lý Đơn hàng</Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/users">Quản lý Người dùng</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
