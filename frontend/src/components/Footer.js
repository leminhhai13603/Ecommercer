import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white py-4 mt-5">
            <div className="container d-flex justify-content-between">
                {/* Thông tin bản quyền */}
                <div>
                    <p>&copy; 2024 E-Commerce. Bản quyền thuộc về Lê Minh Hải.</p>
                    <p>Email: <a href="mailto:leminhhai136a@gmail.com" className="text-white">leminhhai136a@gmail.com</a></p>
                </div>

                {/* Liên kết nhanh */}
                <div>
                    <h5>Liên kết nhanh</h5>
                    <ul className="list-unstyled">
                        <li><Link to="/about" className="text-white">Giới thiệu</Link></li>
                        <li><Link to="/contact" className="text-white">Liên hệ</Link></li>
                        <li><Link to="/privacy" className="text-white">Chính sách bảo mật</Link></li>
                    </ul>
                </div>

                {/* Mạng xã hội */}
                <div>
                    <h5>Kết nối với chúng tôi</h5>
                    <div className="d-flex gap-3">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook-f text-white fs-4"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram text-white fs-4"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter text-white fs-4"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
