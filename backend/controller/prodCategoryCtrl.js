const Category = require('../models/prodCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');

const createCategory = asyncHandler(async (req, res) => {
    try {
        const existingCategory = await Category.findOne({ title: req.body.title });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Danh mục với tên này đã tồn tại'
            });
        }
        
        const newCategory = await Category.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: newCategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo danh mục',
            error: error.message
        });
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách danh mục',
            error: error.message
        });
    }
});

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin danh mục',
            error: error.message
        });
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để cập nhật'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: updatedCategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật danh mục',
            error: error.message
        });
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để xóa'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công',
            data: deletedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa danh mục',
            error: error.message
        });
    }
});

module.exports = {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
};