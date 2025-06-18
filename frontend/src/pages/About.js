import React from 'react';
import { FaHistory, FaAward, FaUsers, FaShippingFast, FaHeadset, FaMoneyBillWave, FaHeart } from 'react-icons/fa';

const About = () => {
    const teamMembers = [
        {
            name: 'Lê Minh Hải',
            position: 'Nhà sáng lập & CEO',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
            bio: 'Với hơn 15 năm kinh nghiệm trong ngành thời trang, anh Hải đã xây dựng HaiFashion từ một cửa hàng nhỏ thành thương hiệu được yêu thích ngày nay.'
        },
        {
            name: 'Lê Minh Hải',
            position: 'Giám đốc Sáng tạo',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8YnVzaW5lc3MlMjB3b21hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
            bio: 'Anh Hải đã mang đến tầm nhìn sáng tạo độc đáo cho các bộ sưu tập của HaiFashion, kết hợp phong cách hiện đại với giá trị truyền thống.'
        },
        {
            name: 'Lê Minh Hải',
            position: 'Giám đốc Vận hành',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
            bio: 'Anh Hải quản lý mọi hoạt động hậu cần và vận hành, đảm bảo trải nghiệm mua sắm của khách hàng luôn suôn sẻ từ lúc đặt hàng đến khi nhận được sản phẩm.'
        }
    ];

    const coreValues = [
        {
            icon: <FaHeart className="text-danger" />,
            title: 'Đam mê với thời trang',
            description: 'Chúng tôi yêu thời trang và mong muốn truyền tải niềm đam mê đó qua từng thiết kế.'
        },
        {
            icon: <FaAward className="text-warning" />,
            title: 'Chất lượng hàng đầu',
            description: 'Cam kết mang đến những sản phẩm với chất lượng tốt nhất, từ nguyên liệu đến quy trình sản xuất.'
        },
        {
            icon: <FaHeadset className="text-info" />,
            title: 'Dịch vụ khách hàng',
            description: 'Đặt khách hàng làm trọng tâm, luôn lắng nghe và cải thiện dựa trên phản hồi từ khách hàng.'
        },
        {
            icon: <FaShippingFast className="text-success" />,
            title: 'Nhanh chóng & Tiện lợi',
            description: 'Đơn giản hóa quy trình mua sắm, giao hàng nhanh chóng để mang lại trải nghiệm tiện lợi nhất.'
        }
    ];

    return (
        <div className="about-page py-5">
            <div className="container">
                {/* Hero Section */}
                <div className="row mb-5">
                    <div className="col-lg-8 mx-auto text-center">
                        <h1 className="fw-bold display-5 mb-4">Về chúng tôi</h1>
                        <p className="lead text-muted">
                            HaiFashion là thương hiệu thời trang Việt Nam, chuyên cung cấp các sản phẩm chất lượng cao 
                            với thiết kế hiện đại và phù hợp với văn hóa Á Đông.
                        </p>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="row align-items-center mb-5">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <img 
                            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzaGlvbiUyMHN0b3JlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" 
                            alt="HaiFashion Store" 
                            className="img-fluid rounded-3 shadow-sm"
                        />
                    </div>
                    <div className="col-lg-6">
                        <div className="ps-lg-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="icon-box me-3">
                                    <FaHistory className="text-primary" size={24} />
                                </div>
                                <h2 className="h3 fw-bold mb-0">Câu chuyện của chúng tôi</h2>
                            </div>
                            <p>
                                HaiFashion được thành lập vào năm 2015 bởi những người trẻ đam mê thời trang và mong muốn 
                                mang đến cho người Việt Nam những sản phẩm chất lượng với giá cả hợp lý. Xuất phát từ một 
                                cửa hàng nhỏ tại Đà Nẵng, chúng tôi đã phát triển thành một thương hiệu có mặt trên toàn quốc.
                            </p>
                            <p>
                                Chúng tôi tin rằng thời trang không chỉ là về phong cách, mà còn là cách chúng ta thể hiện 
                                bản thân. Vì vậy, mỗi thiết kế của HaiFashion đều được chú trọng đến từng chi tiết, không 
                                chỉ mang tính thẩm mỹ cao mà còn đáp ứng được nhu cầu thực tiễn của người dùng.
                            </p>
                            <p className="mb-0">
                                Hiện nay, HaiFashion có hệ thống hơn 20 cửa hàng trên toàn quốc và website thương mại điện tử 
                                phục vụ hàng nghìn đơn hàng mỗi tháng. Chúng tôi tự hào là thương hiệu thời trang Việt được 
                                yêu thích bởi nhiều người trẻ trong nước.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Core Values */}
                <div className="row mb-5">
                    <div className="col-12 text-center mb-4">
                        <div className="d-flex align-items-center justify-content-center mb-3">
                            <div className="icon-box me-3">
                                <FaAward className="text-primary" size={24} />
                            </div>
                            <h2 className="h3 fw-bold mb-0">Giá trị cốt lõi</h2>
                        </div>
                        <p className="text-muted w-75 mx-auto">
                            Những giá trị cốt lõi định hình mọi hoạt động và quyết định của chúng tôi.
                        </p>
                    </div>

                    <div className="row">
                        {coreValues.map((value, index) => (
                            <div key={index} className="col-md-6 col-lg-3 mb-4">
                                <div className="card border-0 shadow-sm h-100 text-center rounded-3 p-3 hover-card">
                                    <div className="card-body">
                                        <div className="icon-circle mb-3 mx-auto">
                                            {value.icon}
                                        </div>
                                        <h5 className="fw-bold mb-3">{value.title}</h5>
                                        <p className="text-muted mb-0">{value.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Our Team */}
                <div className="row mb-5">
                    <div className="col-12 text-center mb-4">
                        <div className="d-flex align-items-center justify-content-center mb-3">
                            <div className="icon-box me-3">
                                <FaUsers className="text-primary" size={24} />
                            </div>
                            <h2 className="h3 fw-bold mb-0">Đội ngũ của chúng tôi</h2>
                        </div>
                        <p className="text-muted w-75 mx-auto">
                            HaiFashion tự hào có đội ngũ lãnh đạo tài năng và tâm huyết.
                        </p>
                    </div>

                    <div className="row">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="col-md-6 col-lg-4 mb-4">
                                <div className="card border-0 shadow-sm h-100 rounded-3 hover-card">
                                    <div className="card-img-wrapper rounded-top overflow-hidden">
                                        <img 
                                            src={member.image} 
                                            className="card-img-top team-img" 
                                            alt={member.name} 
                                        />
                                    </div>
                                    <div className="card-body text-center">
                                        <h5 className="fw-bold mb-1">{member.name}</h5>
                                        <p className="text-primary mb-3">{member.position}</p>
                                        <p className="text-muted mb-0">{member.bio}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="why-choose-us bg-light rounded-3 p-4 p-md-5 mb-5">
                    <div className="row">
                        <div className="col-12 text-center mb-4">
                            <h2 className="h3 fw-bold">Tại sao chọn HaiFashion?</h2>
                            <p className="text-muted">Cam kết của chúng tôi dành cho khách hàng</p>
                        </div>
                        
                        <div className="col-md-4 mb-4 mb-md-0">
                            <div className="d-flex">
                                <div className="icon-box-sm me-3">
                                    <FaShippingFast className="text-primary" />
                                </div>
                                <div>
                                    <h5 className="fw-medium mb-2">Miễn phí vận chuyển</h5>
                                    <p className="text-muted mb-0">Cho đơn hàng từ 500.000₫ trên toàn quốc.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4 mb-4 mb-md-0">
                            <div className="d-flex">
                                <div className="icon-box-sm me-3">
                                    <FaMoneyBillWave className="text-primary" />
                                </div>
                                <div>
                                    <h5 className="fw-medium mb-2">Đổi trả dễ dàng</h5>
                                    <p className="text-muted mb-0">Đổi trả trong vòng 30 ngày nếu không hài lòng.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="d-flex">
                                <div className="icon-box-sm me-3">
                                    <FaHeadset className="text-primary" />
                                </div>
                                <div>
                                    <h5 className="fw-medium mb-2">Hỗ trợ 24/7</h5>
                                    <p className="text-muted mb-0">Luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .about-page {
                    min-height: 80vh;
                }
                
                .icon-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: #f0f5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .icon-box-sm {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #f0f5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .icon-circle {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background-color: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                
                .icon-circle svg {
                    font-size: 30px;
                }
                
                .hover-card {
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                
                .hover-card:hover .icon-circle {
                    background-color: #e9f0ff;
                }
                
                .team-img {
                    height: 250px;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                
                .card:hover .team-img {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default About;