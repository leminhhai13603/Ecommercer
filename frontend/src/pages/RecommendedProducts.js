import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import PopularProducts from '../components/PopularProducts';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import DiscountedProducts from '../components/DiscountedProducts';

const sliderImages = [
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80", 
    "https://images.unsplash.com/photo-1604882767135-b41fac508fff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
];

const RecommendedProducts = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % sliderImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container-fluid py-5 mt-4">
            {/* Slider ảnh ở trên cùng */}
            <div className="slider-wrapper mb-4">
                <div className="slider-image-container">
                    <img
                        src={sliderImages[current]}
                        alt={`slide-${current + 1}`}
                        className="slider-image"
                    />
                </div>
                <div className="slider-dots mt-2 text-center">
                    {sliderImages.map((_, idx) => (
                        <span
                            key={idx}
                            className={`slider-dot${current === idx ? ' active' : ''}`}
                            onClick={() => setCurrent(idx)}
                        ></span>
                    ))}
                </div>
            </div>

            {/* Phần sản phẩm đang giảm giá */}
            <DiscountedProducts />

            {/* Phần gợi ý cá nhân */}
            {isAuthenticated && (
                <PersonalizedRecommendations />
            )}

            {/* Phần sản phẩm phổ biến */}
            <PopularProducts />

            {/* CSS cho slider */}
            <style jsx>{`
                .slider-wrapper {
                    max-width: 90vw;
                    margin: 0 auto 2rem auto;
                }
                .slider-image-container {
                    width: 100%;
                    height: 600px;
                    overflow: hidden;
                    border-radius: 18px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f9fa;
                }
                .slider-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.5s;
                }
                .slider-dots {
                    margin-top: 10px;
                }
                .slider-dot {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    margin: 0 5px;
                    background: #bbb;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .slider-dot.active {
                    background: #0d6efd;
                }
                @media (max-width: 900px) {
                    .slider-image-container {
                        height: 220px;
                    }
                }
                @media (max-width: 600px) {
                    .slider-image-container {
                        height: 140px;
                    }
                }
            `}</style>
        </div>
    );
};

export default RecommendedProducts; 