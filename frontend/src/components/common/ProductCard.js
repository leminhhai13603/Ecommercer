import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaShoppingCart, FaPalette, FaRulerHorizontal, FaStar } from 'react-icons/fa';

const ProductCard = ({ product, onQuickView }) => {
    const calculateDiscountedPrice = (product) => {
        if (product.coupon) {
            const discount = product.coupon?.discount || 0;
            const price = product.price || 0;
            return price - (price * (discount / 100));
        }
        return product.price || 0;
    };

    const getColorCount = (product) => {
        // Trường hợp 1: Sản phẩm có mảng colors
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
            return product.colors.length;
        }
        
        // Trường hợp 2: Sản phẩm có chuỗi color ngăn cách bởi dấu phẩy
        if (product.color && typeof product.color === 'string') {
            const colorArray = product.color.split(',').map(color => color.trim()).filter(Boolean);
            return colorArray.length || 1;
        }
        
        // Trường hợp 3: Kiểm tra variants
        if (product.variants && Array.isArray(product.variants)) {
            const uniqueColors = new Set();
            product.variants.forEach(variant => {
                if (variant.color) {
                    uniqueColors.add(variant.color);
                }
            });
            if (uniqueColors.size > 0) {
                return uniqueColors.size;
            }
        }
        
        // Mặc định trả về 1 nếu không tìm thấy thông tin
        return 1;
    };

    const getSizeCount = (product) => {
        if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            return product.sizes.length;
        }
        
        if (product.size && Array.isArray(product.size) && product.size.length > 0) {
            return product.size.length;
        }

        if (product.variants && Array.isArray(product.variants)) {
            const uniqueSizes = new Set();
            product.variants.forEach(variant => {
                if (variant.size) {
                    uniqueSizes.add(variant.size);
                }
            });
            if (uniqueSizes.size > 0) {
                return uniqueSizes.size;
            }
        }

        if (product.size && typeof product.size === 'string') {
            const sizeArray = product.size.split(',').map(size => size.trim()).filter(Boolean);
            return sizeArray.length || 1;
        }
        return 1;
    };

    // Sửa logic kiểm tra giảm giá - sử dụng trực tiếp coupon thay vì couponInfo
    const hasDiscount = product?.coupon && product.coupon?.discount > 0;

    return (
        <div className="card h-100 position-relative product-card">
            {/* Thẻ giảm giá - thiết kế nhỏ gọn hơn */}
            {hasDiscount && (
                <div className="discount-labels">
                    -{product.coupon?.discount}%
                </div>
            )}

            {/* Các badges */}
            <div className="product-badges">
                <div className="badge-group">
                    <span className="badge view-badge">
                        <FaEye className="me-1" />
                        {product.viewCount || 0}
                    </span>
                </div>
                <div className="badge-group">
                    <span className="badge sold-badge">
                        Đã bán: {product.sold || 0}
                    </span>
                </div>
                {(product.averageRating > 0 || product.totalrating > 0) && (
                    <div className="badge-group">
                        <span className="badge rating-badge">
                            <FaStar className="me-1" />
                            {product.averageRating?.toFixed(1) || product.totalrating || 0}
                        </span>
                    </div>
                )}
            </div>

            {/* Ảnh sản phẩm */}
            <div className="image-container">
                <Link to={`/product/${product._id}`} className="product-link">
                    <img
                        src={product.images?.[0]?.url || product.image?.url || 'https://via.placeholder.com/500x500?text=No+Image'}
                        className="card-img-top product-image"
                        alt={product.title || 'No title'}
                    />
                </Link>
            </div>

            {/* Nội dung thẻ */}
            <div className="card-body d-flex flex-column">
                <Link to={`/product/${product._id}`} className="text-decoration-none">
                    <h5 className="card-title product-title">{product.title || 'No title'}</h5>
                </Link>
                
                {/* Giá sản phẩm */}
                <div className="price-container">
                    {hasDiscount ? (
                        <>
                            <div className="old-price text-muted text-decoration-line-through">
                                {product.price?.toLocaleString()} VNĐ
                            </div>
                            <div className="new-price fw-bold text-danger">
                                {calculateDiscountedPrice(product).toLocaleString()} VNĐ
                            </div>
                        </>
                    ) : (
                        <div className="fw-bold">{product.price?.toLocaleString()} VNĐ</div>
                    )}
                </div>
                
                {/* Thông tin màu sắc và kích thước */}
                <div className="mt-2 d-flex justify-content-between product-options">
                    <span className="small text-muted">
                        <FaPalette className="me-1" /> 
                        +{getColorCount(product)} Màu sắc
                    </span>
                    <span className="small text-muted">
                        <FaRulerHorizontal className="me-1" />
                        +{getSizeCount(product)} Kích thước
                    </span>
                </div>

                {/* Nút thêm vào giỏ hàng (dùng vị trí tuyệt đối để phù hợp với App.css) */}
                <button 
                    className="add-to-cart-btn custom-add-btn" 
                    onClick={() => onQuickView(product)}
                    disabled={product.quantity <= 0}
                >
                    <FaShoppingCart className="me-2" />
                    {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>
            </div>

            <style jsx>{`
                .product-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid rgba(0,0,0,0.1);
                    overflow: hidden;
                    height: 100%;
                    max-width: 300px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                }

                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                .product-badges {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .badge-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }

                .discount-labels {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: #ff4444;
                    color: white;
                    padding: 3px 8px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    z-index: 2;
                    border-bottom-left-radius: 8px;
                }

                .image-container {
                    height: 200px;
                    overflow: hidden;
                }

                .product-image {
                    width: 100%;
                    height: 100%; !important
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .product-link:hover .product-image {
                    transform: scale(1.05);
                }

                .product-title {
                    color: #333;
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-height: 2.4em;
                }

                .custom-add-btn {
                    position: absolute;
                    left: 50%;
                    bottom: 20px;
                    transform: translateX(-50%);
                    width: 80%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    font-size: 0.85rem;
                    opacity: 0;
                    visibility: hidden;
                }

                .product-card:hover .custom-add-btn {
                    opacity: 1;
                    visibility: visible;
                }

                .badge {
                    padding: 0.35em 0.65em;
                    font-size: 0.75em;
                    border-radius: 4px;
                    display: inline-flex;
                    align-items: center;
                }

                .view-badge {
                    background-color: rgba(13, 110, 253, 0.8); 
                    color: white;
                    backdrop-filter: blur(4px);
                }

                .sold-badge {
                    background-color: rgba(25, 135, 84, 0.8);
                    color: white;
                    backdrop-filter: blur(4px);
                }

                .rating-badge {
                    background-color: rgba(255, 193, 7, 0.8);
                    color: white;
                    backdrop-filter: blur(4px);
                }

                .price-container {
                    font-size: 0.9rem;
                    margin-bottom: 0.8rem;
                    min-height: 2.8rem;
                }

                .old-price {
                    font-size: 0.85rem;
                    margin-bottom: 0.2rem;
                }

                .new-price {
                    font-size: 1rem;
                }

                .product-options {
                    font-size: 0.8rem;
                }

                .card-body {
                    padding: 0.8rem;
                    padding-bottom: 3.5rem; /* Thêm khoảng trống dưới để hiển thị nút */
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    position: relative;
                }
            `}</style>
        </div>
    );
};

export default ProductCard; 