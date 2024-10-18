import React, { useEffect, useState } from 'react';
import { getAllBlogs, createBlog, updateBlog, deleteBlog, getAllBlogCategories } from '../api';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        images: ''
    });
    const [editingBlogId, setEditingBlogId] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    const fetchBlogs = async () => {
        const response = await getAllBlogs();
        setBlogs(response.data.data);
    };

    const fetchCategories = async () => {
        const response = await getAllBlogCategories();
        setCategories(response.data.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const blogData = {
                ...formData,
                images: formData.images.split(',').map(image => image.trim())
            };
            if (editingBlogId) {
                await updateBlog(editingBlogId, blogData);
            } else {
                await createBlog(blogData);
            }
            setFormData({ title: '', description: '', category: '', images: '' });
            setEditingBlogId(null);
            fetchBlogs();
        } catch (error) {
            console.error('Lỗi khi thêm/sửa bài viết:', error);
        }
    };

    const handleEdit = (blog) => {
        setFormData({
            title: blog.title,
            description: blog.description,
            category: blog.category,
            images: blog.images.join(', ')
        });
        setEditingBlogId(blog._id);
    };

    const handleDelete = async (id) => {
        await deleteBlog(id);
        fetchBlogs();
    };

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Bài viết</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control mb-2" placeholder="Tiêu đề bài viết" required />
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control mb-2" placeholder="Nội dung bài viết" required />
                <select name="category" value={formData.category} onChange={handleChange} className="form-control mb-2" required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.title}</option>
                    ))}
                </select>
                <input type="text" name="images" value={formData.images} onChange={handleChange} className="form-control mb-2" placeholder="URL hình ảnh (phân cách bằng dấu phẩy)" required />
                <button type="submit" className="btn btn-success">{editingBlogId ? 'Cập nhật' : 'Thêm'} Bài viết</button>
            </form>
            <h2>Danh sách Bài viết</h2>
            <ul className="list-group mb-4">
                {blogs.map(blog => (
                    <li key={blog._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <h3>{blog.title}</h3>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(blog)}>Sửa</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(blog._id)}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlogPage;