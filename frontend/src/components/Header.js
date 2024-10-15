import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <div className="logo">
                    <Link to="/">Logo</Link>
                    <span>E-Commerce</span>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Tìm kiếm sản phẩm..." />
                    <button className="search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
                <div className="user-info">
                    <Link to="/login">Đăng nhập</Link>
                    <Link to="/register">Đăng ký</Link>
                    <div className="cart">
                        <Link to="/cart">
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