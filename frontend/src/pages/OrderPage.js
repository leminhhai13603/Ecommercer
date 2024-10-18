import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../api';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const response = await getAllOrders();
        setOrders(response.data.data);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        }
    };

    const filteredOrders = statusFilter
        ? orders.filter(order => order.status === statusFilter)
        : orders;

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Đơn hàng</h1>
            <div className="mb-3">
                <label htmlFor="statusFilter" className="form-label">Lọc theo trạng thái:</label>
                <select
                    id="statusFilter"
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đang giao hàng">Đang giao hàng</option>
                    <option value="Đã giao hàng">Đã giao hàng</option>
                    <option value="Đã hủy">Đã hủy</option>
                </select>
            </div>
            <ul className="list-group mb-4">
                {filteredOrders.map(order => (
                    <li key={order._id} className="list-group-item">
                        <h3>Đơn hàng #{order._id}</h3>
                        <p>Khách hàng: {order.user.name}</p>
                        <p>Tổng tiền: {order.totalPrice} VNĐ</p>
                        <p>Trạng thái: 
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className="form-select d-inline-block w-auto ms-2"
                            >
                                <option value="Đang xử lý">Đang xử lý</option>
                                <option value="Đang giao hàng">Đang giao hàng</option>
                                <option value="Đã giao hàng">Đã giao hàng</option>
                                <option value="Đã hủy">Đã hủy</option>
                            </select>
                        </p>
                        <h4>Sản phẩm:</h4>
                        <ul>
                            {order.products.map(item => (
                                <li key={item.product._id}>
                                    {item.product.title} - Số lượng: {item.quantity} - Giá: {item.price} VNĐ
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderPage;