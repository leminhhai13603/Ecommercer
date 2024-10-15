const express = require('express');
const router = express.Router();
const {
    createProduct, 
    getProduct, 
    getAllProduct, 
    updateProduct, 
    deleteProduct, 
    addToWishlist, 
    rating,
    uploadImage,
    deleteImage
} = require('../controller/productCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploader, productImageResize } = require('../middlewares/uploadimages');

router.post('/', authMiddleware, isAdmin, createProduct);
router.get('/:id', getProduct);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.post('/wishlist', authMiddleware, addToWishlist);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.post('/rating', authMiddleware, rating);

router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    uploader.single('image'), 
    productImageResize, 
    uploadImage
);

router.delete(
    '/delete-image/:id',
    authMiddleware,
    isAdmin,
    deleteImage
);

module.exports = router;