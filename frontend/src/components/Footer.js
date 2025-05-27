import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white w-100">
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-4 col-md-6 mb-4 mb-md-0 ps-4">
                        <h5 className="text-uppercase mb-4">HaiFashion</h5>
                        <p className="mb-3">
                            Cung cấp các sản phẩm thời trang chất lượng cao với giá cả hợp lý.
                        </p>
                        <div className="d-flex">
                            <a href="#!" className="text-white me-3">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#!" className="text-white me-3">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#!" className="text-white me-3">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Liên kết</h5>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <Link to="/" className="text-white text-decoration-none">Trang chủ</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/about" className="text-white text-decoration-none">Giới thiệu</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/contact" className="text-white text-decoration-none">Liên hệ</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/privacy" className="text-white text-decoration-none">Chính sách bảo mật</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Liên hệ</h5>
                        <p className="mb-2">
                            <i className="fas fa-home me-3"></i> 206 Kiến Hưng, Hà Nội
                        </p>
                        <p className="mb-2">
                            <i className="fas fa-envelope me-3"></i> info@HaiFashion.com
                        </p>
                        <p className="mb-2">
                            <i className="fas fa-phone me-3"></i> +84 387042730
                        </p>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Đăng ký nhận tin</h5>
                        <p className="mb-3">Nhận thông báo về các chương trình khuyến mãi mới nhất.</p>
                        <div className="input-group">
                            <input type="email" className="form-control" placeholder="Email của bạn" />
                            <button className="btn btn-primary" type="button">Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-dark text-white text-center p-3 w-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                © 2023 Copyright: <a className="text-white" href="#!">HaiFashion.com</a>
            </div>
        </footer>
    );
};

export default Footer;
