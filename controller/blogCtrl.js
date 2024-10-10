const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');
const validateMongoDbId = require('../utils/validateMongodbid');
const { deleteOldImage } = require('../middlewares/uploadimages');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs').promises;

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'name email').populate('category', 'name');
        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách bài viết',
            error: error.message
        });
    }
});

const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            data: newBlog
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo bài viết',
            error: error.message
        });
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: updatedBlog
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật bài viết',
            error: error.message
        });
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        ).populate('author', 'name email').populate('category', 'name');
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }
        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin bài viết',
            error: error.message
        });
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết để xóa'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa bài viết thành công',
            data: deletedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa bài viết',
            error: error.message
        });
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        const userId = req.user._id;
        const isLiked = blog.likes.includes(userId);
        const isDisliked = blog.dislikes.includes(userId);

        if (isDisliked) {
            await Blog.findByIdAndUpdate(id, {
                $pull: { dislikes: userId },
                isDisliked: false
            }, { new: true });
        }

        if (isLiked) {
            const updatedBlog = await Blog.findByIdAndUpdate(id, {
                $pull: { likes: userId },
                isLiked: false
            }, { new: true });
            res.status(200).json({
                success: true,
                message: 'Đã bỏ thích bài viết',
                data: updatedBlog
            });
        } else {
            const updatedBlog = await Blog.findByIdAndUpdate(id, {
                $push: { likes: userId },
                isLiked: true
            }, { new: true });
            res.status(200).json({
                success: true,
                message: 'Đã thích bài viết',
                data: updatedBlog
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thực hiện thao tác',
            error: error.message
        });
    }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        const userId = req.user._id;
        const isDisliked = blog.dislikes.includes(userId);
        const isLiked = blog.likes.includes(userId);

        if (isLiked) {
            await Blog.findByIdAndUpdate(id, {
                $pull: { likes: userId },
                isLiked: false
            }, { new: true });
        }

        if (isDisliked) {
            const updatedBlog = await Blog.findByIdAndUpdate(id, {
                $pull: { dislikes: userId },
                isDisliked: false
            }, { new: true });
            res.status(200).json({
                success: true,
                message: 'Đã bỏ không thích bài viết',
                data: updatedBlog
            });
        } else {
            const updatedBlog = await Blog.findByIdAndUpdate(id, {
                $push: { dislikes: userId },
                isDisliked: true
            }, { new: true });
            res.status(200).json({
                success: true,
                message: 'Đã không thích bài viết',
                data: updatedBlog
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thực hiện thao tác',
            error: error.message
        });
    }
});

const uploadImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        if (!req.file) {
            return res.status(400).json({ message: "Không có tệp nào được tải lên" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        // Tải ảnh lên Cloudinary
        const result = await cloudinaryUploadImg(req.file.path);

        // Xóa ảnh cũ trên Cloudinary nếu có
        if (blog.image && blog.image.public_id) {
            await cloudinaryUploadImg.cloudinary.uploader.destroy(blog.image.public_id);
        }

        // Cập nhật thông tin ảnh mới cho bài viết
        blog.image = {
            url: result.url,
            public_id: result.public_id
        };
        await blog.save();

        // Xóa file tạm trên server
        await fs.unlink(req.file.path);

        res.status(200).json({ 
            message: "Ảnh đã được tải lên và cập nhật thành công", 
            blog: blog 
        });
    } catch (error) {
        console.error('Lỗi khi tải lên ảnh:', error);
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Lỗi khi xóa file tạm:', unlinkError);
            }
        }
        res.status(500).json({ 
            message: "Lỗi khi tải lên và cập nhật ảnh", 
            error: error.message
        });
    }
});

module.exports = {
    getAllBlogs,
    createBlog,
    updateBlog,
    getBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImage
};



