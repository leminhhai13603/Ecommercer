import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeFromCart, getAllProducts } from '../api';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaShoppingCart } from 'react-icons/fa';

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
                const categoryIds = [...new Set(cartItems.map(item => item.product.category))];
                
                // Lấy tất cả sản phẩm
                const response = await getAllProducts();
                if (!response.data || !response.data.data) return;
                
                const allProducts = response.data.data;
                
                // Lọc ra các sản phẩm cùng danh mục nhưng không có trong giỏ hàng
                const cartProductIds = cartItems.map(item => item.product._id);
                
                const filteredProducts = allProducts.filter(product => 
                    categoryIds.includes(product.category) && !cartProductIds.includes(product._id)
                );
                
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
                                                <img 
                                                    src={item.product.image.url || '/placeholder.jpg'} 
                                                    alt={item.product.title} 
                                                    className="me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
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
                                    onClick={() => navigate('/')}
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

            {/* Phần Có thể bạn sẽ thích */}
            <div className="mt-5">
                <h3 className="mb-4">Có thể bạn sẽ thích</h3>
                
                <div className="position-relative">
                    {recommendedProducts.length > 4 && (
                        <button 
                            className="btn btn-light position-absolute top-50 start-0 translate-middle-y rounded-circle" 
                            style={{ zIndex: 1 }}
                            onClick={prevSlide}
                        >
                            <FaArrowLeft />
                        </button>
                    )}
                    
                    <div className="row row-cols-1 row-cols-md-5 g-4">
                        {recommendedProducts.map((product, index) => (
                            <div 
                                key={product._id} 
                                className="col" 
                                style={{ 
                                    display: index >= currentSlide * 4 && index < (currentSlide + 1) * 4 ? 'block' : 'none'
                                }}
                            >
                                <div className="card h-100 position-relative">
                                    <Link to={`/product/${product._id}`}>
                                        <img
                                            src={product.images?.[0]?.url || '/placeholder.jpg'}
                                            className="card-img-top"
                                            alt={product.title}
                                            style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                                        />
                                    </Link>
                                    <div className="card-body">
                                        <h6 className="card-title text-truncate">{product.title}</h6>
                                        <p className="card-text fw-bold">{product.price?.toLocaleString()} VNĐ</p>
                                        
                                        <div className="d-flex justify-content-between mt-2 small text-muted">
                                            <span>+{getColorCount(product)} Màu sắc</span>
                                            <span>+{getSizeCount(product)} Kích thước</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn btn-sm btn-primary position-absolute bottom-0 start-50 translate-middle-x mb-2" 
                                        style={{ width: '80%' }}
                                        onClick={() => navigate(`/product/${product._id}`)}
                                    >
                                        <FaShoppingCart className="me-1" /> Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {recommendedProducts.length > 4 && (
                        <button 
                            className="btn btn-light position-absolute top-50 end-0 translate-middle-y rounded-circle" 
                            style={{ zIndex: 1 }}
                            onClick={nextSlide}
                        >
                            <FaArrowRight />
                        </button>
                    )}
                </div>
                
                {recommendedProducts.length === 0 && (
                    <div className="text-center p-4 bg-light rounded">
                        <p>Không có sản phẩm gợi ý</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
