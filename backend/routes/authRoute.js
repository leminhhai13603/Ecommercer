const express = require('express');
const router = express.Router();
const {
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
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require('../controller/userCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.post('/logout', authMiddleware, logout); 
router.post('/cart', authMiddleware, addToCart);
router.post('/create-order', authMiddleware, createOrder);

router.get('/get-orders', authMiddleware, getOrders);
router.get('/cart', authMiddleware, getUserCart);
router.get('/all-users', getAllUsers);
router.get('/refresh', handleRefreshToken);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/:id', authMiddleware, isAdmin, getUserByID);

router.delete('/remove-cart', authMiddleware, removeFromCart);
router.delete('/:id', deleteUser);

router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
router.put('/password', authMiddleware, updatePassword);
router.put('/save-address', authMiddleware, saveUserAddress);
router.put('/apply-coupon', authMiddleware, applyCoupon);
router.put('/edit-user/:id', authMiddleware, isAdmin, updateUserbyAdmin);
module.exports = router;
