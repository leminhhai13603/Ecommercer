/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, getUserById } from '../api';
import ReactPaginate from 'react-paginate';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const ordersPerPage = 4;

    const fetchUserNames = useCallback(async (orders) => {
        const userIds = [...new Set(orders.map(order => order.user?._id))];
        const newNames = {};

        await Promise.all(userIds.map(async (id) => {
            if (id && !userNames[id]) {
                try {
                    const response = await getUserById(id);
                    const user = response.data;
                    newNames[id] = `${user.firstname} ${user.lastname}`;
                } catch (error) {
                    console.error(`Lỗi khi lấy thông tin người dùng với ID ${id}:`, error);
                    newNames[id] = "Không có tên";
                }
            }
        }));

        setUserNames(prevNames => ({ ...prevNames, ...newNames }));
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllOrders();
            const orderData = response.data.data;
            setOrders(orderData);
            await fetchUserNames(orderData);
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchUserNames]);
    
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        }
    };

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const offset = currentPage * ordersPerPage;
    const currentOrders = orders.slice(offset, offset + ordersPerPage);
    const pageCount = Math.ceil(orders.length / ordersPerPage);

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Quản lý Đơn hàng</h1>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.length > 0 ? (
                        currentOrders.map(order => {
                            const totalAmount = order.products.reduce((total, item) => {
                                return item.product ? total + item.product.price * item.quantity : total;
                            }, 0);

                            return (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{userNames[order.user?._id] || "Không có tên"}</td>
                                    <td>{order.user?.email || 'Không có email'}</td>
                                    <td>{order.shippingInfo?.address}</td>
                                    <td>{totalAmount.toLocaleString()} VNĐ</td>
                                    <td><span className={`badge ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span></td>
                                    <td>
                                        <button className="btn btn-info btn-sm me-2" onClick={() => handleStatusChange(order._id, 'Đang xử lý')} disabled={order.orderStatus === 'Đang xử lý'}>Xử lý</button>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChange(order._id, 'Đang giao hàng')} disabled={order.orderStatus === 'Đang giao hàng'}>Giao hàng</button>
                                        <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChange(order._id, 'Đã giao hàng')} disabled={order.orderStatus === 'Đã giao hàng'}>Hoàn thành</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(order._id, 'Đã hủy')} disabled={order.orderStatus === 'Đã hủy'}>Hủy</button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">Không có đơn hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ReactPaginate
                previousLabel={'← Trước'}
                nextLabel={'Sau →'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'pagination justify-content-center mt-4'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link custom-page-link'}
                activeClassName={'active custom-active'}
                previousClassName={'page-item'}
                nextClassName={'page-item'}
                previousLinkClassName={'page-link custom-nav-link'}
                nextLinkClassName={'page-link custom-nav-link'}
            />
        </div>
    );
};

const getStatusClass = (status) => {
    switch (status) {
        case 'Đang xử lý': return 'bg-info';
        case 'Đang giao hàng': return 'bg-warning';
        case 'Đã giao hàng': return 'bg-success';
        case 'Đã hủy': return 'bg-danger';
        default: return 'bg-secondary';
    }
};

export default OrderPage;
