const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const existingCoupon = await Coupon.findOne({ name: req.body.name });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Mã giảm giá đã tồn tại"
            });
        }
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi tạo mã giảm giá",
            error: error.message
        });
    }
});

// Lấy tất cả mã giảm giá
const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi lấy danh sách mã giảm giá",
            error: error.message
        });
    }
});

// Cập nhật mã giảm giá
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const existingCoupon = await Coupon.findOne({ name: req.body.name, _id: { $ne: id } });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Tên mã giảm giá đã tồn tại"
            });
        }
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã giảm giá"
            });
        }
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật mã giảm giá",
            error: error.message
        });
    }
});

// Xóa mã giảm giá
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (deletedCoupon) {
            res.json({
                success: true,
                message: "Đã xóa mã giảm giá thành công",
                deletedCoupon
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy mã giảm giá để xóa"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi xóa mã giảm giá",
            error: error.message
        });
    }
});

// Lấy một mã giảm giá cụ thể
const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const coupon = await Coupon.findById(id);
        res.json(coupon);
    } catch (error) {
        throw new Error(error);
    }
});

// Kiểm tra tính hợp lệ của mã giảm giá
const validateCoupon = asyncHandler(async (req, res) => {
    const { name } = req.body;
    try {
        const coupon = await Coupon.findOne({ name: name.toUpperCase() });
        if (coupon) {
            const currentDate = new Date();
            if (currentDate <= coupon.expiry) {
                res.json({
                    valid: true,
                    discount: coupon.discount,
                    message: "Mã giảm giá hợp lệ"
                });
            } else {
                res.json({
                    valid: false,
                    message: "Mã giảm giá đã hết hạn"
                });
            }
        } else {
            res.json({
                valid: false,
                message: "Mã giảm giá không tồn tại"
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    validateCoupon
};
