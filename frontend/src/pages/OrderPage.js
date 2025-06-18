/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, getUserById } from '../api';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [processingOrder, setProcessingOrder] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const ordersPerPage = 5;

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

        setUserNames(prev => ({ ...prev, ...newNames }));
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllOrders();
            const orderData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
                ? response.data.data
                : [];
            setOrders(orderData);
            await fetchUserNames(orderData);
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [fetchUserNames]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const refreshOrders = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);

    const isValidStatusTransition = (currentStatus, newStatus) => {
        const statusFlow = {
            'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
            'Đang giao hàng': ['Đã giao hàng', 'Đã hủy'],
            'Đã giao hàng': [],
            'Đã hủy': []
        };
        return statusFlow[currentStatus]?.includes(newStatus);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const order = orders.find(o => o._id === orderId);
        if (!order) {
            toast.error('Không tìm thấy đơn hàng');
            return;
        }

        if (!isValidStatusTransition(order.orderStatus, newStatus)) {
            toast.error(`Không thể chuyển từ trạng thái "${order.orderStatus}" sang "${newStatus}"`);
            return;
        }

        if (processingOrder) {
            toast.warning('Đang xử lý một đơn hàng khác, vui lòng đợi');
            return;
        }

        setProcessingOrder(orderId);
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                )
            );
            refreshOrders();
            toast.success(`Đã cập nhật trạng thái đơn hàng thành "${newStatus}"`);
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
        } finally {
            setProcessingOrder(null);
        }
    };

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const filterOrdersByDate = useCallback((ordersData) => {
        if (!startDate && !endDate) return ordersData;

        return ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            return orderDate >= start && orderDate <= end;
        });
    }, [startDate, endDate]);

    useEffect(() => {
        const filtered = filterOrdersByDate(orders);
        setFilteredOrders(filtered);

        const revenue = filtered.reduce((total, order) => {
            const orderTotal = order.products.reduce((sum, item) => {
                return item.product ? sum + (item.product.price * item.quantity) : sum;
            }, 0);
            return total + orderTotal;
        }, 0);
        
        setTotalRevenue(revenue);
    }, [orders, filterOrdersByDate]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
            setCurrentPage(0);
        } else if (name === 'endDate') {
            setEndDate(value);
            setCurrentPage(0);
        }
    };

    const getCurrentOrders = useCallback(() => {
        const offset = currentPage * ordersPerPage;
        return filteredOrders.slice(offset, offset + ordersPerPage);
    }, [currentPage, filteredOrders]);

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Quản lý Đơn hàng</h1>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="form-group">
                        <label className="form-label">Từ ngày:</label>
                        <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={startDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label className="form-label">Đến ngày:</label>
                        <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h5 className="card-title">Tổng doanh thu</h5>
                            <h3 className="card-text">
                                {totalRevenue.toLocaleString()} VNĐ
                            </h3>
                            <small>
                                {startDate && endDate 
                                    ? `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}`
                                    : 'Tất cả thời gian'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Khách hàng</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getCurrentOrders().length > 0 ? (
                            getCurrentOrders().map(order => {
                                try {
                                    const totalAmount = order.products.reduce((total, item) => {
                                        return item.product ? total + item.product.price * item.quantity : total;
                                    }, 0);
    
                                    return (
                                        <tr key={order._id}>
                                            <td>{order._id.slice(-8)}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>{userNames[order.user?._id] || "Không có tên"}</td>
                                            <td>{order.user?.email || 'Không có email'}</td>
                                            <td>
                                                {order.shippingInfo?.address}, {order.shippingInfo?.city}
                                            </td>
                                            <td>{totalAmount.toLocaleString()} VNĐ</td>
                                            <td>
                                                <span className={`badge ${getStatusClass(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-info btn-sm py-0 px-2 me-1" 
                                                    onClick={() => handleStatusChange(order._id, 'Đang xử lý')} 
                                                    disabled={order.orderStatus === 'Đang xử lý' || processingOrder === order._id}
                                                >
                                                    Xử lý
                                                </button>
                                                <button 
                                                    className="btn btn-warning btn-sm py-0 px-2 me-1" 
                                                    onClick={() => handleStatusChange(order._id, 'Đang giao hàng')} 
                                                    disabled={order.orderStatus === 'Đang giao hàng' || processingOrder === order._id}
                                                >
                                                    Giao hàng
                                                </button>
                                                <button 
                                                    className="btn btn-success btn-sm py-0 px-2 me-1" 
                                                    onClick={() => handleStatusChange(order._id, 'Đã giao hàng')} 
                                                    disabled={order.orderStatus === 'Đã giao hàng' || processingOrder === order._id}
                                                >
                                                    Hoàn thành
                                                </button>
                                                <button 
                                                    className="btn btn-danger py-0 px-2 btn-sm" 
                                                    onClick={() => handleStatusChange(order._id, 'Đã hủy')} 
                                                    disabled={order.orderStatus === 'Đã hủy' || processingOrder === order._id}
                                                >
                                                    Hủy
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                } catch (error) {
                                    console.error("Lỗi khi hiển thị đơn hàng:", error, order);
                                    return (
                                        <tr key={order._id || Math.random().toString()}>
                                            <td colSpan="8" className="text-center text-danger">
                                                Lỗi hiển thị đơn hàng
                                            </td>
                                        </tr>
                                    );
                                }
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">Không có đơn hàng nào trong khoảng thời gian này.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ReactPaginate
                previousLabel={'← Trước'}
                nextLabel={'Sau →'}
                pageCount={Math.ceil(filteredOrders.length / ordersPerPage)}
                onPageChange={handlePageClick}
                containerClassName={'pagination justify-content-center mt-4'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'page-item'}
                nextClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextLinkClassName={'page-link'}
                activeClassName={'active'}
                disabledClassName={'disabled'}
            />

            <style>{`
                .form-group {
                    margin-bottom: 1rem;
                }
                .card {
                    transition: all 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                .badge {
                    font-size: 0.9em;
                    padding: 0.5em 1em;
                }
            `}</style>
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
