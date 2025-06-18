const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const recommendationService = require('../services/recommendationService');

// Middleware để validate query params
const validateQueryParams = (req, res, next) => {
    const limit = parseInt(req.query.limit);
    if (limit && (isNaN(limit) || limit < 1 || limit > 20)) {
        return res.status(400).json({
            success: false,
            message: 'Limit phải là số nguyên từ 1 đến 20'
        });
    }
    next();
};

// Lấy sản phẩm tương tự
router.get('/similar/:productId', validateQueryParams, async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 4;
        const products = await recommendationService.getSimilarProducts(productId, limit);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Lấy sản phẩm phổ biến
router.get('/popular', validateQueryParams, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await recommendationService.getPopularProducts(limit);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Lấy gợi ý cá nhân
router.get('/personalized', [authMiddleware, validateQueryParams], async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await recommendationService.getPersonalizedRecommendations(req.user._id, limit);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Cập nhật tương tác người dùng
router.post('/interaction', authMiddleware, async (req, res) => {
    try {
        const { productId, interactionType } = req.body;
        const interaction = await recommendationService.updateUserInteraction(
            req.user._id,
            productId,
            interactionType
        );
        res.json({
            success: true,
            data: interaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Lấy sản phẩm đang giảm giá
router.get('/products/discounted', validateQueryParams, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await recommendationService.getDiscountedProducts(limit);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 