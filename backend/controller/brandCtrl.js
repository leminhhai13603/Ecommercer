const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');

const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo thương hiệu thành công',
            data: newBrand
        });
    } catch (error) {
        // Xử lý lỗi unique
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên thương hiệu đã tồn tại',
                error: error.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Có lỗi xảy ra khi tạo thương hiệu',
                error: error.message
            });
        }
    }
});

const getAllBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find().sort({ title: 1 });
        res.status(200).json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách thương hiệu',
            error: error.message
        });
    }
});

const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu'
            });
        }
        res.status(200).json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin thương hiệu',
            error: error.message
        });
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBrand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu để cập nhật'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật thương hiệu thành công',
            data: updatedBrand
        });
    } catch (error) {
        // Xử lý lỗi unique khi cập nhật
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên thương hiệu đã tồn tại',
                error: error.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật thương hiệu',
                error: error.message
            });
        }
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        if (!deletedBrand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu để xóa'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa thương hiệu thành công',
            data: deletedBrand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa thương hiệu',
            error: error.message
        });
    }
});

module.exports = {
    createBrand,
    getAllBrands,
    getBrand,
    updateBrand,
    deleteBrand
};