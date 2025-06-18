const asyncHandler = require('express-async-handler');
const recommendationService = require('../services/recommendationService');

// Lấy sản phẩm tương tự
const getSimilarProducts = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    const similarProducts = await recommendationService.getSimilarProducts(productId, parseInt(limit));
    res.json({
        success: true,
        count: similarProducts.length,
        data: similarProducts
    });
});

// Lấy sản phẩm phổ biến
const getPopularProducts = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;
    const popularProducts = await recommendationService.getPopularProducts(parseInt(limit));
    res.json({
        success: true,
        count: popularProducts.length,
        data: popularProducts
    });
});

// Lấy sản phẩm đang giảm giá
const getDiscountedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        
        // Validate limit
        if (isNaN(limit) || limit < 1 || limit > 20) {
            return res.status(400).json({
                success: false,
                message: 'Limit phải là số nguyên từ 1 đến 20'
            });
        }

        const products = await recommendationService.getDiscountedProducts(limit);
        
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm giảm giá:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy sản phẩm giảm giá'
        });
    }
};

// Lấy gợi ý cá nhân hóa
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { limit = 8 } = req.query;
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, parseInt(limit));
    res.json({
        success: true,
        count: recommendations.length,
        data: recommendations
    });
});

// Cập nhật tương tác người dùng
const updateUserInteraction = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, interactionType } = req.body;
    
    const interaction = await recommendationService.updateUserInteraction(
        userId,
        productId,
        interactionType
    );
    
    res.json({
        success: true,
        data: interaction
    });
});

module.exports = {
    getSimilarProducts,
    getPopularProducts,
    getDiscountedProducts,
    getPersonalizedRecommendations,
    updateUserInteraction
}; 