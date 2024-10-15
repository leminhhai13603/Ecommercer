const BlogCategory = require('../models/blogCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');

// Tạo danh mục blog mới
const createBlogCategory = asyncHandler(async (req, res) => {
    try {
        const newBlogCategory = await BlogCategory.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo danh mục blog thành công',
            data: newBlogCategory
        });
    } catch (error) {
        // Xử lý lỗi unique
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên danh mục blog đã tồn tại',
                error: error.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Có lỗi xảy ra khi tạo danh mục blog',
                error: error.message
            });
        }
    }
});

// Lấy tất cả danh mục blog
const getAllBlogCategories = asyncHandler(async (req, res) => {
    try {
        const blogCategories = await BlogCategory.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: blogCategories.length,
            data: blogCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách danh mục blog',
            error: error.message
        });
    }
});

// Lấy một danh mục blog theo ID
const getBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blogCategory = await BlogCategory.findById(id);
        if (!blogCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục blog'
            });
        }
        res.status(200).json({
            success: true,
            data: blogCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin danh mục blog',
            error: error.message
        });
    }
});

// Cập nhật danh mục blog
const updateBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBlogCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục blog để cập nhật'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục blog thành công',
            data: updatedBlogCategory
        });
    } catch (error) {
        // Xử lý lỗi unique khi cập nhật
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên danh mục blog đã tồn tại',
                error: error.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật danh mục blog',
                error: error.message
            });
        }
    }
});

// Xóa danh mục blog
const deleteBlogCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
        if (!deletedBlogCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục blog để xóa'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa danh mục blog thành công',
            data: deletedBlogCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa danh mục blog',
            error: error.message
        });
    }
});

module.exports = {
    createBlogCategory,
    getAllBlogCategories,
    getBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
};