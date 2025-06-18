import React, { useEffect, useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getDiscountedProducts } from '../api';
import ProductCard from './common/ProductCard';
import QuickViewModal from './QuickViewModal';

const DiscountedProducts = () => {
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchDiscountedProducts = async () => {
            try {
                const response = await getDiscountedProducts(12);
                if (response.success) {
                    setDiscountedProducts(response.data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm giảm giá:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscountedProducts();
    }, []);

    const nextSlide = () => {
        if (isAnimating || !sliderRef.current) return;
        
        setIsAnimating(true);
        
        if (currentIndex + 4 >= discountedProducts.length) {
            // Quay về đầu nếu đã đến cuối
            setCurrentIndex(0);
            sliderRef.current.style.transition = 'none';
            sliderRef.current.style.transform = 'translateX(0)';
            setIsAnimating(false);
            return;
        }
        
        // Di chuyển sang trái với hiệu ứng
        sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
        sliderRef.current.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            setCurrentIndex(currentIndex + 4);
            sliderRef.current.style.transition = 'none';
            sliderRef.current.style.transform = 'translateX(0)';
            setIsAnimating(false);
        }, 500);
    };

    const prevSlide = () => {
        if (isAnimating || !sliderRef.current) return;
        
        setIsAnimating(true);
        
        if (currentIndex === 0) {
            // Đi đến cuối nếu đang ở đầu
            const lastIndex = Math.floor((discountedProducts.length - 1) / 4) * 4;
            setCurrentIndex(lastIndex);
            sliderRef.current.style.transition = 'none';
            sliderRef.current.style.transform = 'translateX(0)';
            setIsAnimating(false);
            return;
        }
        
        // Chuẩn bị hiển thị slide trước
        sliderRef.current.style.transition = 'none';
        sliderRef.current.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            // Di chuyển sang phải với hiệu ứng
            sliderRef.current.style.transition = 'transform 0.5s ease-in-out';
            sliderRef.current.style.transform = 'translateX(0)';
            setCurrentIndex(currentIndex - 4);
            
            setTimeout(() => {
                setIsAnimating(false);
            }, 500);
        }, 50);
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setShowQuickView(true);
    };

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (discountedProducts.length === 0) {
        return null;
    }

    return (
        <div className="discounted-products my-5">
            <div className="section-header mb-4">
                <h3 className="text-center position-relative">
                    Sản phẩm đang giảm giá
                    <div className="header-line"></div>
                </h3>
            </div>
            
            <div className="position-relative">
                <button 
                    className="slider-button prev" 
                    onClick={prevSlide}
                    disabled={isAnimating}
                >
                    <FaChevronLeft />
                </button>

                <div className="product-container">
                    <div className="slider-wrapper">
                        <div className="slider-content" ref={sliderRef}>
                            <div className="row g-4 justify-content-center">
                                {discountedProducts.slice(currentIndex, currentIndex + 4).map((product) => (
                                    <div key={product._id} className="col-md-3 col-sm-6 product-col">
                                        <ProductCard product={product} onQuickView={handleQuickView} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    className="slider-button next" 
                    onClick={nextSlide}
                    disabled={isAnimating}
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal 
                show={showQuickView}
                onClose={() => setShowQuickView(false)}
                product={selectedProduct}
            />

            <style jsx>{`
                .section-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .header-line {
                    width: 100px;
                    height: 3px;
                    background: linear-gradient(to right, #ff4444, #ff8800);
                    margin: 10px auto 0;
                    border-radius: 2px;
                }

                .product-container {
                    width: 80%;
                    margin: 0 auto;
                    padding: 0 15px;
                    overflow: hidden;
                }

                .slider-wrapper {
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }

                .slider-content {
                    width: 100%;
                    display: flex;
                    transform: translateX(0);
                }

                .product-col {
                    margin-bottom: 20px;
                }

                .row {
                    width: 100%;
                    margin: 0;
                }

                .slider-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    z-index: 2;
                    transition: all 0.2s ease;
                }

                .slider-button:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 1);
                    transform: translateY(-50%) scale(1.1);
                }

                .slider-button.prev {
                    left: 5%;
                }

                .slider-button.next {
                    right: 5%;
                }

                .slider-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .product-container {
                        width: 95%;
                    }
                    
                    .slider-button.prev {
                        left: 0;
                    }
                    
                    .slider-button.next {
                        right: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default DiscountedProducts; 