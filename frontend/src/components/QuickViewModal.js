import React, { useState, useEffect, useContext } from 'react';
import { getAllBrands, getAllCategories, addToCart, getProductById } from '../api';
import { toast } from 'react-toastify';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaEye } from 'react-icons/fa';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

const QuickViewModal = ({ show, onClose, product }) => {
    const [quantity, setQuantity] = useState(1);
    const [fullProductDetails, setFullProductDetails] = useState(null);
    const [brand, setBrand] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Thêm context để kiểm tra đăng nhập
    const { isAuthenticated } = useContext(AuthContext);
    
    // State cho màu sắc và kích thước đã chọn
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    
    // Danh sách màu sắc và kích thước có sẵn
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    
    useEffect(() => {
        if (show && product) {
            setLoading(true);
            setQuantity(1);
            setCurrentImageIndex(0);
            
            const fetchDetails = async () => {
                try {
                    // Lấy chi tiết đầy đủ của sản phẩm
                    const productResponse = await getProductById(product._id);
                    setFullProductDetails(productResponse.data);
                    
                    // Tạo danh sách màu sắc từ dữ liệu sản phẩm
                    if (productResponse.data.color) {
                        // Nếu màu sắc được lưu dưới dạng chuỗi đơn, chuyển thành mảng
                        const colors = productResponse.data.color.includes(',') 
                            ? productResponse.data.color.split(',').map(c => c.trim()) 
                            : [productResponse.data.color];
                        setAvailableColors(colors);
                        setSelectedColor(colors[0]); // Chọn màu đầu tiên
                    } else {
                        setAvailableColors(['Mặc định']);
                        setSelectedColor('Mặc định');
                    }
                    
                    // Tạo danh sách kích thước từ dữ liệu sản phẩm
                    let productSizes = [];
                    if (Array.isArray(productResponse.data.size)) {
                        productSizes = productResponse.data.size;
                    } else if (productResponse.data.size) {
                        productSizes = [productResponse.data.size];
                    } else {
                        productSizes = ['Free Size'];
                    }
                    
                    setAvailableSizes(productSizes);
                    setSelectedSize(productSizes[0]); // Chọn size đầu tiên
                    
                    // Kiểm tra nếu product.brand là object hoặc string
                    if (product.brand) {
                        if (typeof product.brand === 'object' && product.brand.title) {
                            // Nếu brand là object có title, sử dụng trực tiếp
                            setBrand(product.brand);
                        } else {
                            // Nếu brand là ID, lấy thông tin từ API
                            const brandsRes = await getAllBrands();
                            const brandData = brandsRes.data.data;
                            const foundBrand = brandData.find(b => b._id === product.brand);
                            setBrand(foundBrand);
                        }
                    }
                    
                    // Kiểm tra nếu product.category là object hoặc string
                    if (product.category) {
                        if (typeof product.category === 'object' && product.category.title) {
                            // Nếu category là object có title, sử dụng trực tiếp
                            setCategory(product.category);
                        } else {
                            // Nếu category là ID, lấy thông tin từ API
                            const categoriesRes = await getAllCategories();
                            const categoryData = categoriesRes.data.data;
                            const foundCategory = categoryData.find(c => c._id === product.category);
                            setCategory(foundCategory);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchDetails();
        }
    }, [show, product]);

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity > 0 && newQuantity <= (fullProductDetails?.quantity || product.quantity)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        // Kiểm tra đăng nhập trước
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
                position: "top-center",
                autoClose: 5000,
            });
            
            // Lưu URL hiện tại để chuyển hướng lại sau khi đăng nhập
            if (product && product._id) {
                localStorage.setItem('redirectAfterLogin', `/product/${product._id}`);
            }
            
            onClose(); // Đóng modal
            return;
        }
        
        if (!selectedColor || !selectedSize) {
            toast.warning('Vui lòng chọn màu sắc và kích thước!');
            return;
        }
        
        if ((fullProductDetails?.quantity || product.quantity) <= 0) {
            toast.error('Sản phẩm đã hết hàng!');
            return;
        }

        try {
            await addToCart(product._id, quantity, selectedColor, selectedSize);
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
        }
    };

    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    if (!product) return null;

    return (
        <Modal 
            show={show} 
            onHide={onClose} 
            size="xl" 
            centered 
            backdrop="static"
            className="product-quick-view-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{product.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <Row>
                        <Col md={6}>
                            <div className="product-images">
                                <div className="main-image">
                                    <img 
                                        src={product.images?.[currentImageIndex]?.url || 'https://via.placeholder.com/500x500?text=No+Image'} 
                                        alt={product.title} 
                                        className="img-fluid"
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                </div>
                                {product.images && product.images.length > 1 && (
                                    <div className="thumbnail-images">
                                        {product.images.map((image, index) => (
                                            <div 
                                                key={index} 
                                                className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                                onClick={() => handleImageChange(index)}
                                            >
                                                <img src={image.url} alt={`Thumbnail ${index}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="product-details">
                                {fullProductDetails?.coupon ? (
                                    <div className="price-container mb-3">
                                        <h3 className="text-muted text-decoration-line-through">
                                            Giá gốc: {(fullProductDetails.price || 0).toLocaleString()} VNĐ
                                        </h3>
                                        <h3 className="text-danger">
                                            Giá khuyến mãi: {(fullProductDetails.price - (fullProductDetails.price * (fullProductDetails.couponInfo?.discount || 0) / 100) || 0).toLocaleString()} VNĐ
                                            <span className="ms-2 badge bg-danger">Giảm {fullProductDetails.couponInfo?.discount || 0}%</span>
                                        </h3>
                                        {fullProductDetails.couponInfo?.expiry && (
                                            <div className="small text-success">
                                                Mã giảm giá: {fullProductDetails.couponInfo?.name || ''} - Còn hiệu lực đến {new Date(fullProductDetails.couponInfo.expiry).toLocaleDateString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <h3>Giá: {(fullProductDetails?.price || product.price || 0).toLocaleString()} VNĐ</h3>
                                )}
                                <p><strong>Mô tả:</strong> {product.description}</p>
                                <p><strong>Danh mục:</strong> {
                                    category?.title || 
                                    (typeof product.category === 'object' && product.category?.title) || 
                                    'Không rõ'
                                }</p>
                                <p><strong>Thương hiệu:</strong> {
                                    brand?.title || 
                                    (typeof product.brand === 'object' && product.brand?.title) || 
                                    'Không rõ'
                                }</p>
                                <p><strong>Số lượng còn:</strong> {fullProductDetails?.quantity || product.quantity}</p>
                                
                                {/* Phần chọn màu sắc */}
                                {availableColors.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label"><strong>Màu sắc:</strong></label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {availableColors.map((color, index) => (
                                                <button 
                                                    key={index}
                                                    className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setSelectedColor(color)}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Phần chọn kích thước */}
                                {availableSizes.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label"><strong>Kích thước:</strong></label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {availableSizes.map((size, index) => (
                                                <button 
                                                    key={index}
                                                    className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setSelectedSize(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Phần chọn số lượng */}
                                <div className="mb-3">
                                    <label className="form-label"><strong>Số lượng:</strong></label>
                                    <div className="d-flex align-items-center">
                                        <button 
                                            className="btn btn-outline-secondary" 
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="mx-3">{quantity}</span>
                                        <button 
                                            className="btn btn-outline-secondary" 
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= (fullProductDetails?.quantity || product.quantity)}
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>

                                {/* Thêm thông báo cảnh báo khi không đăng nhập */}
                                {!isAuthenticated && (
                                    <div className="alert alert-warning" role="alert">
                                        <strong>Chú ý:</strong> Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Đóng
                </Button>
                <Button 
                    variant="success"
                    onClick={handleAddToCart}
                    disabled={(fullProductDetails?.quantity || product.quantity) <= 0 || loading}
                >
                    <FaShoppingCart className="me-2" />
                    {(fullProductDetails?.quantity || product.quantity) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default QuickViewModal; 