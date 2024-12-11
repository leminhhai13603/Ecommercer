import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getAllCategories, getAllBrands, getAllUsers, submitProductRating, addToCart } from '../api';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch product details
                const productResponse = await getProductById(id);
                setProduct(productResponse.data);

                // Fetch all categories, brands, and users
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
            // Gửi đánh giá lên API
            const response = await submitProductRating({
                prodId: id,
                star: rating,
                comment: review,
            });

            // Cập nhật danh sách đánh giá mới từ phản hồi API
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
        try {
            await addToCart(product._id, 1, product.color);
            toast.success('Sản phẩm đã được thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
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
                    <h3>Giá: {product.price.toLocaleString()} VNĐ</h3>
                    <p><strong>Mô tả:</strong> {product.description}</p>
                    <p><strong>Danh mục:</strong> {getCategoryName(product.category)}</p>
                    <p><strong>Thương hiệu:</strong> {getBrandName(product.brand)}</p>
                    <p><strong>Số lượng:</strong> {product.quantity}</p>
                    <p><strong>Màu sắc:</strong> {product.color}</p>
                    <p><strong>Tổng đánh giá:</strong> {product.totalrating}</p>
                    <button className="btn btn-success mt-3" onClick={handleAddToCart}>
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            <div className="reviews mt-5">
                <h2>Đánh giá sản phẩm</h2>
                {product.ratings?.length > 0 ? (
                    product.ratings.map((review, index) => (
                        <div key={index} className="review-item border p-3 mb-3">
                            <h5>{getUserName(review.postedBy)}</h5>
                            <p>Đánh giá: {review.star} / 5</p>
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
                        <select
                            className="form-select mb-3"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                        >
                            <option value="">Chọn...</option>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
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
