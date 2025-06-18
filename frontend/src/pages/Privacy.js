import React from 'react';
import { FaShieldAlt, FaUserShield, FaDatabase, FaCookieBite, FaGlobe, FaPhoneAlt } from 'react-icons/fa';

const Privacy = () => {
    return (
        <div className="privacy-page py-5">
            <div className="container">
                <div className="row mb-5">
                    <div className="col-lg-8 mx-auto text-center">
                        <FaShieldAlt size={46} className="text-primary mb-3" />
                        <h1 className="fw-bold mb-3">Chính sách bảo mật</h1>
                        <p className="text-muted lead">
                            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này mô tả cách chúng tôi thu thập, 
                            sử dụng và bảo vệ thông tin cá nhân của bạn.
                        </p>
                        <div className="updated-date mt-3 text-muted small">
                            Cập nhật lần cuối: 01/08/2023
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-3 mb-4">
                        <div className="policy-nav card border-0 shadow-sm rounded-3 sticky-lg-top" style={{ top: '100px' }}>
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">Mục lục</h5>
                                <nav className="nav flex-column">
                                    <a href="#collect" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Thu thập thông tin
                                    </a>
                                    <a href="#use" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Sử dụng thông tin
                                    </a>
                                    <a href="#protect" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Bảo vệ thông tin
                                    </a>
                                    <a href="#cookies" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Cookies
                                    </a>
                                    <a href="#third-parties" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Bên thứ ba
                                    </a>
                                    <a href="#contact" className="nav-link text-decoration-none py-2 ps-0 d-flex align-items-center">
                                        <span className="nav-bullet me-2"></span>Liên hệ
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-body p-4 p-lg-5">
                                <section id="collect" className="mb-5">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaUserShield className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Thu thập thông tin</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi.
                                        Thông tin cá nhân có thể bao gồm:
                                    </p>
                                    
                                    <ul className="mb-3">
                                        <li>Họ tên</li>
                                        <li>Địa chỉ email</li>
                                        <li>Số điện thoại</li>
                                        <li>Địa chỉ giao hàng</li>
                                        <li>Thông tin thanh toán</li>
                                    </ul>
                                    
                                    <p>
                                        Chúng tôi cũng có thể thu thập thông tin không cá nhân như loại trình duyệt, địa chỉ IP, 
                                        thiết bị được sử dụng để truy cập trang web và thời gian truy cập.
                                    </p>
                                </section>

                                <section id="use" className="mb-5">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaDatabase className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Sử dụng thông tin</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Chúng tôi sử dụng thông tin cá nhân của bạn cho các mục đích sau:
                                    </p>
                                    
                                    <ul className="mb-3">
                                        <li>Xử lý đơn hàng và giao hàng</li>
                                        <li>Cung cấp dịch vụ khách hàng</li>
                                        <li>Gửi thông tin cập nhật về đơn hàng</li>
                                        <li>Cải thiện trải nghiệm của bạn trên trang web</li>
                                        <li>Gửi thông tin quảng cáo và khuyến mãi (nếu được cho phép)</li>
                                    </ul>
                                    
                                    <p>
                                        Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào.
                                    </p>
                                </section>

                                <section id="protect" className="mb-5">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaShieldAlt className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Bảo vệ thông tin</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, 
                                        sử dụng hoặc tiết lộ. Các biện pháp bảo mật bao gồm:
                                    </p>
                                    
                                    <ul className="mb-3">
                                        <li>Mã hóa dữ liệu</li>
                                        <li>Firewall bảo vệ</li>
                                        <li>Kiểm soát truy cập vật lý và điện tử</li>
                                        <li>Đào tạo nhân viên về quy trình bảo mật</li>
                                    </ul>
                                    
                                    <p>
                                        Tuy nhiên, không có phương thức truyền qua Internet hoặc lưu trữ điện tử nào là an toàn 100%. 
                                        Do đó, chúng tôi không thể đảm bảo bảo mật tuyệt đối.
                                    </p>
                                </section>

                                <section id="cookies" className="mb-5">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaCookieBite className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Cookies</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Trang web của chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn. Cookies là các tệp nhỏ được 
                                        lưu trữ trên thiết bị của bạn để ghi nhớ thông tin về lượt truy cập của bạn.
                                    </p>
                                    
                                    <p className="mb-3">
                                        Các loại cookies chúng tôi sử dụng:
                                    </p>
                                    
                                    <ul className="mb-3">
                                        <li>Cookies thiết yếu: Cần thiết để trang web hoạt động</li>
                                        <li>Cookies phân tích: Giúp chúng tôi hiểu cách bạn sử dụng trang web</li>
                                        <li>Cookies chức năng: Nhớ các tùy chọn của bạn</li>
                                        <li>Cookies quảng cáo: Hiển thị quảng cáo phù hợp với sở thích</li>
                                    </ul>
                                    
                                    <p>
                                        Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu hóa cookies 
                                        có thể ảnh hưởng đến trải nghiệm của bạn trên trang web.
                                    </p>
                                </section>

                                <section id="third-parties" className="mb-5">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaGlobe className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Bên thứ ba</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Chúng tôi có thể chia sẻ thông tin cá nhân của bạn với các bên thứ ba trong các trường hợp sau:
                                    </p>
                                    
                                    <ul className="mb-3">
                                        <li>Đối tác giao hàng để vận chuyển đơn hàng</li>
                                        <li>Đối tác thanh toán để xử lý giao dịch</li>
                                        <li>Nhà cung cấp dịch vụ hỗ trợ hoạt động của trang web</li>
                                        <li>Cơ quan pháp luật khi có yêu cầu hợp pháp</li>
                                    </ul>
                                    
                                    <p>
                                        Chúng tôi đảm bảo rằng các bên thứ ba tuân thủ các tiêu chuẩn bảo mật tương đương với chính sách của chúng tôi.
                                    </p>
                                </section>

                                <section id="contact" className="mb-0">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="icon-box me-3">
                                            <FaPhoneAlt className="text-primary" />
                                        </div>
                                        <h2 className="h3 fw-bold mb-0">Liên hệ</h2>
                                    </div>
                                    
                                    <p className="mb-3">
                                        Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật của chúng tôi, vui lòng liên hệ:
                                    </p>
                                    
                                    <ul className="list-unstyled">
                                        <li><strong>Email:</strong> <a href="mailto:privacy@haifashion.com" className="text-decoration-none">privacy@haifashion.com</a></li>
                                        <li><strong>Điện thoại:</strong> <a href="tel:+84123456789" className="text-decoration-none">+84 123 456 789</a></li>
                                        <li><strong>Địa chỉ:</strong> 206 tổ 2, Kiến Hưng, Hà Đông, Hà Nội</li>
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .privacy-page {
                    min-height: 80vh;
                }
                
                .icon-box {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background-color: #f0f5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-link {
                    color: #495057;
                    // transition: all 0.2s;
                }
                
                .nav-link:hover .nav-bullet {
                    background-color: #0d6efd;
                }
                
                section {
                    scroll-margin-top: 120px;
                }
            `}</style>
        </div>
    );
};

export default Privacy;