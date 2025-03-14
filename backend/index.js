const express = require('express');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandles');
const cors = require('cors');
const path = require('path');
const app = express();
const router = express.Router();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;

const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const blogRoute = require('./routes/blogRoute');
const prodCategoryRoute = require('./routes/prodCategoryRoute');
const blogCategoryRoute = require('./routes/blogCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dbConnect();
app.use(cors({
  origin: process.env.CLIENT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);
app.use('/api/user', authRoute);
app.use('/api/product-category', prodCategoryRoute);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRoute);
app.use('/api/blog-category', blogCategoryRoute);
app.use('/api/brand', brandRoute);
app.use('/api/coupon', couponRoute);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


