import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart, getAllProducts } from '../api';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaShoppingCart, FaTrashAlt, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
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
                if (response && response.data) {
                    if (!response.data) {
                        setCartItems([]);
                        return;
                    }

                    if (Array.isArray(response.data) && response.data.length === 0) {
                        setCartItems([]);
                        return;

                    }

                    if (response.data.items) {
                        setCartItems(response.data.items);
                        return;
                    }

                    if (Array.isArray(response.data)) {
                        setCartItems(response.data);
                        return;
                    }

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

    // Lấy sản phẩm gợi ý dựa trên danh mục của các sản phẩm trong giỏ hàng
    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            if (cartItems.length === 0) return;

            try {
                // Lấy các danh mục từ sản phẩm trong giỏ hàng
                const categoryIds = [...new Set(cartItems.map(item => {
                    // Kiểm tra nếu category là object hoặc string
                    if (item.product.category && typeof item.product.category === 'object') {
                        return item.product.category._id;
                    } 
                    return item.product.category;
                }).filter(Boolean))];
                
                // Nếu không có danh mục nào, thoát
                if (categoryIds.length === 0) return;
                
                // Lấy tất cả sản phẩm
                const response = await getAllProducts();
                if (!response || !response.data || !Array.isArray(response.data)) {
                    console.error('Dữ liệu sản phẩm không hợp lệ:', response);
                    return;
                }
                
                const allProducts = Array.isArray(response.data.data) ? response.data.data : response.data;
                
                // Kiểm tra nếu không có sản phẩm
                if (!allProducts || allProducts.length === 0) return;
                
                // Lọc ra các sản phẩm cùng danh mục nhưng không có trong giỏ hàng
                const cartProductIds = cartItems.map(item => item.product._id);
                
                const filteredProducts = allProducts.filter(product => {
                    // Kiểm tra product hợp lệ
                    if (!product) return false;
                    
                    // Kiểm tra product._id có tồn tại và không nằm trong giỏ hàng
                    if (!product._id || cartProductIds.includes(product._id)) return false;
                    
                    // Kiểm tra category có phải là object hay string
                    const productCategoryId = product.category && typeof product.category === 'object' 
                        ? product.category._id 
                        : product.category;
                    
                    // Trả về true nếu sản phẩm thuộc một trong các danh mục đã chọn
                    return productCategoryId && categoryIds.includes(productCategoryId);
                });
                
                // Nếu không có sản phẩm nào phù hợp, thoát
                if (filteredProducts.length === 0) return;
                
                // Lấy ngẫu nhiên 5 sản phẩm từ danh sách đã lọc
                const shuffled = filteredProducts.sort(() => 0.5 - Math.random());
                setRecommendedProducts(shuffled.slice(0, 5));
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm gợi ý:', error);
            }
        };

        fetchRecommendedProducts();
    }, [cartItems]);

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

    // Logic điều khiển slider
    const nextSlide = () => {
        setCurrentSlide(current => 
            current === Math.ceil(recommendedProducts.length / 4) - 1 ? 0 : current + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide(current => 
            current === 0 ? Math.ceil(recommendedProducts.length / 4) - 1 : current - 1
        );
    };

    // Hàm để lấy số lượng màu sắc của sản phẩm
    const getColorCount = (product) => {
        if (product.color && typeof product.color === 'string') {
            const colorArray = product.color.split(',').map(color => color.trim()).filter(Boolean);
            return colorArray.length || 1;
        }
        return 1;
    };

    // Hàm để lấy số lượng kích thước của sản phẩm
    const getSizeCount = (product) => {
        if (product.size && Array.isArray(product.size)) {
            return product.size.length;
        }
        return 1;
    };

    // Tính tổng tiền giỏ hàng
    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="cart-page py-5 my-5">
                <div className="container">
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải thông tin giỏ hàng của bạn...</p>
                    </div>
                </div>
                
                {/* CSS inline để đảm bảo đủ khoảng cách với footer */}
                <style jsx>{`
                    .cart-page {
                        min-height: 60vh;
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page py-5 my-5">
                <div className="container">
                    <div className="alert alert-danger p-4 shadow-sm rounded-3" role="alert">
                        <h4 className="alert-heading">Đã xảy ra lỗi!</h4>
                        <p>{error}</p>
                        <hr />
                        <p className="mb-0">Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.</p>
                    </div>
                </div>
                
                {/* CSS inline để đảm bảo đủ khoảng cách với footer */}
                <style jsx>{`
                    .cart-page {
                        min-height: 60vh;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="cart-page py-5 my-5">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Giỏ hàng của bạn</h2>
                    <p className="text-muted">Xem lại và điều chỉnh sản phẩm trước khi thanh toán</p>
                </div>
                {cartItems.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-3 shadow-sm">
                        <div className="mb-4">
                            <FaShoppingBag size={60} className="text-muted" />
                        </div>
                        <h4 className="mb-3">Giỏ hàng của bạn đang trống</h4>
                        <p className="text-muted mb-4">Hãy thêm một vài sản phẩm tuyệt vời vào giỏ hàng và quay lại để thanh toán</p>
                        <Link to="/" className="btn btn-primary px-4 py-2">
                            <FaArrowLeft className="me-2" /> Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm rounded-3 mb-4">
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="py-3 px-4 border-0">Sản phẩm</th>
                                                        <th className="py-3 border-0">Số lượng</th>
                                                        <th className="py-3 border-0">Giá</th>
                                                        <th className="py-3 border-0">Tổng</th>
                                                        <th className="py-3 border-0"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cartItems.map((item) => (
                                                        <tr key={`${item.product._id}-${item.color}`} className="product-row">
                                                            <td className="py-3 px-4">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="product-image me-3">
                                                                        <img 
                                                                            src={item.product.images?.[0]?.url || item.product.image?.url || 'https://via.placeholder.com/100'} 
                                                                            alt={item.product.title} 
                                                                            className="rounded-3"
                                                                            style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="mb-1">
                                                                            <Link to={`/product/${item.product._id}`} className="text-decoration-none text-dark product-title">
                                                                                {item.product.title}
                                                                            </Link>
                                                                        </h6>
                                                                        <div className="product-meta">
                                                                            {item.color && <span className="badge bg-light text-dark me-2">Màu: {item.color}</span>}
                                                                            {item.size && <span className="badge bg-light text-dark">Size: {item.size}</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="input-group quantity-control" style={{ flexWrap: 'nowrap', width: 'fit-content' }}>
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        type="button"
                                                                        onClick={() => handleUpdateQuantity(item.product._id, item.color, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                        style={{ padding: '0.25rem 0.4rem' }}
                                                                    >
                                                                        <FaMinus size={10} />
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm text-center quantity-input"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleUpdateQuantity(item.product._id, item.color, e.target.value)}
                                                                        style={{ width: '40px', minWidth: '40px', padding: '0.25rem' }}
                                                                    />
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        type="button"
                                                                        onClick={() => handleUpdateQuantity(item.product._id, item.color, item.quantity + 1)}
                                                                        style={{ padding: '0.25rem 0.4rem' }}
                                                                    >
                                                                        <FaPlus size={10} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="fw-medium">{item.product.price?.toLocaleString()}₫</td>
                                                            <td className="text-success fw-bold">{(item.product.price * item.quantity).toLocaleString()}₫</td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.product._id, item.color)}
                                                                    className="btn btn-sm btn-outline-danger remove-button"
                                                                    title="Xóa khỏi giỏ hàng"
                                                                >
                                                                    <FaTrashAlt />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="d-flex justify-content-between">
                                    <Link to="/" className="btn btn-outline-primary px-4">
                                        <FaArrowLeft className="me-2" /> Tiếp tục mua sắm
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm rounded-3">
                                    <div className="card-header bg-white border-0 pt-4">
                                        <h5 className="mb-0">Tóm tắt đơn hàng</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Tổng sản phẩm ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                                            <span>{calculateTotal().toLocaleString()}₫</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Phí vận chuyển</span>
                                            <span className="text-success">Miễn phí</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between mb-4">
                                            <strong>Tổng cộng</strong>
                                            <h5 className="text-success fw-bold">{calculateTotal().toLocaleString()}₫</h5>
                                        </div>
                                        <div className="d-grid">
                                            <button 
                                                className="btn btn-primary py-2"
                                                onClick={handleCheckout}
                                            >
                                                Tiến hành thanh toán
                                            </button>
                                        </div>
                                        {/* <div className="mt-4">
                                            <p className="small text-muted mb-0 text-center">Chúng tôi chấp nhận:</p>
                                            <div className="text-center mt-2">
                                                <img src="https://via.placeholder.com/40x25" alt="Visa" className="payment-icon mx-1" />
                                                <img src="https://via.placeholder.com/40x25" alt="Mastercard" className="payment-icon mx-1" />
                                                <img src="https://via.placeholder.com/40x25" alt="MOMO" className="payment-icon mx-1" />
                                                <img src="https://via.placeholder.com/40x25" alt="Zalopay" className="payment-icon mx-1" />
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Phần Có thể bạn sẽ thích */}
                {recommendedProducts.length > 0 && (
                    <div className="mt-5 pt-4">
                        <h3 className="fw-bold mb-4">Có thể bạn sẽ thích</h3>
                        
                        <div className="position-relative recommended-products">
                            {recommendedProducts.length > 4 && (
                                <button 
                                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y rounded-circle shadow-sm nav-button prev-button" 
                                    style={{ zIndex: 1, marginLeft: '-10px' }}
                                    onClick={prevSlide}
                                >
                                    <FaArrowLeft />
                                </button>
                            )}
                            
                            <div className="row g-4">
                                {recommendedProducts.map((product, index) => (
                                    <div 
                                        key={product._id} 
                                        className="col-6 col-md-3" 
                                        style={{ 
                                            display: index >= currentSlide * 4 && index < (currentSlide + 1) * 4 ? 'block' : 'none' 
                                        }}
                                    >
                                        <div className="card h-100 border-0 shadow-sm product-card">
                                            <Link to={`/product/${product._id}`} className="text-decoration-none">
                                                <div className="product-image-container position-relative overflow-hidden">
                                                    <img
                                                        src={product.images && product.images.length > 0 
                                                            ? product.images[0].url 
                                                            : product.image?.url || 'https://via.placeholder.com/300'}
                                                        className="card-img-top product-image"
                                                        alt={product.title}
                                                        style={{ height: '200px', objectFit: 'contain' }}
                                                    />
                                                    <div className="product-overlay">
                                                        <div className="view-product">Xem chi tiết</div>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="card-body">
                                                <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                                                    <h6 className="card-title mb-2 text-truncate product-title">{product.title}</h6>
                                                </Link>
                                                <p className="card-text text-danger fw-bold mb-2">{product.price?.toLocaleString() || 0} VNĐ</p>
                                                
                                                <div className="d-flex justify-content-between mt-2 small text-muted">
                                                    <span>{getColorCount(product)} Màu sắc</span>
                                                    <span>{getSizeCount(product)} Kích thước</span>
                                                </div>
                                                
                                                <div className="d-grid mt-3">
                                                    <Link 
                                                        to={`/product/${product._id}`} 
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        <FaShoppingCart className="me-1" /> Thêm vào giỏ
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {recommendedProducts.length > 4 && (
                                <button 
                                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y rounded-circle shadow-sm nav-button next-button" 
                                    style={{ zIndex: 1, marginRight: '-10px' }}
                                    onClick={nextSlide}
                                >
                                    <FaArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* CSS inline để styling */}
            <style jsx>{`
                .cart-page {
                    min-height: 80vh;
                }
                
                .product-title:hover {
                    color: #0d6efd !important;
                }
                
                .quantity-input {
                    min-width: 40px;
                    max-width: 40px;
                }
                
                .product-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                
                .product-image-container {
                    border-radius: 4px 4px 0 0;
                    position: relative;
                }
                
                .product-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .product-card:hover .product-overlay {
                    opacity: 1;
                }
                
                .view-product {
                    background: white;
                    color: #212529;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                
                .nav-button {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .payment-icon {
                    opacity: 0.7;
                }
                
                .product-row:hover {
                    background-color: #f8f9fa;
                }
                
                .remove-button {
                    visibility: hidden;
                    opacity: 0;
                    transition: visibility 0s, opacity 0.2s;
                }
                
                .product-row:hover .remove-button {
                    visibility: visible;
                    opacity: 1;
                }
                
                .quantity-control {
                    flex-wrap: nowrap !important;
                    width: fit-content;
                }
                
                .quantity-control .btn {
                    padding: 0.25rem 0.4rem;
                    height: auto;
                }
            `}</style>
        </div>
    );
};

export default CartPage;
