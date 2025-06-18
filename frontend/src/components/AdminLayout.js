import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: '📦' },
    { path: '/admin/brands', label: 'Quản lý Thương hiệu', icon: '🏷️' },
    { path: '/admin/product-categories', label: 'Quản lý Danh mục SP', icon: '📁' },
    // { path: '/admin/blogs', label: 'Quản lý Blog', icon: '✍️' },
    // { path: '/admin/blog-categories', label: 'Quản lý Danh mục Blog', icon: '📚' },
    { path: '/admin/coupons', label: 'Quản lý Coupon', icon: '🎟️' },
    { path: '/admin/users', label: 'Quản lý Người dùng', icon: '👤' },
    { path: '/admin/orders', label: 'Quản lý Đơn hàng', icon: '🛒' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: isMenuOpen ? '250px' : '80px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMenuOpen ? 'flex-start' : 'center',
          position: 'relative',
          overflowY: 'auto', // Cho phép cuộn nếu sidebar dài
        }}
      >
        <button
          onClick={toggleMenu}
          style={{
            backgroundColor: '#16213e',
            color: 'white',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            margin: '10px',
            width: '90%',
            textAlign: 'center',
            fontSize: '16px',
            transition: 'all 0.3s',
          }}
        >
          {isMenuOpen ? '❮ Đóng' : '❯ Mở'}
        </button>

        <nav style={{ flex: 1, width: '100%' }}>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
            }}
          >
            {menuItems.map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <Link
                  to={item.path}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMenuOpen ? '10px' : '0',
                    justifyContent: isMenuOpen ? 'flex-start' : 'center',
                    width: '100%',
                    borderRadius: '5px',
                    background: '#1f4068',
                    transition: 'all 0.3s',
                  }}
                >
                  <span>{item.icon}</span>
                  {isMenuOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto', // Cho phép cuộn nội dung chính
          padding: '20px',
          backgroundColor: '#f4f4f4',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
