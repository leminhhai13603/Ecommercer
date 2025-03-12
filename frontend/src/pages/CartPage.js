import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../api';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                        ? { ...item, quantity: parseInt(newQuantity) }
                        : item
                )
            );
            toast.success('Cập nhật số lượng thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            toast.error('Không thể cập nhật. Vui lòng thử lại.');
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
            toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return <div className="container mt-5 text-center">Đang tải giỏ hàng...</div>;
    }

    return (
        <div className="cart-container">
            <h2>Giỏ hàng của bạn</h2>
            {cartItems.length === 0 ? (
                <p>Giỏ hàng trống</p>
            ) : (
                <>
                    <table className="table table-striped">
                        <thead>
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
                                <tr key={item.product._id}>
                                    <td>
                                        <img src={item.product.image.url} alt={item.product.title} width="50" />
                                        <span>{item.product.title}</span>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            min="1"
                                            onChange={(e) =>
                                                handleUpdateQuantity(item.product._id, item.color, e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>{item.product.price.toLocaleString()}₫</td>
                                    <td>{(item.product.price * item.quantity).toLocaleString()}₫</td>
                                    <td>
                                        <button
                                            onClick={() => handleRemoveItem(item.product._id, item.color)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-total">
                        <h4>
                            Tổng tiền:{' '}
                            {cartItems
                                .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
                                .toLocaleString()}
                            ₫
                        </h4>
                        <button className="btn btn-success" onClick={handleCheckout}>
                            Tiến hành thanh toán
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
