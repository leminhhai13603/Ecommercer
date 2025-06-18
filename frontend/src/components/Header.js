import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
    FaShoppingCart, 
    FaUserCircle, 
    FaSignOutAlt, 
    FaKey, 
    FaSearch, 
    FaHome, 
    FaThList, 
    FaRegHeart, 
    FaHistory, 
    FaBars 
} from 'react-icons/fa';
import { getCart, logout } from '../api';

const Header = () => {
    const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const prevAuthState = useRef(false);

    const isAdminPage = location.pathname.startsWith('/admin');
    const isActive = (path) => location.pathname === path;

    // Hàm để lấy thông tin user từ API hoặc localStorage
    const fetchUserInfo = async () => {
        try {
            // Trong trường hợp này, không có hàm API từ api.js để lấy thông tin người dùng hiện tại
            // Thử lấy từ localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                return JSON.parse(savedUser);
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin user:', error);
            return null;
        }
    };

    // Khôi phục thông tin user từ localStorage
    useEffect(() => {
        const initializeUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            try {
                const userData = await fetchUserInfo();
                if (userData) {
                    setIsAuthenticated(true);
                    setUser(userData);
                } else {
                    // Nếu không lấy được thông tin user, đăng xuất
                    handleLogout();
                }
            } catch (error) {
                console.error('Lỗi khi khởi tạo thông tin user:', error);
                handleLogout();
            }
        };

        initializeUser();
    }, [setIsAuthenticated, setUser]);

    // Theo dõi thay đổi trạng thái đăng nhập để đóng dropdown
    useEffect(() => {
        if (isAuthenticated && !prevAuthState.current) {
            setDropdownOpen(false);
        }
        prevAuthState.current = isAuthenticated;
    }, [isAuthenticated]);

    // Cập nhật số lượng giỏ hàng
    useEffect(() => {
        const updateCartCount = async () => {
            if (!isAdminPage) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                        setCartCount(cartItems.length);
                    } else {
                        // Sử dụng getCart từ api.js
                        const response = await getCart();
                        const items = response.data.items || [];
                        setCartCount(items.length);
                    }
                } catch (error) {
                    console.error('Lỗi khi cập nhật giỏ hàng:', error);
                    setCartCount(0);
                }
            }
        };
        updateCartCount();
        
        // const intervalId = setInterval(updateCartCount, 5000);
        // return () => clearInterval(intervalId);
    }, [isAdminPage, location]);

    // Đóng dropdown khi thay đổi trang
    useEffect(() => {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Xử lý đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setDropdownOpen(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="header-container shadow-sm sticky-top">
            {/* Top bar - Chỉ hiển thị trên desktop */}
            {!isAdminPage && (
                <div className="top-bar py-2 bg-light border-bottom d-none d-lg-block">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <span className="text-muted small">
                                    <span className="fw-medium">Giao hàng miễn phí</span> cho đơn hàng từ 500.000₫
                                </span>
                            </div>
                            <div className="col-lg-6 text-end">
                                <Link to="/contact" className="text-decoration-none text-muted small me-3">
                                    Liên hệ
                                </Link>
                                <Link to="/about" className="text-decoration-none text-muted small me-3">
                                    Giới thiệu
                                </Link>
                                <Link to="/store-location" className="text-decoration-none text-muted small">
                                    Cửa hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main header */}
            <div className="main-header bg-white py-2">
                <div className="container-fluid px-3">
                    <div className="row align-items-center">
                        {/* Brand and hamburger menu for mobile */}
                        <div className="col-6 col-lg-2 d-flex align-items-center">
                            {isAdminPage ? (
                                <div
                                    className="d-flex align-items-center flex-nowrap"
                                    style={{ minWidth: 0 }}
                                >
                                    <h4 className="mb-0 text-primary text-nowrap me-2">Trang Quản Trị</h4>
                                    <span className="badge bg-primary text-nowrap flex-shrink-0">Admin</span>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        className="btn d-lg-none me-2 p-0"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                        <FaBars size={22} />
                                    </button>
                                    <Link to="/" className="text-decoration-none">
                                        <span className="fw-bold fs-4 text-primary">HaiFashion</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Search on desktop */}
                        {!isAdminPage && (
                            <div className="col-lg-5 d-none d-lg-block">
                                <form onSubmit={handleSearch} className="search-form">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control border-end-0"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            aria-label="Tìm kiếm"
                                        />
                                        <button className="btn btn-outline-secondary border-start-0" type="submit">
                                            <FaSearch />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Navigation on desktop */}
                        {!isAdminPage && (
                            <div className="col-lg-3 d-none d-lg-block">
                                <nav className="navbar-nav flex-row justify-content-center">
                                    <Link 
                                        to="/recommended" 
                                        className={`nav-link px-3 ${isActive('/recommended') ? 'active fw-medium' : ''}`}
                                    >
                                        <FaRegHeart className="me-1" /> Trang chủ
                                    </Link>
                                    <Link 
                                        to="/" 
                                        className={`nav-link px-3 ${isActive('/') ? 'active fw-medium' : ''}`}
                                    >
                                        <FaHome className="me-1" /> Sản phẩm
                                    </Link>
                                    {/* <Link 
                                        to="/products" 
                                        className={`nav-link px-3 ${isActive('/products') ? 'active fw-medium' : ''}`}
                                    >
                                        <FaThList className="me-1" /> Sản phẩm
                                    </Link> */}
                                </nav>
                            </div>
                        )}

                        {/* User actions */}
                        <div
                            className={`col-6 col-lg-2 d-flex align-items-center ${isAdminPage ? 'ms-auto flex-column align-items-center' : 'justify-content-end'}`}
                            style={isAdminPage ? { minHeight: 80 } : {}}
                        >
                            {isAuthenticated ? (
                                <div className={`position-relative user-dropdown${isAdminPage ? ' w-100 text-center' : ''}`} ref={dropdownRef}>
                                    <button
                                        className={`btn user-btn d-flex align-items-center${isAdminPage ? ' flex-column justify-content-center' : ''}`}
                                        onClick={toggleDropdown}
                                        aria-expanded={dropdownOpen}
                                        style={isAdminPage ? {padding: 0, background: 'none', border: 'none'} : {}}
                                    >
                                        <div className={`user-info${isAdminPage ? ' mb-1' : ' d-none d-md-block me-1'}`} style={isAdminPage ? {lineHeight: 1.2} : {}}>
                                            <small className="d-block text-muted">Xin chào,</small>
                                            <span className="fw-medium text-dark">
                                                {user?.firstname && user?.lastname 
                                                    ? `${user.firstname} ${user.lastname}`.length > 15 
                                                        ? `${user.firstname}`
                                                        : `${user.firstname} ${user.lastname}` 
                                                    : (user?.firstname || user?.lastname || 'User')}
                                            </span>
                                        </div>
                                        <FaUserCircle size={26} className="text-primary" />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="dropdown-menu show position-absolute end-0 mt-1 shadow-sm border-0 rounded-3" style={{ minWidth: '250px', zIndex: 1000 }}>
                                            <div className="dropdown-header border-bottom p-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="user-avatar me-3 text-center">
                                                        <FaUserCircle size={36} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{user?.firstname} {user?.lastname}</h6>
                                                        <small className="text-muted">{user?.email}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {!isAdminPage && (
                                                <div className="dropdown-body p-2">
                                                    <Link to="/profile" className="dropdown-item py-2 d-flex align-items-center">
                                                        <FaUserCircle className="me-3 text-primary" /> Trang cá nhân
                                                    </Link>
                                                    <Link to="/order-history" className="dropdown-item py-2 d-flex align-items-center">
                                                        <FaHistory className="me-3 text-primary" /> Lịch sử đơn hàng
                                                    </Link>
                                                    <Link to="/change-password" className="dropdown-item py-2 d-flex align-items-center">
                                                        <FaKey className="me-3 text-primary" /> Đổi mật khẩu
                                                    </Link>
                                                </div>
                                            )}
                                            
                                            <div className="dropdown-footer p-2 border-top">
                                                <button onClick={handleLogout} className="dropdown-item py-2 d-flex align-items-center text-danger">
                                                    <FaSignOutAlt className="me-3" /> Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <Link to="/login" className="btn btn-sm btn-primary me-2">Đăng nhập</Link>
                                    <Link to="/register" className="btn btn-sm btn-outline-primary d-none d-md-inline-block">Đăng ký</Link>
                                </div>
                            )}

                            {/* Giỏ hàng - Chỉ hiển thị khi không phải trang admin */}
                            {!isAdminPage && (
                                <Link to="/cart" className="ms-3 cart-btn position-relative">
                                    <FaShoppingCart size={24} className="text-primary" />
                                    {cartCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {cartCount}
                                            <span className="visually-hidden">sản phẩm trong giỏ hàng</span>
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search bar for mobile */}
                    {!isAdminPage && (
                        <div className="row mt-2 d-lg-none">
                            <div className="col-12">
                                <form onSubmit={handleSearch} className="search-form">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control border-end-0"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            aria-label="Tìm kiếm"
                                        />
                                        <button className="btn btn-outline-secondary border-start-0" type="submit">
                                            <FaSearch />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {!isAdminPage && mobileMenuOpen && (
                <div 
                    className="mobile-nav bg-white shadow-sm position-absolute w-100 py-3" 
                    style={{ zIndex: 1000 }}
                    ref={mobileMenuRef}
                >
                    <div className="container-fluid">
                        <nav className="mobile-navbar">
                            <Link to="/" className={`mobile-nav-item d-flex align-items-center p-2 rounded mb-2 ${isActive('/') ? 'active text-primary fw-medium' : ''}`}>
                                <FaHome className="me-3" /> Trang chủ
                            </Link>
                            <Link to="/products" className={`mobile-nav-item d-flex align-items-center p-2 rounded mb-2 ${isActive('/products') ? 'active text-primary fw-medium' : ''}`}>
                                <FaThList className="me-3" /> Sản phẩm
                            </Link>
                            <Link to="/recommended" className={`mobile-nav-item d-flex align-items-center p-2 rounded mb-2 ${isActive('/recommended') ? 'active text-primary fw-medium' : ''}`}>
                                <FaRegHeart className="me-3" /> Gợi ý cho bạn
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/register" className="mobile-nav-item d-flex align-items-center p-2 rounded mb-2">
                                    <FaUserCircle className="me-3" /> Đăng ký
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}

            <style jsx>{`
                // .admin-header-title {
                //     font-size: 18px;
                //     font-weight: 700;
                //     margin-left: 8px;
                // }
                .header-container {
                    background-color: white;
                    width: 100%;
                    z-index: 1000;
                }
                
                .nav-link {
                    color: #495057;
                    position: relative;
                    transition: all 0.2s;
                }
                
                .nav-link:hover {
                    color: #0d6efd;
                }
                
                .nav-link.active {
                    color: #0d6efd;
                }
                
                .nav-link.active:after {
                    content: '';
                    position: absolute;
                    width: 60%;
                    height: 2px;
                    background-color: #0d6efd;
                    bottom: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                }
                
                .search-form .form-control:focus {
                    box-shadow: none;
                    border-color: #ced4da;
                }
                
                .search-form .btn {
                    background-color: white;
                }
                
                .search-form .btn:hover {
                    color: #0d6efd;
                }
                
                .cart-btn {
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                
                .cart-btn:hover {
                    transform: scale(1.1);
                }
                
                .user-btn {
                    background: none;
                    border: none;
                    padding: 0.375rem 0.5rem;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                
                .user-btn:hover, .user-btn:focus {
                    color: #0d6efd;
                    background-color: rgba(0, 0, 0, 0.03);
                }
                
                .dropdown-item {
                    border-radius: 0.375rem;
                    transition: all 0.2s;
                }
                
                .dropdown-item:hover {
                    background-color: #f2f7ff;
                    color: #0d6efd;
                }
                
                .mobile-nav-item {
                    color: #495057;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                
                .mobile-nav-item:hover {
                    background-color: #f2f7ff;
                    color: #0d6efd;
                }
                
                .mobile-nav-item.active {
                    background-color: #f2f7ff;
                    color: #0d6efd;
                }
                
                .mobile-nav-item.active:after {
                    content: '';
                    position: absolute;
                    width: 3px;
                    height: 100%;
                    background-color: #0d6efd;
                    left: 0;
                    top: 0;
                }
                
                @media (max-width: 992px) {
                    .main-header {
                        padding-top: 0.5rem;
                        padding-bottom: 0.5rem;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
