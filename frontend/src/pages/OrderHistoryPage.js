import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../api';
import { toast } from 'react-toastify';
import { FaAngleDown, FaAngleUp, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        fetchOrders();
        // Thêm hiệu ứng fade in khi component mount
        setTimeout(() => setFadeIn(true), 100);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getUserOrders();
            console.log('API Response:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Đang xử lý':
                return <FaBox className="me-2" />;
            case 'Đang giao hàng':
                return <FaShippingFast className="me-2" />;
            case 'Đã giao hàng':
                return <FaCheckCircle className="me-2" />;
            case 'Đã hủy':
                return <FaTimesCircle className="me-2" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đang xử lý':
                return 'warning';
            case 'Đang giao hàng':
                return 'info';
            case 'Đã giao hàng':
                return 'success';
            case 'Đã hủy':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    // Tính toán các đơn hàng hiện tại để hiển thị
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    // Xử lý thay đổi trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setExpandedOrderId(null); // Thu gọn tất cả các đơn hàng khi chuyển trang
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`container my-5 ${fadeIn ? 'fade-in' : ''}`}>
            <div className="text-center mb-5">
                <h2 className="display-4 mb-3">Lịch Sử Đơn Hàng</h2>
                <p className="text-muted">Theo dõi và quản lý các đơn hàng của bạn</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center p-5 bg-light rounded shadow-sm">
                    <FaBox size={50} className="text-muted mb-3" />
                    <h4>Chưa có đơn hàng nào</h4>
                    <p className="text-muted">Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn</p>
                </div>
            ) : (
                <>
                    <div className="order-list">
                        {currentOrders.map((order) => (
                            <div 
                                key={order._id} 
                                className="card mb-4 shadow-sm border-0 order-card"
                            >
                                <div className="card-header bg-white p-4 border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-2 order-id">Đơn hàng #{order._id}</h5>
                                            <p className="mb-0 text-muted">
                                                <small>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</small>
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className={`badge bg-${getStatusColor(order.orderStatus)} d-flex align-items-center me-3 p-2`}>
                                                {getStatusIcon(order.orderStatus)}
                                                {order.orderStatus}
                                            </span>
                                            <button
                                                className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                                onClick={() => toggleOrderDetails(order._id)}
                                            >
                                                {expandedOrderId === order._id ? (
                                                    <>Thu gọn <FaAngleUp className="ms-2" /></>
                                                ) : (
                                                    <>Xem chi tiết <FaAngleDown className="ms-2" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {expandedOrderId === order._id && (
                                    <div className="card-body p-4 order-details">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <h6 className="mb-4 text-primary">Chi tiết sản phẩm</h6>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Sản phẩm</th>
                                                                <th>Số lượng</th>
                                                                <th>Màu sắc</th>
                                                                <th>Đơn giá</th>
                                                                <th>Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.products.map((item, index) => (
                                                                <tr key={index} className="product-row">
                                                                    <td>
                                                                        {item.product ? (
                                                                            <div className="d-flex align-items-center">
                                                                                {item.product.images?.[0] && (
                                                                                    <img
                                                                                        src={item.product.images[0].url}
                                                                                        alt={item.product.title}
                                                                                        className="product-thumbnail me-3"
                                                                                        style={{
                                                                                            width: '50px',
                                                                                            height: '50px',
                                                                                            objectFit: 'cover',
                                                                                            borderRadius: '4px'
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                <span>{item.product.title}</span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-danger">Sản phẩm không tồn tại</span>
                                                                        )}
                                                                    </td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>
                                                                        <span className="badge bg-light text-dark">
                                                                            {item.color || 'Mặc định'}
                                                                        </span>
                                                                    </td>
                                                                    <td>{item.product ? formatPrice(item.product.price) : 'N/A'}</td>
                                                                    <td className="fw-bold">
                                                                        {item.product ? formatPrice(item.product.price * item.quantity) : 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className="table-light">
                                                            <tr>
                                                                <td colSpan="4" className="text-end fw-bold">
                                                                    Tổng tiền:
                                                                </td>
                                                                <td className="fw-bold text-primary">
                                                                    {formatPrice(order.products.reduce((total, item) => {
                                                                        if (item.product && typeof item.product === 'object') {
                                                                            return total + (item.product.price * item.quantity);
                                                                        }
                                                                        return total;
                                                                    }, 0))}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="shipping-info mb-4 bg-light p-4 rounded">
                                                    <h6 className="mb-3 text-primary d-flex align-items-center">
                                                        <FaMapMarkerAlt className="me-2" />
                                                        Thông tin giao hàng
                                                    </h6>
                                                    <div className="info-details">
                                                        <p className="mb-2"><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                                                        <p className="mb-2"><strong>Thành phố:</strong> {order.shippingInfo.city}</p>
                                                        <p className="mb-2"><strong>Mã bưu điện:</strong> {order.shippingInfo.postalCode}</p>
                                                        <p className="mb-0"><strong>Quốc gia:</strong> {order.shippingInfo.country}</p>
                                                    </div>
                                                </div>
                                                <div className="payment-info bg-light p-4 rounded">
                                                    <h6 className="mb-3 text-primary d-flex align-items-center">
                                                        <FaCreditCard className="me-2" />
                                                        Thông tin thanh toán
                                                    </h6>
                                                    <div className="info-details">
                                                        <p className="mb-2">
                                                            <strong>Mã thanh toán:</strong><br/>
                                                            <span className="text-muted">{order.paymentInfo.id}</span>
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Trạng thái:</strong>{' '}
                                                            <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <nav aria-label="Điều hướng trang">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <li
                                            key={index + 1}
                                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
                .fade-in {
                    animation: fadeIn 0.5s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .order-card {
                    transition: all 0.3s ease;
                }

                .order-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                }

                .order-id {
                    color: #2c3e50;
                    font-weight: 600;
                }

                .order-details {
                    animation: slideDown 0.3s ease-out;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .product-row {
                    transition: background-color 0.2s ease;
                }

                .product-row:hover {
                    background-color: #f8f9fa;
                }

                .info-details {
                    font-size: 0.95rem;
                }

                .badge {
                    font-weight: 500;
                    padding: 0.5em 0.8em;
                }

                .table {
                    vertical-align: middle;
                }

                .product-thumbnail {
                    transition: transform 0.2s ease;
                }

                .product-thumbnail:hover {
                    transform: scale(1.1);
                }

                .page-link {
                    color: #0d6efd;
                    border-radius: 0.25rem;
                    margin: 0 2px;
                }

                .page-link:hover {
                    background-color: #0d6efd;
                    color: white;
                }

                .page-item.active .page-link {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
            `}</style>
        </div>
    );
};

export default OrderHistoryPage;
