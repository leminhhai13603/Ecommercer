import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; 2024 E-Commerce. Bản quyền thuộc về Lê Minh Hải.</p>
                <div className="footer-links">
                    <a href="/about">Giới thiệu</a>
                    <a href="/contact">Liên hệ</a>
                    <a href="/privacy">Chính sách bảo mật</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;