import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../api';
import { toast } from 'react-toastify';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
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
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Lịch Sử Đơn Hàng</h2>
            {orders.length === 0 ? (
                <div className="text-center p-5 bg-light rounded">
                    <h4>Không có đơn hàng nào.</h4>
                </div>
            ) : (
                <>
                    <div className="order-list">
                        {currentOrders.map((order) => (
                            <div key={order._id} className="card mb-4 shadow-sm">
                                <div className="card-header bg-white p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-1">Đơn hàng #{order._id}</h5>
                                            <p className="mb-0 text-muted">
                                                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className={`badge bg-${getStatusColor(order.orderStatus)} me-3`}>
                                                {order.orderStatus}
                                            </span>
                                            <button
                                                className="btn btn-outline-primary d-flex align-items-center"
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
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <h6 className="mb-3">Sản phẩm</h6>
                                                <div className="table-responsive">
                                                    <table className="table">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Tên sản phẩm</th>
                                                                <th>Số lượng</th>
                                                                <th>Màu sắc</th>
                                                                <th>Đơn giá</th>
                                                                <th>Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.products.map((item, index) => {
                                                                console.log('Item in order:', item);
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            {item.product ? (
                                                                                <>
                                                                                    {item.product.title}
                                                                                    {item.product.images?.[0] && (
                                                                                        <img
                                                                                            src={item.product.images[0]}
                                                                                            alt={item.product.title}
                                                                                            style={{width: '50px', marginLeft: '10px'}}
                                                                                        />
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-danger">Sản phẩm không tồn tại</span>
                                                                            )}
                                                                        </td>
                                                                        <td>{item.quantity}</td>
                                                                        <td>{item.color || 'Không có'}</td>
                                                                        <td>
                                                                            {item.product ? formatPrice(item.product.price) : 'N/A'}
                                                                        </td>
                                                                        <td>
                                                                            {item.product ? formatPrice(item.product.price * item.quantity) : 'N/A'}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot className="table-light">
                                                            <tr>
                                                                <td colSpan="4" className="text-end fw-bold">
                                                                    Tổng tiền:
                                                                </td>
                                                                <td className="fw-bold">
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
                                                <div className="shipping-info mb-4">
                                                    <h6 className="border-bottom pb-2">Thông tin giao hàng</h6>
                                                    <div className="p-2">
                                                        <p className="mb-1"><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                                                        <p className="mb-1"><strong>Thành phố:</strong> {order.shippingInfo.city}</p>
                                                        <p className="mb-1"><strong>Mã bưu điện:</strong> {order.shippingInfo.postalCode}</p>
                                                        <p className="mb-1"><strong>Quốc gia:</strong> {order.shippingInfo.country}</p>
                                                    </div>
                                                </div>
                                                <div className="payment-info">
                                                    <h6 className="border-bottom pb-2">Thông tin thanh toán</h6>
                                                    <div className="p-2">
                                                        <p className="mb-1">
                                                            <strong>Mã thanh toán:</strong> {order.paymentInfo.id}
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Trạng thái:</strong>{' '}
                                                            <span className={`badge bg-${getStatusColor(order.paymentInfo.status)}`}>
                                                                {order.paymentInfo.status}
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
                    
                    {/* Phân trang */}
                    <div className="d-flex justify-content-center mt-4">
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
                </>
            )}
        </div>
    );
};

export default OrderHistoryPage;
