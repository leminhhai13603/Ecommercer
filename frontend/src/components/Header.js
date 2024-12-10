import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Thực hiện đăng xuất
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

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
                <div className="user-info d-flex align-items-center">
                    {isAuthenticated ? (
                        <>
                            <span className="me-3">Xin chào</span>
                            <button onClick={handleLogout} className="btn btn-outline-danger me-3">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline-primary me-2">Đăng nhập</Link>
                            <Link to="/register" className="btn btn-outline-secondary me-3">Đăng ký</Link>
                        </>
                    )}
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
