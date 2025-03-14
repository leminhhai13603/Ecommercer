import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createCheckoutOrder, getCart } from '../api';  // Thêm import getCart

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await getCart();
                if (response.data && response.data.items) {
                    setCartItems(response.data.items);
                }
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                toast.error('Không thể tải giỏ hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async () => {
        if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country) {
            toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        try {
            const productsToOrder = cartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                color: item.color
            }));

            const orderData = {
                products: productsToOrder,
                shippingInfo,
                paymentInfo: {
                    id: paymentMethod,
                    status: 'Đang xử lý'
                }
            };

            const response = await createCheckoutOrder(orderData);

            if (response.status === 201) {
                toast.success('Đặt hàng thành công!');
                window.location.href = '/order-history';
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            toast.error('Đặt hàng thất bại!');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.product.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    return (
        <div className="checkout-container d-flex justify-content-between" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="checkout-form-container w-60 p-4">
                <h2>Thông tin giao hàng</h2>
                <form className="checkout-form">
                    <input type="text" name="address" placeholder="Địa chỉ nhận hàng" onChange={handleChange} required />
                    <input type="text" name="city" placeholder="Thành phố" onChange={handleChange} required />
                    <input type="text" name="postalCode" placeholder="Mã bưu điện" onChange={handleChange} required />
                    <input type="text" name="country" placeholder="Quốc gia" onChange={handleChange} required />

                    <h3>Phương thức thanh toán</h3>
                    <select onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                        <option value="MOMO">Thanh toán qua Momo</option>
                        <option value="VNPAY">Thanh toán qua VNPay</option>
                    </select>

                    <button type="button" className="confirm-payment-btn mt-3" onClick={handleSubmitOrder}>
                        Xác nhận đặt hàng
                    </button>
                </form>
            </div>

            <div className="order-summary w-40 p-4 border rounded bg-light">
                <h3>Chi tiết đơn hàng</h3>
                {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <strong>{item.product.title}</strong>
                                <p className="mb-0">Số lượng: {item.quantity}</p>
                            </div>
                            <div>
                                <span>{(item.product.price * item.quantity).toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Giỏ hàng của bạn đang trống.</p>
                )}

                <hr />
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Tổng cộng:</h4>
                    <h4>{calculateTotal().toLocaleString()} VNĐ</h4>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;