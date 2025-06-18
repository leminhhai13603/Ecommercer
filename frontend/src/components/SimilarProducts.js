import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { getSimilarProducts } from '../api';

const SimilarProducts = ({ productId }) => {
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                const response = await getSimilarProducts(productId);
                if (response && response.success && Array.isArray(response.data)) {
                    setSimilarProducts(response.data);
                } else {
                    console.error('Invalid response format:', response);
                    setSimilarProducts([]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm tương tự:', error);
                setSimilarProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchSimilarProducts();
        } else {
            setSimilarProducts([]);
            setLoading(false);
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!similarProducts || !Array.isArray(similarProducts) || similarProducts.length === 0) {
        return null;
    }

    return (
        <div className="similar-products my-4">
            <h3 className="mb-4">Sản phẩm tương tự</h3>
            <div className="row row-cols-2 row-cols-md-4 g-4">
                {similarProducts.map((product) => (
                    <div key={product._id} className="col">
                        <div className="card h-100 product-card">
                            <Link to={`/product/${product._id}`}>
                                <img
                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                                    className="card-img-top"
                                    alt={product.title}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                            </Link>
                            <div className="card-body">
                                <h5 className="card-title text-truncate">{product.title}</h5>
                                <p className="card-text text-danger fw-bold">
                                    {product.price?.toLocaleString()} VNĐ
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="badge bg-primary">{product.gender}</span>
                                    <span className="badge bg-secondary">{product.style}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .product-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: none;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .card-title {
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }

                .card-img-top {
                    transition: transform 0.3s;
                }

                .product-card:hover .card-img-top {
                    transform: scale(1.05);
                }

                .badge {
                    font-size: 0.8rem;
                    padding: 0.5em 0.8em;
                }
            `}</style>
        </div>
    );
};

export default SimilarProducts; 