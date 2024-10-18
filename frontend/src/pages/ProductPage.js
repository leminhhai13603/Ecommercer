import React, { useEffect, useState } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllCategories, getAllBrands } from '../api';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        brand: '',
        quantity: '',
        images: ''
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        const response = await getAllProducts();
        setProducts(response.data.data);
    };

    const fetchCategories = async () => {
        const response = await getAllCategories();
        setCategories(response.data.data);
    };

    const fetchBrands = async () => {
        const response = await getAllBrands();
        setBrands(response.data.data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                title: formData.title,
                price: formData.price,
                description: formData.description,
                category: formData.category,
                brand: formData.brand,
                quantity: formData.quantity,
                images: formData.images.split(',').map(image => image.trim())
            };
            console.log('Request data:', productData);
            if (editingProductId) {
                await updateProduct(editingProductId, productData);
            } else {
                await createProduct(productData);
            }
            setFormData({
                title: '',
                price: '',
                description: '',
                category: '',
                brand: '',
                quantity: '',
                images: ''
            });
            setEditingProductId(null);
            fetchProducts();
        } catch (error) {
            console.error('Lỗi khi thêm/sửa sản phẩm:', error);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            brand: product.brand,
            quantity: product.quantity,
            images: product.images.join(', ')
        });
        setEditingProductId(product._id);
    };

    const handleDelete = async (id) => {
        await deleteProduct(id);
        fetchProducts();
    };

    return (
        <div className="container">
            <h1 className="my-4">Product Management</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control mb-2" placeholder="Product Title" required />
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control mb-2" placeholder="Product Price" required />
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control mb-2" placeholder="Product Description" required />
                
                <select name="category" value={formData.category} onChange={handleChange} className="form-control mb-2" required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.title}</option>
                    ))}
                </select>

                <select name="brand" value={formData.brand} onChange={handleChange} className="form-control mb-2" required>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                        <option key={brand._id} value={brand._id}>{brand.title}</option>
                    ))}
                </select>

                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control mb-2" placeholder="Product Quantity" required />
                <input type="text" name="images" value={formData.images} onChange={handleChange} className="form-control mb-2" placeholder="Product Image URLs (comma separated)" required />
                <button type="submit" className="btn btn-success">{editingProductId ? 'Update Product' : 'Add Product'}</button>
            </form>
            <h2>Product List</h2>
            <ul className="list-group mb-4">
                {products.map(product => (
                    <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <h3>{product.title}</h3>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(product)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductPage;
