import React, { useEffect, useState } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api';

const ProductCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ title: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const response = await getAllCategories();
        setCategories(response.data.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, formData);
            } else {
                await createCategory(formData);
            }
            setFormData({ title: '' });
            setEditingCategoryId(null);
            fetchCategories();
        } catch (error) {
            console.error('Lỗi khi thêm/sửa danh mục sản phẩm:', error);
        }
    };

    const handleEdit = (category) => {
        setFormData({ title: category.title });
        setEditingCategoryId(category._id);
    };

    const handleDelete = async (id) => {
        await deleteCategory(id);
        fetchCategories();
    };

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Danh mục Sản phẩm</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control mb-2" placeholder="Tên danh mục" required />
                <button type="submit" className="btn btn-success">{editingCategoryId ? 'Cập nhật' : 'Thêm'} Danh mục</button>
            </form>
            <h2>Danh sách Danh mục Sản phẩm</h2>
            <ul className="list-group mb-4">
                {categories.map(category => (
                    <li key={category._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <h3>{category.title}</h3>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(category)}>Sửa</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(category._id)}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductCategoryPage;