import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getAllCategories, getAllBrands, getAllUsers, submitProductRating, addToCart as apiAddToCart } from '../api';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [review, setReview] = useState('');
    
    // Thêm state cho màu sắc và kích thước đã chọn
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // Danh sách màu sắc và kích thước có sẵn
    const [availableColors, setAvailableColors] = useState(['']);
    const [availableSizes, setAvailableSizes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productResponse = await getProductById(id);
                setProduct(productResponse.data);
                
                // Tạo danh sách màu sắc từ dữ liệu sản phẩm
                if (productResponse.data.color) {
                    // Nếu màu sắc được lưu dưới dạng chuỗi đơn, chuyển thành mảng
                    const colors = productResponse.data.color.includes(',') 
                        ? productResponse.data.color.split(',').map(c => c.trim()) 
                        : [productResponse.data.color];
                    setAvailableColors(colors);
                    setSelectedColor(colors[0]); // Chọn màu đầu tiên
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

                const categoriesResponse = await getAllCategories();
                const brandsResponse = await getAllBrands();
                const usersResponse = await getAllUsers();
                setCategories(categoriesResponse.data.data);
                setBrands(brandsResponse.data.data);
                setUsers(usersResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.title : 'Không rõ';
    };

    const getBrandName = (brandId) => {
        const brand = brands.find(brand => brand._id === brandId);
        return brand ? brand.title : 'Không rõ';
    };

    const getUserName = (userId) => {
        const user = users.find(user => user._id === userId);
        return user ? `${user.firstname} ${user.lastname}` : 'Ẩn danh';
    };

    const handleReviewSubmit = async () => {
        if (!rating || !review) {
            toast.error('Vui lòng chọn số sao và viết nhận xét.');
            return;
        }

        try {
            const response = await submitProductRating({
                prodId: id,
                star: rating,
                comment: review,
            });

            setProduct(response.data.product);
            setRating(0);
            setReview('');
            toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
        }
    };

    const handleAddToCart = async () => {
        if (!selectedColor || !selectedSize) {
            toast.warning('Vui lòng chọn màu sắc và kích thước!');
            return;
        }
        
        try {
            const response = await apiAddToCart(product._id, quantity, selectedColor, selectedSize);
            console.log('Thêm giỏ hàng thành công:', response);
            toast.success('Sản phẩm đã được thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(`Không thể thêm sản phẩm vào giỏ hàng: ${error.response?.data?.message || 'Vui lòng thử lại.'}`);
        }
    };
    
    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity > 0 && newQuantity <= product.quantity) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return <div>Loading product details...</div>;
    }

    if (!product) {
        return <div>Product not found.</div>;
    }

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{product.title}</h1>
            <div className="row">
                <div className="col-md-6">
                    <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/500'}
                        alt={product.title}
                        className="img-fluid"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                </div>
                <div className="col-md-6">
                    {product.coupon ? (
                        <div className="price-container mb-3">
                            <h3 className="text-muted text-decoration-line-through">
                                Giá gốc: {product.price.toLocaleString()} VNĐ
                            </h3>
                            <h3 className="text-danger">
                                Giá khuyến mãi: {(product.price - (product.price * product.coupon.discount / 100)).toLocaleString()} VNĐ
                                <span className="ms-2 badge bg-danger">Giảm {product.coupon.discount}%</span>
                            </h3>
                            <div className="small text-success">
                                Mã giảm giá: {product.coupon.name} - Còn hiệu lực đến {new Date(product.coupon.expiry).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <h3>Giá: {product.price.toLocaleString()} VNĐ</h3>
                    )}
                    <p><strong>Mô tả:</strong> {product.description}</p>
                    <p><strong>Danh mục:</strong> {getCategoryName(product.category)}</p>
                    <p><strong>Thương hiệu:</strong> {getBrandName(product.brand)}</p>
                    <p><strong>Số lượng còn:</strong> {product.quantity}</p>
                    
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
                                -
                            </button>
                            <span className="mx-3">{quantity}</span>
                            <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.quantity}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <p><strong>Tổng đánh giá:</strong> {
                        Array.from({ length: 5 }, (_, i) => (
                            <FaStar key={i} color={i < product.totalrating ? '#ffc107' : '#e4e5e9'} />
                        ))
                    }</p>
                    <button 
                        className="btn btn-success mt-3" 
                        onClick={handleAddToCart} 
                        disabled={product.quantity <= 0}
                    >
                        {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                    </button>
                </div>
            </div>

            <div className="reviews mt-5">
                <h2>Đánh giá sản phẩm</h2>
                {product.ratings?.length > 0 ? (
                    product.ratings.map((review, index) => (
                        <div key={index} className="review-item border p-3 mb-3">
                            <h5>{getUserName(review.postedBy)}</h5>
                            <p>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <FaStar key={i} color={i < review.star ? '#ffc107' : '#e4e5e9'} />
                                ))}
                            </p>
                            <p>{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                )}

                <div className="add-review mt-4">
                    <h4>Viết đánh giá của bạn</h4>
                    <div className="form-group">
                        <label>Chọn số sao:</label>
                        <div className="mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={30}
                                    color={star <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(null)}
                                    style={{ cursor: 'pointer', transition: 'color 200ms' }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Viết nhận xét:</label>
                        <textarea
                            className="form-control mb-3"
                            rows="3"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Nhận xét của bạn..."
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleReviewSubmit}>
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;