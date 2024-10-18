import React, { useEffect, useState } from 'react';
import { getAllBrands, createBrand, updateBrand, deleteBrand } from '../api';

const BrandPage = () => {
    const [brands, setBrands] = useState([]);
    const [formData, setFormData] = useState({ title: '' });
    const [editingBrandId, setEditingBrandId] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        const response = await getAllBrands();
        setBrands(response.data.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBrandId) {
                await updateBrand(editingBrandId, formData);
            } else {
                await createBrand(formData);
            }
            setFormData({ title: '' });
            setEditingBrandId(null);
            fetchBrands();
        } catch (error) {
            console.error('Lỗi khi thêm/sửa thương hiệu:', error);
        }
    };

    const handleEdit = (brand) => {
        setFormData({ title: brand.title });
        setEditingBrandId(brand._id);
    };

    const handleDelete = async (id) => {
        await deleteBrand(id);
        fetchBrands();
    };

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Thương hiệu</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control mb-2" placeholder="Tên thương hiệu" required />
                <button type="submit" className="btn btn-success">{editingBrandId ? 'Cập nhật' : 'Thêm'} Thương hiệu</button>
            </form>
            <h2>Danh sách Thương hiệu</h2>
            <ul className="list-group mb-4">
                {brands.map(brand => (
                    <li key={brand._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <h3>{brand.title}</h3>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(brand)}>Sửa</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(brand._id)}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BrandPage;