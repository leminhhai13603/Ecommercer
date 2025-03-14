const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require('fs');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect');

// Import routes
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const blogRoute = require('./routes/blogRoute');
const prodCategoryRoute = require('./routes/prodCategoryRoute');
const blogCategoryRoute = require('./routes/blogCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Thêm logging để debug
console.log('=== DEBUGGING SERVER START ===');
console.log('Current directory:', __dirname);
console.log('Parent directory:', path.join(__dirname, '..'));
try {
    console.log('Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
    const frontendPath = path.join(__dirname, '../frontend');
    console.log('Frontend directory contents:', fs.readdirSync(frontendPath));
    const buildPath = path.join(__dirname, '../frontend/build');
    if (fs.existsSync(buildPath)) {
        console.log('Build directory contents:', fs.readdirSync(buildPath));
    } else {
        console.log('❌ Build directory not found at:', buildPath);
    }
} catch (error) {
    console.error('Error checking directories:', error);
}

// ✅ Kết nối database
dbConnect();

// ✅ Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Serve static files từ thư mục build
const buildPath = path.join(__dirname, '../frontend/public');
if (fs.existsSync(buildPath)) {
    console.log('✅ Serving static files from:', buildPath);
    app.use(express.static(buildPath));
} else {
    console.warn('⚠️ Build folder not found at:', buildPath);
}

// ✅ API routes
app.use('/api/user', authRoute);
app.use('/api/product-category', prodCategoryRoute);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRoute);
app.use('/api/blog-category', blogCategoryRoute);
app.use('/api/brand', brandRoute);
app.use('/api/coupon', couponRoute);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date(),
        env: process.env.NODE_ENV
    });
});

// ✅ Handle API 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: "API endpoint không tồn tại",
        path: req.path
    });
});

// ✅ Serve React app cho tất cả các routes khác
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    const indexPath = path.join(buildPath, 'index.html');
    console.log('Trying to serve:', indexPath);
    if (fs.existsSync(indexPath)) {
        console.log('✅ Serving index.html');
        res.sendFile(indexPath);
    } else {
        console.log('❌ index.html not found');
        res.status(404).json({ 
            error: "Frontend build không tồn tại",
            buildPath: buildPath,
            indexPath: indexPath,
            currentDir: __dirname
        });
    }
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ✅ Start server với better error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    const address = server.address();
    console.log(`🚀 Server đang chạy tại:`);
    console.log(`- Local: http://localhost:${address.port}`);
    console.log(`- Network: http://${address.address}:${address.port}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
    console.log(`- PORT được sử dụng: ${address.port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} đã được sử dụng. Vui lòng thử port khác.`);
    } else {
        console.error('❌ Lỗi khi khởi động server:', err);
    }
    process.exit(1);
});

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Nhận tín hiệu SIGTERM. Đang tắt server...');
    server.close(() => {
        console.log('Server đã đóng.');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});


