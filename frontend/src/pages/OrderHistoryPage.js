import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../api';
import { toast } from 'react-toastify';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null); // Theo dõi đơn hàng được mở rộng

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await getUserOrders(token);
                setOrders(response.data || []);
            } catch (error) {
                toast.error('Không thể tải danh sách đơn hàng.');
            }
        };

        fetchOrders();
    }, []);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
    };

    return (
        <div className="container mt-5">
            <h2>Lịch Sử Đơn Hàng</h2>
            {orders.length === 0 ? (
                <p>Không có đơn hàng nào.</p>
            ) : (
                <div className="order-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card mb-4">
                            <div className="order-summary d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Mã đơn hàng:</strong> {order._id} <br />
                                    <strong>Ngày đặt:</strong>{' '}
                                    {new Date(order.createdAt).toLocaleDateString()} <br />
                                    <strong>Trạng thái:</strong> {order.orderStatus}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => toggleOrderDetails(order._id)}
                                >
                                    {expandedOrderId === order._id ? 'Thu gọn' : 'Xem chi tiết'}
                                </button>
                            </div>
                            {expandedOrderId === order._id && (
                                <div className="order-details mt-3">
                                    <h5>Chi tiết đơn hàng</h5>
                                    <ul>
                                        {order.products.map((item) => (
                                            <li key={item._id} className="order-item">
                                                <strong>Sản phẩm:</strong> {item.product} <br />
                                                <strong>Số lượng:</strong> {item.quantity} <br />
                                                <strong>Màu sắc:</strong> {item.color}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="shipping-info mt-3">
                                        <h6>Thông tin giao hàng</h6>
                                        <p>
                                            <strong>Địa chỉ:</strong> {order.shippingInfo?.address} <br />
                                            <strong>Thành phố:</strong> {order.shippingInfo?.city} <br />
                                            <strong>Mã bưu điện:</strong> {order.shippingInfo?.postalCode}
                                        </p>
                                    </div>
                                    <div className="payment-info mt-3">
                                        <h6>Thông tin thanh toán</h6>
                                        <p>
                                            <strong>Trạng thái:</strong> {order.paymentInfo?.status} <br />
                                            <strong>Mã thanh toán:</strong> {order.paymentInfo?.id}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
