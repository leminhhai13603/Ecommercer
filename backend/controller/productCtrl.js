const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');
const slugify = require('slugify');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs').promises;

const createProduct = asyncHandler(async (req, res) => {
    try {
        const slug = slugify(req.body.title, { lower: true, strict: true });
        const existingProduct = await Product.findOne({ slug: slug });
        if (existingProduct) {
            return res.status(400).json({ message: "Slug đã tồn tại. Vui lòng chọn một tiêu đề khác." });
        }
        req.body.slug = slug;
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ 
            message: "Có lỗi xảy ra khi tạo sản phẩm.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongoDbId(id);
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(200).json(product);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }
        res.status(500).json({ message: "Lỗi khi lấy thông tin sản phẩm", error: error.message });
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // Xây dựng query string
        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = JSON.parse(queryStr);

        // Lọc theo các trường cơ bản
        const filterFields = ['brand', 'color', 'category'];
        filterFields.forEach(field => {
            if (query[field]) {
                query[field] = query[field];
            }
        });

        // Xử lý lọc theo giá
        if (query.price) {
            query.price = JSON.parse(query.price.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));
        }

        // Tạo đối tượng truy vấn
        let productQuery = Product.find(query);

        // Sắp xếp
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            productQuery = productQuery.sort(sortBy);
        } else {
            productQuery = productQuery.sort('-createdAt');
        }

        // Giới hạn trường
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            productQuery = productQuery.select(fields);
        } else {
            productQuery = productQuery.select('-__v');
        }

        // Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        productQuery = productQuery.skip(skip).limit(limit);

        // Thực hiện truy vấn
        const products = await productQuery;

        // Đếm tổng số sản phẩm
        const totalProducts = await Product.countDocuments(query);

        console.log('Số lượng sản phẩm tìm thấy:', products.length);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            page,
            totalPages: Math.ceil(totalProducts / limit),
            data: products
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        res.status(500).json({ 
            message: "Có lỗi xảy ra khi lấy danh sách sản phẩm.",
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        // Tạo slug mới từ tiêu đề sản phẩm nếu có
        if (req.body.title) {
            const newSlug = slugify(req.body.title, { lower: true, strict: true });
            
            // Kiểm tra xem slug mới đã tồn tại chưa (trừ sản phẩm hiện tại)
            const existingProduct = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
            if (existingProduct) {
                return res.status(400).json({ message: "Slug đã tồn tại. Vui lòng chọn một tiêu đề khác." });
            }
            
            // Thêm slug mới vào dữ liệu cập nhật
            req.body.slug = newSlug;
        }
        
        // Cập nhật sản phẩm
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        // Xử lý lỗi chung
        res.status(500).json({ 
            message: "Có lỗi xảy ra khi cập nhật sản phẩm.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(200).json({ message: "Sản phẩm đã được xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
    }
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { prodId } = req.body;

    try {
        const user = await User.findById(id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
        
        if (alreadyAdded) {
            let updatedUser = await User.findByIdAndUpdate(
                id,
                {
                    $pull: { wishlist: prodId },
                },
                { new: true }
            );
            res.json(updatedUser);
        } else {
            let updatedUser = await User.findByIdAndUpdate(
                id,
                {
                    $push: { wishlist: prodId },
                },
                { new: true }
            );
            res.json(updatedUser);
        }
    } catch (error) {
        throw new Error(error);
    }
});
const rating = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { star, prodId, comment } = req.body;
    
    try {
        const product = await Product.findById(prodId);
        
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        let alreadyRated = product.ratings.find((rating) => rating.postedBy.toString() === id);
        
        if (alreadyRated) {
            await Product.updateOne(
                { _id: prodId, "ratings.postedBy": id },
                { $set: { "ratings.$.star": star, "ratings.$.comment": comment } }
            );
        } else {
            await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: { star, comment, postedBy: id }
                    }
                },
                { new: true }
            );
        }
        
        // Tính toán lại tổng đánh giá
        const updatedProduct = await Product.findById(prodId);
        const totalRating = updatedProduct.ratings.reduce((sum, item) => sum + item.star, 0);
        const ratingCount = updatedProduct.ratings.length;
        updatedProduct.totalrating = (totalRating / ratingCount).toFixed(1);
        await updatedProduct.save();
        
        res.status(200).json({ message: "Đánh giá sản phẩm thành công", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Không tìm thấy sản phẩm" });
    }
});

const uploadImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log('Uploading image for product ID:', id);
    validateMongoDbId(id);

    try {
        console.log('Files received:', req.files);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không có tệp nào được tải lên" });
        }

        const product = await Product.findById(id);
        console.log('Product found:', product);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const uploadPromises = req.files.map(async (file) => {
            console.log('Processing file:', file.originalname);
            try {
                // Sử dụng buffer thay vì file path
                const result = await cloudinaryUploadImg(file.buffer);
                console.log('Cloudinary result:', result);
                return {
                    url: result.url,
                    public_id: result.public_id
                };
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                throw uploadError;
            }
        });

        const uploadedImages = await Promise.all(uploadPromises);
        console.log('Uploaded images:', uploadedImages);

        product.images.push(...uploadedImages);
        await product.save();

        res.status(200).json({ 
            message: "Ảnh đã được tải lên và cập nhật thành công", 
            product: product 
        });
    } catch (error) {
        console.error('Lỗi chi tiết khi tải lên ảnh:', error);
        res.status(500).json({ 
            message: "Lỗi khi tải lên và cập nhật ảnh", 
            error: error.message,
            stack: error.stack
        });
    }
});

// Thêm hàm mới để xóa ảnh
const deleteImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { public_id } = req.body;
    validateMongoDbId(id);

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        // Xóa ảnh trên Cloudinary
        await cloudinaryUploadImg.cloudinary.uploader.destroy(public_id);

        // Xóa ảnh khỏi mảng images của sản phẩm
        product.images = product.images.filter(img => img.public_id !== public_id);

        await product.save();

        res.status(200).json({ 
            message: "Ảnh đã được xóa thành công", 
            product: product 
        });
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
        res.status(500).json({ 
            message: "Lỗi khi xóa ảnh", 
            error: error.message
        });
    }
});

module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImage,
    deleteImage  
};