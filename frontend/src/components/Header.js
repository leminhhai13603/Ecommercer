import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-light">
            <div className="container d-flex justify-content-between align-items-center py-3">
                <div className="logo">
                    <Link to="/" className="text-decoration-none">Logo</Link>
                    <span className="ms-2">E-Commerce</span>
                </div>
                <div className="search-bar">
                    <input type="text" className="form-control" placeholder="Tìm kiếm sản phẩm..." />
                </div>
                <div className="user-info">
                    <Link to="/login" className="btn btn-outline-primary me-2">Đăng nhập</Link>
                    <Link to="/register" className="btn btn-outline-secondary">Đăng ký</Link>
                    <div className="cart">
                        <Link to="/cart" className="btn btn-outline-success">
                            <i className="fas fa-shopping-cart"></i>
                        </Link>
                        <span className="cart-count">0</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;