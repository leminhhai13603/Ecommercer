import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                const response = await getCart();
                if (response.data && response.data.items) {
                    setCartItems(response.data.items);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                toast.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };
    
        fetchCart();
    }, []);
    
    const handleUpdateQuantity = async (productId, color, newQuantity) => {
        try {
            await updateCartItem(productId, color, newQuantity);
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.product._id === productId && item.color === color
                        ? { ...item, quantity: parseInt(newQuantity), subtotalAfterDiscount: item.price * parseInt(newQuantity) }
                        : item
                )
            );
            toast.success('Cập nhật số lượng thành công');
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            toast.error('Không thể cập nhật số lượng. Vui lòng thử lại.');
        }
    };
    
    const handleRemoveItem = async (productId, color) => {
        try {
            await removeFromCart(productId, color);
            setCartItems(prevItems => prevItems.filter(item => 
                !(item.product._id === productId && item.color === color)
            ));
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <div className="container mt-5 text-center">Đang tải giỏ hàng...</div>;
    }

    return (
        <div className="container mt-5">
            <ToastContainer />
            <h1 className="mb-4">Giỏ hàng của bạn</h1>
            {cartItems.length === 0 ? (
                <p>Giỏ hàng trống</p>
            ) : (
                <>
                    {cartItems.map((item) => (
                        item.product && (
                            <div key={`${item.product._id}-${item.color}`} className="card mb-3">
                                <div className="row g-0">
                                    <div className="col-md-2">
                                        <img src={item.product.image[0]?.url || 'https://via.placeholder.com/150'} 
                                             alt={item.product.title} 
                                             className="img-fluid rounded-start" 
                                             style={{maxHeight: '100px', objectFit: 'cover'}} />
                                    </div>
                                    <div className="col-md-10">
                                        <div className="card-body">
                                            <h5 className="card-title">{item.product.title}</h5>
                                            <p className="card-text">Màu: {item.color}</p>
                                            <p className="card-text">Giá: {item.price.toLocaleString()} VNĐ</p>
                                            <div className="d-flex align-items-center">
                                                <input 
                                                    type="number" 
                                                    className="form-control me-2"
                                                    style={{width: '70px'}}
                                                    value={item.quantity} 
                                                    onChange={(e) => handleUpdateQuantity(item.product._id, item.color, e.target.value)}
                                                    min="1"
                                                />
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.product._id, item.color)}>Xóa</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                    <div className="card-total mt-4">
                        <h3>Tổng cộng: {cartItems.reduce((total, item) => total + item.subtotalAfterDiscount, 0).toLocaleString()} VNĐ</h3>
                                </div>
                    <button className="btn btn-primary mt-3">Tiến hành thanh toán</button>
                </>
            )}
        </div>
    );
};

export default CartPage;
