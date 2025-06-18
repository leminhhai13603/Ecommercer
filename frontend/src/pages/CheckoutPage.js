import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createCheckoutOrder, getCart } from '../api';
import { FaMapMarkerAlt, FaCity, FaMailBulk, FaGlobe, FaCreditCard, FaMoneyBillWave, FaTruck, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
                } else if (response.data && Array.isArray(response.data)) {
                    setCartItems(response.data);
                } else {
                    setCartItems([]);
                    toast.warning('Giỏ hàng của bạn đang trống');
                }
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
                toast.error('Không thể tải giỏ hàng');
                setCartItems([]);
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

        if (cartItems.length === 0) {
            toast.error('Giỏ hàng của bạn đang trống');
            return;
        }

        setSubmitting(true);
        try {
            const productsToOrder = cartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                color: item.color,
                size: item.size || ''
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
            toast.error(error.response?.data?.message || 'Đặt hàng thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.product.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    const getPaymentMethodIcon = () => {
        switch (paymentMethod) {
            case 'COD':
                return <FaMoneyBillWave className="text-success" />;
            case 'MOMO':
                return <img src="https://cdn-icons-png.flaticon.com/512/5977/5977576.png" alt="MoMo" width="20" height="20" />;
            case 'VNPAY':
                return <FaCreditCard className="text-primary" />;
            default:
                return <FaCreditCard />;
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="checkout-page py-5">
            <div className="container">
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Thanh toán</h2>
                    <p className="text-muted">Hoàn tất thông tin để đặt hàng</p>
                </div>
                
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-body p-4">
                                <h4 className="mb-4">Thông tin giao hàng</h4>

                                <div className="mb-4">
                                    <label className="form-label">Địa chỉ nhận hàng</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <FaMapMarkerAlt />
                                        </span>
                                        <input 
                                            type="text" 
                                            name="address" 
                                            className="form-control" 
                                            placeholder="Nhập địa chỉ chi tiết" 
                                            value={shippingInfo.address}
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">Thành phố</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <FaCity />
                                        </span>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            className="form-control" 
                                            placeholder="Thành phố" 
                                            value={shippingInfo.city}
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">Mã bưu điện</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <FaMailBulk />
                                        </span>
                                        <input 
                                            type="text" 
                                            name="postalCode" 
                                            className="form-control" 
                                            placeholder="Mã bưu điện" 
                                            value={shippingInfo.postalCode}
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">Quốc gia</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <FaGlobe />
                                        </span>
                                        <input 
                                            type="text" 
                                            name="country" 
                                            className="form-control" 
                                            placeholder="Quốc gia" 
                                            value={shippingInfo.country}
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <h4 className="mb-3 mt-5">Phương thức thanh toán</h4>
                                
                                <div className="payment-methods">
                                    <div className="form-check mb-3 border rounded-3 p-3">
                                        <input 
                                            className="form-check-input" 
                                            type="radio" 
                                            name="paymentMethod" 
                                            id="cod" 
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label w-100 d-flex justify-content-between align-items-center" htmlFor="cod">
                                            <div>
                                                <span className="fw-medium">Thanh toán khi nhận hàng (COD)</span>
                                                <p className="text-muted small mb-0">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                            <FaMoneyBillWave size={24} className="text-success" />
                                        </label>
                                    </div>
                                    
                                    <div className="form-check mb-3 border rounded-3 p-3">
                                        <input 
                                            className="form-check-input" 
                                            type="radio" 
                                            name="paymentMethod" 
                                            id="momo" 
                                            value="MOMO"
                                            checked={paymentMethod === 'MOMO'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label w-100 d-flex justify-content-between align-items-center" htmlFor="momo">
                                            <div>
                                                <span className="fw-medium">Thanh toán qua MoMo</span>
                                                <p className="text-muted small mb-0">Thanh toán trực tuyến qua ví MoMo</p>
                                            </div>
                                            <img src="https://cdn-icons-png.flaticon.com/512/5977/5977576.png" alt="MoMo" width="24" height="24" />
                                        </label>
                                    </div>
                                    
                                    <div className="form-check mb-3 border rounded-3 p-3">
                                        <input 
                                            className="form-check-input" 
                                            type="radio" 
                                            name="paymentMethod" 
                                            id="vnpay" 
                                            value="VNPAY"
                                            checked={paymentMethod === 'VNPAY'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label w-100 d-flex justify-content-between align-items-center" htmlFor="vnpay">
                                            <div>
                                                <span className="fw-medium">Thanh toán qua VNPay</span>
                                                <p className="text-muted small mb-0">Thanh toán qua cổng VNPay</p>
                                            </div>
                                            <FaCreditCard size={24} className="text-primary" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <Link to="/cart" className="btn btn-outline-secondary me-3">
                                <FaTruck className="me-2" /> Quay lại giỏ hàng
                            </Link>
                        </div>
                    </div>
                    
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white border-0 py-3">
                                <h4 className="mb-0">Đơn hàng của bạn</h4>
                            </div>
                            <div className="card-body p-4">
                                {cartItems.length > 0 ? (
                                    <>
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="d-flex mb-3 product-summary">
                                                <div className="me-3">
                                                    <img 
                                                        src={item.product.images?.[0]?.url || item.product.image?.url || 'https://via.placeholder.com/100'} 
                                                        alt={item.product.title} 
                                                        className="rounded" 
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                    />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{item.product.title}</h6>
                                                    <div className="d-flex flex-wrap">
                                                        <span className="me-3 small">
                                                            <span className="text-muted">Số lượng:</span> {item.quantity}
                                                        </span>
                                                        {item.color && (
                                                            <span className="me-3 small">
                                                                <span className="text-muted">Màu:</span> {item.color}
                                                            </span>
                                                        )}
                                                        {item.size && (
                                                            <span className="me-3 small">
                                                                <span className="text-muted">Size:</span> {item.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="fw-medium">{(item.product.price * item.quantity).toLocaleString()}₫</span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <hr className="my-4" />
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tổng sản phẩm</span>
                                            <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tạm tính</span>
                                            <span>{calculateTotal().toLocaleString()}₫</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Phí vận chuyển</span>
                                            <span className="text-success">Miễn phí</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between mt-4 pt-2 border-top">
                                            <h5>Tổng cộng</h5>
                                            <h5 className="text-primary">{calculateTotal().toLocaleString()}₫</h5>
                                        </div>
                                        
                                        <div className="payment-selection d-flex align-items-center mt-4 mb-3">
                                            <div className="payment-icon me-3">
                                                {getPaymentMethodIcon()}
                                            </div>
                                            <div>
                                                <span className="d-block">Phương thức thanh toán</span>
                                                <strong>{
                                                    paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                                                    paymentMethod === 'MOMO' ? 'Thanh toán qua MoMo' :
                                                    'Thanh toán qua VNPay'
                                                }</strong>
                                            </div>
                                        </div>
                                        
                                        <div className="d-grid mt-4">
                                            <button 
                                                className="btn btn-primary py-3 fw-medium"
                                                onClick={handleSubmitOrder}
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <FaSpinner className="me-2 fa-spin" /> Đang xử lý...
                                                    </>
                                                ) : (
                                                    'Xác nhận đặt hàng'
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p>Giỏ hàng của bạn đang trống.</p>
                                        <Link to="/" className="btn btn-primary">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .checkout-page {
                    min-height: 80vh;
                }
                
                .form-control:focus,
                .form-check-input:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }
                
                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                
                .payment-methods .form-check-input {
                    margin-top: 0.75rem;
                }
                
                .product-summary:not(:last-child) {
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f0f0f0;
                    margin-bottom: 16px;
                }
                
                .fa-spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;