const Product = require('../models/productModel');
const ProdCategory = require('../models/prodCategoryModel');
const Brand = require('../models/brandModel');
const Coupon = require('../models/couponModel');
const UserInteraction = require('../models/userInteractionModel');

class RecommendationService {
    // Lấy sản phẩm tương tự dựa trên thuộc tính
    async getSimilarProducts(productId, limit = 4) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                return [];
            }

            const similarProducts = await Product.find({
                _id: { $ne: productId },
                $or: [
                    { category: product.category },
                    { style: product.style },
                    { material: product.material },
                    { gender: product.gender }
                ]
            })
            .populate({ path: 'category', model: 'ProdCategory' })
            .populate({ path: 'brand', model: 'Brand' })
            .populate({ path: 'coupon', model: 'Coupon' })
            .limit(parseInt(limit))
            .lean();

            return similarProducts;
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm tương tự:', error);
            return [];
        }
    }

    // Lấy sản phẩm phổ biến
    async getPopularProducts(limit = 8) {
        try {
            const products = await Product.find()
                .sort({ viewCount: -1, sold: -1 })
                .limit(parseInt(limit))
                .populate({ path: 'category', model: 'ProdCategory' })
                .populate({ path: 'brand', model: 'Brand' })
                .populate({ path: 'coupon', model: 'Coupon' })
                .lean();

            return products;
        } catch (error) {
            throw new Error('Error fetching popular products: ' + error.message);
        }
    }

    // Gợi ý cá nhân hóa dựa trên lịch sử người dùng
    async getPersonalizedRecommendations(userId, limit = 8) {
        try {
            // Lấy lịch sử tương tác của người dùng
            const userInteractions = await UserInteraction.find({ user: userId })
                .sort({ timestamp: -1 })
                .limit(20)
                .populate({
                    path: 'product',
                    populate: [
                        { path: 'category', model: 'ProdCategory' },
                        { path: 'brand', model: 'Brand' },
                        { path: 'coupon', model: 'Coupon' }
                    ]
                });

            if (!userInteractions.length) {
                // Nếu không có lịch sử, trả về sản phẩm phổ biến
                return await this.getPopularProducts(limit);
            }

            // Lấy danh sách category và brand mà người dùng đã tương tác
            const interactedCategories = [...new Set(userInteractions.map(i => i.product?.category?._id).filter(Boolean))];
            const interactedBrands = [...new Set(userInteractions.map(i => i.product?.brand?._id).filter(Boolean))];

            // Tìm sản phẩm tương tự dựa trên category và brand
            const recommendedProducts = await Product.find({
                $or: [
                    { category: { $in: interactedCategories } },
                    { brand: { $in: interactedBrands } }
                ]
            })
            .limit(parseInt(limit))
            .populate({ path: 'category', model: 'ProdCategory' })
            .populate({ path: 'brand', model: 'Brand' })
            .populate({ path: 'coupon', model: 'Coupon' })
            .lean();

            return recommendedProducts;
        } catch (error) {
            throw new Error('Error generating personalized recommendations: ' + error.message);
        }
    }

    // Cập nhật tương tác người dùng
    async updateUserInteraction(userId, productId, interactionType) {
        try {
            // Kiểm tra sản phẩm tồn tại
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Sản phẩm không tồn tại');
            }
            
            // Cập nhật hoặc tạo mới tương tác
            const interaction = await UserInteraction.findOneAndUpdate(
                { user: userId, product: productId },
                { 
                    user: userId,
                    product: productId,
                    interactionType: interactionType,
                    timestamp: new Date()
                },
                { upsert: true, new: true }
            );
            
            return interaction;
        } catch (error) {
            throw new Error('Error updating user interaction: ' + error.message);
        }
    }

    // Lấy sản phẩm đang giảm giá
    async getDiscountedProducts(limit = 8) {
        try {
            const products = await Product.find({ coupon: { $exists: true, $ne: null } })
                .limit(parseInt(limit))
                .populate({ path: 'category', model: 'ProdCategory' })
                .populate({ path: 'brand', model: 'Brand' })
                .populate({ path: 'coupon', model: 'Coupon' })
                .lean();

            return products;
        } catch (error) {
            throw new Error('Error fetching discounted products: ' + error.message);
        }
    }
}

module.exports = new RecommendationService(); 