const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const uniqid = require('uniqid');
const mongoose = require('mongoose');
const {generateToken} = require('../config/jwtToken');
const crypto = require('crypto');
const generateRefreshToken = require('../config/refreshToken');
const validateMongodbId = require('../utils/validateMongodbid');
const {sendEmail} = require('../controller/emailCtrl');
const jwt = require('jsonwebtoken');

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    
    if (!findUser) {
        // Tạo user mới
        const newUser = await User.create(req.body);
        const token = generateToken(newUser._id);
        res.status(201).json({ newUser, token });
    } else {
        // Người dùng đã tồn tại
        res.status(400).json({ message: 'Email đã được sử dụng' });
    }
});

const loginUserCtrl = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken = generateRefreshToken(findUser._id);
        await User.findByIdAndUpdate(findUser._id, { refreshToken: refreshToken });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            role: findUser.role,
            token: generateToken(findUser._id),
            refreshToken: refreshToken,
        });
    } else {
        res.status(401).json({ message: 'Sai thông tin đăng nhập' });
    }
});

const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookieToken = req.cookies.refreshToken;
    const verify = jwt.verify(cookieToken, process.env.JWT_SECRET);
    const user = await User.findById(verify.id);
    if(!user) {
        res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    const accessToken = generateToken(user._id);
    res.json({ accessToken });
});

const logout = asyncHandler(async(req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        await User.findByIdAndUpdate(id, { refreshToken: null });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getAllUsers = asyncHandler(async(req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getUserByID = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findById(id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.status(200).json({ message: 'Đã xóa người dùng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const updateUserbyAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });  
        res.status(200).json({ message: 'Đã khóa người dùng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;  
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        res.status(200).json({ message: 'Đã mở khóa người dùng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

const updatePassword = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;
    validateMongodbId(id);
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        
        if (!(await user.isPasswordMatched(currentPassword))) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }
        
        // Cập nhật mật khẩu
        user.password = newPassword;
        await user.save(); // Điều này sẽ kích hoạt middleware pre-save
        
        res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật mật khẩu:', error);
        res.status(500).json({ message: error.message });
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    try {
        const resetToken = await user.createPasswordResetToken();
        await user.save();
        
        const resetURL = `http://localhost:5000/api/user/reset-password/${resetToken}`;
        
        const data = {
            to: user.email,
            subject: "Yêu cầu đặt lại mật khẩu",
            text: `Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn: ${resetURL}`,
            html: `<p>Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:</p><a href="${resetURL}">${resetURL}</a>`
        };
        
        try {
            await sendEmail(data);
            res.status(200).json({ message: 'Đã gửi email đặt lại mật khẩu' });
        } catch (emailError) {
            console.error('Lỗi khi gửi email:', emailError);
            res.status(500).json({ message: 'Không thể gửi email đặt lại mật khẩu' });
        }
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        console.error('Lỗi trong quá trình xử lý yêu cầu đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi xử lý yêu cầu đặt lại mật khẩu' });
    }
});
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params; 
    const { newPassword } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    console.log('Received token:', token);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
        }
        
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi đặt lại mật khẩu' });
    }
}); 
const getWishlist = asyncHandler(async (req, res) => {
    const {id} = req.user;
    try {
        validateMongodbId(id);
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy wishlist', error: error.message });
    }
});

const saveUserAddress = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { address } = req.body;
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndUpdate(id, { address }, { new: true });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.findOne({ userId: _id }).populate({
            path: 'products.product',
            select: 'title price images discountPercentage'
        });

        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        let cartTotalBeforeDiscount = 0;
        let cartTotalAfterDiscount = 0;

        const detailedCart = {
            items: cart.products.map(item => {
                const productDetails = item.product || {};
                const discountPercentage = productDetails.discountPercentage || 0;
                const discountedPrice = item.price * (1 - discountPercentage / 100);
                const subtotalBeforeDiscount = item.quantity * item.price;
                const subtotalAfterDiscount = item.quantity * discountedPrice;

                cartTotalBeforeDiscount += subtotalBeforeDiscount;
                cartTotalAfterDiscount += subtotalAfterDiscount;

                return {
                    product: {
                        _id: productDetails._id,
                        title: productDetails.title || 'Sản phẩm không tồn tại',
                        price: productDetails.price || 0,
                        discountedPrice: discountedPrice,
                        image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : null
                    },
                    quantity: item.quantity,
                    color: item.color,
                    price: item.price,
                    discountedPrice: discountedPrice,
                    subtotalBeforeDiscount: subtotalBeforeDiscount,
                    subtotalAfterDiscount: subtotalAfterDiscount
                };
            }),
            cartTotalBeforeDiscount: cartTotalBeforeDiscount,
            cartTotalAfterDiscount: cartTotalAfterDiscount
        };

        res.status(200).json(detailedCart);
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy giỏ hàng', error: error.message });
    }
});

const addToCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId, quantity, color } = req.body;
    validateMongodbId(_id);
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        let cart = await Cart.findOne({ userId: _id });
        if (!cart) {
            cart = new Cart({ userId: _id, products: [] });
        }

        const existingProductIndex = cart.products.findIndex(
            item => item.product.toString() === productId && item.color === color
        );

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({
                product: productId,
                quantity,
                color,
                price: product.price
            });
        }

        cart.cartTotal = cart.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        await cart.save();

        // Cập nhật giỏ hàng trong User model
        await User.findByIdAndUpdate(_id, { cart: cart.products });

        res.status(200).json({
            message: 'Đã cập nhật giỏ hàng thành công',
            cart: cart
        });
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi thêm vào giỏ hàng', error: error.message });
    }
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId, color } = req.body;
    validateMongodbId(_id);
    try {
        let cart = await Cart.findOne({ userId: _id });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        cart.products = cart.products.filter(item => 
            !(item.product.toString() === productId && item.color === color)
        );

        cart.cartTotal = cart.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        await cart.save();

        // Cập nhật giỏ hàng trong User model
        await User.findByIdAndUpdate(_id, { cart: cart.products });

        res.status(200).json({
            message: 'Sản phẩm đã được xóa khỏi giỏ hàng thành công',
            cart: cart
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng',
            error: error.message
        });
    }
});
const updateCartItem = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId, quantity } = req.body;
    validateMongodbId(_id);
    try {
        const cart = await Cart.findOne({ userId: _id });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        cart.products = cart.products.map(item => 
            item.product.toString() === productId ? { ...item, quantity: quantity } : item
        );

        cart.cartTotal = cart.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        await cart.save();

        // Cập nhật giỏ hàng trong User model
        await User.findByIdAndUpdate(_id, { cart: cart.products });

        res.status(200).json({
            message: 'Số lượng sản phẩm đã được cập nhật thành công',
            cart: cart
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm trong giỏ hàng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật sản phẩm trong giỏ hàng', error: error.message });
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { coupon } = req.body;
    validateMongodbId(_id);
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        if (user.appliedCoupon) {
            if (user.appliedCoupon === coupon.toUpperCase()) {
                user.appliedCoupon = null;
                await user.save();
                return res.status(200).json({ message: 'Đã gỡ bỏ mã giảm giá' });
            } else {
                return res.status(400).json({ message: 'Đã áp dụng mã giảm giá khác' });
            }
        }

        const couponData = await Coupon.findOne({ name: coupon.toUpperCase() });
        if (!couponData) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
        }

        if (couponData.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
        }

        const cartTotalBeforeDiscount = user.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountAmount = (cartTotalBeforeDiscount * couponData.discount) / 100;
        const cartTotalAfterDiscount = cartTotalBeforeDiscount - discountAmount;

        user.appliedCoupon = coupon.toUpperCase();
        await user.save();

        res.status(200).json({ 
            message: 'Mã giảm giá đã được áp dụng thành công',
            cartTotalBeforeDiscount,
            discountAmount,
            cartTotalAfterDiscount
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Có lỗi xảy ra khi áp dụng mã giảm giá', 
            error: error.message 
        });
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { 
        shippingInfo, 
        paymentInfo,
        coupon
    } = req.body;
    validateMongodbId(_id);
    try {
        const user = await User.findById(_id);
        const cart = await Cart.findOne({ userId: _id }).populate('products.product');

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        if (!shippingInfo || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country) {
            return res.status(400).json({ message: 'Thông tin giao hàng không đầy đủ' });
        }

        let finalAmount = cart.cartTotal;
        if (coupon) {
            const couponData = await Coupon.findOne({ name: coupon.toUpperCase() });
            if (couponData) {
                finalAmount = finalAmount - (finalAmount * couponData.discount / 100);
            }
        }

        const orderId = uniqid('order-');
        const isPaid = paymentInfo?.status === 'Đã thanh toán';

        const newOrder = await Order.create({
            products: cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                color: item.color
            })),
            paymentInfo: {
                id: orderId,
                status: paymentInfo?.status || 'Chưa thanh toán'
            },
            shippingInfo: {
                address: shippingInfo.address,
                city: shippingInfo.city,
                postalCode: shippingInfo.postalCode,
                country: shippingInfo.country,
            },
            user: user._id,
            orderStatus: isPaid ? 'Đã thanh toán' : 'Đang xử lý',
            totalAmount: finalAmount,
            paidAt: isPaid ? new Date() : new Date(0) // Đặt một giá trị mặc định nếu chưa thanh toán
        });

        // Cập nhật số lượng sản phẩm và bán hàng
        for (const item of cart.products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { quantity: -item.quantity, sold: +item.quantity }
            });
        }

        // Xóa giỏ hàng sau khi đặt hàng
        await Cart.findOneAndDelete({ userId: _id });
        user.cart = [];
        await user.save();

        res.status(201).json({ 
            message: 'Đơn hàng đã được tạo thành công',
            order: newOrder
        });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ 
            message: 'Có lỗi xảy ra khi tạo đơn hàng', 
            error: error.message 
        });
    }
});

const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const orders = await Order.find({ user: _id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy đơn hàng', error: error.message });
    }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
        }
        
        if (!status) {
            return res.status(400).json({ message: 'Trạng thái không được cung cấp' });
        }

        const updateData = {
            orderStatus: status,
            'paymentInfo.status': status
        };

        // Nếu trạng thái là "Đã thanh toán", cập nhật paidAt
        if (status === 'Đã thanh toán') {
            updateData.paidAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            id, 
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Không thể tìm thấy đơn hàng' });
        } else

        res.status(200).json({ 
            message: 'Đơn hàng đã được cập nhật thành công', 
            order 
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn hàng:', error);
        res.status(500).json({ 
            message: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng', 
            error: error.message 
        });
    }
});

module.exports = { 
    createUser, 
    loginUserCtrl, 
    getAllUsers, 
    getUserByID, 
    deleteUser, 
    updateUser,
    updateUserbyAdmin,
    blockUser, 
    unblockUser, 
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveUserAddress,
    getUserCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
};