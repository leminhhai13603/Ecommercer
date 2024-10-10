const express = require('express');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandles');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT;

// Routes
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

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', authRoute);
app.use('/api/product-category', prodCategoryRoute);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRoute);
app.use('/api/blog-category', blogCategoryRoute);
app.use('/api/brand', brandRoute);
app.use('/api/coupon', couponRoute);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`connect to port ${port}`);
});


