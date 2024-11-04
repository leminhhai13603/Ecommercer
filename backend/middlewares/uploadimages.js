const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.memoryStorage(); 

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb({ message: 'Unsupported file format' }, false);
    }
};

const uploader = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: { fileSize: 5000000 } 
});

const resizeImage = async (req, res, next, type) => {
    if (!req.file) return next();

    req.file.filename = `${type}-${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`;
    const outputPath = path.join(__dirname, `../public/images/${req.file.filename}`);

    try {
        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover', position: 'center' })
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        // Cập nhật req.file.path để sử dụng trong controller
        req.file.path = outputPath;

        next();
    } catch (error) {
        console.error('Lỗi khi xử lý ảnh:', error);
        next(new Error('Lỗi xử lý ảnh: ' + error.message));
    }
};

const blogImageResize = async (req, res, next) => {
    await resizeImage(req, res, next, 'blog');
};

const productImageResize = async (req, res, next) => {
    await resizeImage(req, res, next, 'product');
};

module.exports = { uploader, blogImageResize, productImageResize };