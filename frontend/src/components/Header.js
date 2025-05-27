import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaShoppingCart, FaUserCircle, FaSignOutAlt, FaKey } from 'react-icons/fa';

const Header = () => {
    const { isAuthenticated, setIsAuthenticated, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const prevAuthState = useRef(false);

    const isAdminPage = location.pathname.startsWith('/admin');

    // Theo dõi thay đổi trạng thái đăng nhập để đóng dropdown
    useEffect(() => {
        // Nếu vừa mới đăng nhập, đảm bảo dropdown đóng
        if (isAuthenticated && !prevAuthState.current) {
            setDropdownOpen(false);
        }
        prevAuthState.current = isAuthenticated;
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAdminPage) {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            setCartCount(cartItems.length);
        }
    }, [isAdminPage]);

    // Đóng dropdown khi thay đổi trang
    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    // Xử lý đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setDropdownOpen(false); // Đảm bảo dropdown đóng khi đăng xuất
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    return (
        <header className="bg-light shadow-sm border-bottom w-100">
            <div className="container-fluid px-3 d-flex justify-content-between align-items-center py-2">
                {/* Logo hoặc Admin Title */}
                <div className="d-flex align-items-center">
                    {isAdminPage ? (
                        <div className="d-flex align-items-center">
                            <h4 className="mb-0 text-primary">Trang Quản Trị</h4>
                            <span className="ms-2 badge bg-primary">Admin Dashboard</span>
                        </div>
                    ) : (
                        <Link to="/" className="text-decoration-none fw-bold fs-4 text-primary me-4">HaiFashion</Link>
                    )}
                </div>

                {/* Dropdown Người dùng */}
                <div className="d-flex align-items-center">
                    {isAuthenticated ? (
                        <div 
                            className="position-relative me-3" 
                            ref={dropdownRef}
                        >
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center"
                                onClick={toggleDropdown}
                            >
                                <FaUserCircle className="me-2" />
                                {user?.firstname && user?.lastname 
                                    ? `${user.firstname} ${user.lastname}` 
                                    : (user?.firstname || user?.lastname || 'User')}
                            </button>

                            {dropdownOpen && (
                                <ul className="dropdown-menu show position-absolute" style={{ top: '100%', right: 0, zIndex: 1000 }}>
                                    {!isAdminPage && (
                                        <>
                                            <li>
                                                <Link to="/profile" className="dropdown-item">
                                                    <FaUserCircle className="me-2" /> Trang cá nhân
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/order-history" className="dropdown-item">
                                                    <FaShoppingCart className="me-2" /> Lịch sử đơn hàng
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/change-password" className="dropdown-item">
                                                    <FaKey className="me-2" /> Đổi mật khẩu
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-item">
                                            <FaSignOutAlt className="me-2" /> Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline-primary me-2">Đăng nhập</Link>
                            <Link to="/register" className="btn btn-outline-secondary">Đăng ký</Link>
                        </>
                    )}

                    {/* Giỏ hàng - Chỉ hiển thị khi không phải trang admin */}
                    {!isAdminPage && (
                        <Link to="/cart" className="btn btn-outline-success d-flex align-items-center position-relative">
                            <FaShoppingCart size={22} />
                            <span className="ms-1">Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
