import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../api';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Vui lòng đăng nhập để xem giỏ hàng');
                    navigate('/login');
                    return;
                }

                const response = await getCart();
                // Xử lý response khi giỏ hàng trống hoặc có sản phẩm
                if (response && response.data) {
                    // Nếu response.data là null hoặc undefined, set mảng rỗng
                    if (!response.data) {
                        setCartItems([]);
                        return;
                    }
                    
                    // Nếu response.data là mảng rỗng
                    if (Array.isArray(response.data) && response.data.length === 0) {
                        setCartItems([]);
                        return;
                    }

                    // Nếu response.data có items property
                    if (response.data.items) {
                        setCartItems(response.data.items);
                        return;
                    }

                    // Nếu response.data là mảng các items
                    if (Array.isArray(response.data)) {
                        setCartItems(response.data);
                        return;
                    }

                    // Trường hợp còn lại, set mảng rỗng
                    setCartItems([]);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                // Không set error state nếu giỏ hàng trống
                if (error.response?.status !== 404) {
                    setError(error.response?.data?.message || 'Không thể tải giỏ hàng');
                    toast.error(error.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại sau.');
                }
                setCartItems([]); // Set mảng rỗng trong mọi trường hợp lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    const handleUpdateQuantity = async (productId, color, newQuantity) => {
        try {
            if (newQuantity < 1) {
                toast.error('Số lượng phải lớn hơn 0');
                return;
            }
            const response = await updateCartItem(productId, color, newQuantity);
            if (response && response.data) {
                setCartItems(prevItems => 
                    prevItems.map(item => 
                        item.product._id === productId && item.color === color
                            ? { ...item, quantity: parseInt(newQuantity) }
                            : item
                    )
                );
                toast.success('Cập nhật số lượng thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật. Vui lòng thử lại.');
        }
    };

    const handleRemoveItem = async (productId, color) => {
        try {
            await removeFromCart(productId, color);
            setCartItems(prevItems => prevItems.filter(item => 
                !(item.product._id === productId && item.color === color)
            ));
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
            return;
        }
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Giỏ hàng của bạn</h2>
            {cartItems.length === 0 ? (
                <div className="text-center p-5 bg-light rounded">
                    <h4>Giỏ hàng trống</h4>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => navigate('/products')}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Giá</th>
                                    <th>Tổng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={`${item.product._id}-${item.color}`}>
                                        <td className="align-middle">
                                            <div className="d-flex align-items-center">
                                                {item.product.image && (
                                                    <img 
                                                        src={item.product.image.url} 
                                                        alt={item.product.title} 
                                                        className="me-3"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <div>
                                                    <h6 className="mb-0">{item.product.title}</h6>
                                                    {item.color && <small className="text-muted">Màu: {item.color}</small>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <div className="input-group" style={{ width: '120px' }}>
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.color, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => handleUpdateQuantity(item.product._id, item.color, e.target.value)}
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.color, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="align-middle">{item.product.price.toLocaleString()}₫</td>
                                        <td className="align-middle">{(item.product.price * item.quantity).toLocaleString()}₫</td>
                                        <td className="align-middle">
                                            <button
                                                onClick={() => handleRemoveItem(item.product._id, item.color)}
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0">Tổng tiền:</h5>
                                    <small className="text-muted">Đã bao gồm VAT</small>
                                </div>
                                <h4 className="mb-0">
                                    {cartItems
                                        .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
                                        .toLocaleString()}₫
                                </h4>
                            </div>
                            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                                <button 
                                    className="btn btn-outline-primary me-md-2"
                                    onClick={() => navigate('/products')}
                                >
                                    Tiếp tục mua sắm
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleCheckout}
                                >
                                    Tiến hành thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
