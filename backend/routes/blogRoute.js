const express = require('express');
const router = express.Router();
const {
    createBlog,
    updateBlog,
    getBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    getAllBlogs,
    uploadImage 
} = require('../controller/blogCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploader, blogImageResize } = require('../middlewares/uploadimages');
router.post('/', authMiddleware, isAdmin, createBlog);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get('/:id', getBlog);
router.get('/', getAllBlogs);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);
router.put('/like/:id', authMiddleware, likeBlog);
router.put('/dislike/:id', authMiddleware, dislikeBlog);
router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    uploader.single('image'), 
    blogImageResize, 
    uploadImage
);
module.exports = router;