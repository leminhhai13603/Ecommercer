const express = require('express');
const router = express.Router();
const {
    createBlogCategory,
    getAllBlogCategories,
    getBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
} = require('../controller/blogCategoryCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createBlogCategory);
router.get('/', getAllBlogCategories);
router.get('/:id', getBlogCategory);
router.put('/:id', authMiddleware, isAdmin, updateBlogCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteBlogCategory);
module.exports = router;
