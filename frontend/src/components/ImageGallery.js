import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

const ImageGallery = ({ images = [] }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!images || images.length === 0) {
        return (
            <div className="image-gallery">
                <img 
                    src="https://via.placeholder.com/500x500?text=No+Image" 
                    alt="No image available"
                    className="main-image"
                />
            </div>
        );
    }

    return (
        <div className={`image-gallery ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* Main Image */}
            <div className="main-image-container">
                <img
                    src={images[currentImageIndex]?.url || images[currentImageIndex]}
                    alt={`Product view ${currentImageIndex + 1}`}
                    className="main-image"
                />
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button 
                            className="nav-button prev"
                            onClick={handlePrevImage}
                            aria-label="Previous image"
                        >
                            <FaChevronLeft />
                        </button>
                        <button 
                            className="nav-button next"
                            onClick={handleNextImage}
                            aria-label="Next image"
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}
                
                {/* Fullscreen Button */}
                <button 
                    className="fullscreen-button"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                >
                    <FaExpand />
                </button>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
                <div className="thumbnail-container">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                        >
                            <img
                                src={image.url || image}
                                alt={`Thumbnail ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .image-gallery {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .image-gallery.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 20px;
                }

                .main-image-container {
                    position: relative;
                    width: 100%;
                    padding-top: 100%; /* 1:1 Aspect Ratio */
                    overflow: hidden;
                    border-radius: 8px;
                }

                .main-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }

                .fullscreen .main-image-container {
                    padding-top: 80vh;
                }

                .nav-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.8);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 2;
                }

                .nav-button:hover {
                    background: white;
                    transform: translateY(-50%) scale(1.1);
                }

                .prev {
                    left: 10px;
                }

                .next {
                    right: 10px;
                }

                .fullscreen-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.8);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 2;
                }

                .fullscreen-button:hover {
                    background: white;
                    transform: scale(1.1);
                }

                .thumbnail-container {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                    overflow-x: auto;
                    padding: 10px 0;
                }

                .thumbnail {
                    flex: 0 0 80px;
                    height: 80px;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: all 0.3s ease;
                }

                .thumbnail:hover {
                    opacity: 0.8;
                }

                .thumbnail.active {
                    opacity: 1;
                    border: 2px solid #007bff;
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Custom scrollbar for thumbnail container */
                .thumbnail-container::-webkit-scrollbar {
                    height: 6px;
                }

                .thumbnail-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .thumbnail-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }

                .thumbnail-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                @media (max-width: 768px) {
                    .nav-button {
                        width: 30px;
                        height: 30px;
                    }

                    .thumbnail {
                        flex: 0 0 60px;
                        height: 60px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageGallery; 