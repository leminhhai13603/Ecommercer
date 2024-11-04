import React, { useEffect, useState, useCallback } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllCategories, getAllBrands, uploadProductImage } from '../api';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        brand: '',
        quantity: '',
        color: '',
        images: []
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllProducts();
            setProducts(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            setError('Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách danh mục:', error);
        }
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await getAllBrands();
            setBrands(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thương hiệu:', error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, [fetchProducts, fetchCategories, fetchBrands]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            let productData = { ...formData };
            let productId;
            
            if (editingProductId) {
                productId = editingProductId;
                await updateProduct(productId, productData);
            } else {
                const response = await createProduct(productData);
                productId = response.data._id;
            }
            
            console.log('Product ID after create/update:', productId);
            
            if (selectedFiles.length > 0 && productId) {
                const imageFormData = new FormData();
                selectedFiles.forEach((file) => {
                    imageFormData.append('images', file);
                });
                try {
                    await uploadProductImage(productId, imageFormData);
                    console.log('Images uploaded successfully');
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                    setError('Sản phẩm đã được tạo nhưng không thể tải lên hình ảnh. Vui lòng thử lại sau.');
                }
            }
            
            setFormData({
                title: '',
                price: '',
                description: '',
                category: '',
                brand: '',
                quantity: '',
                color: '',
                images: []
            });
            setEditingProductId(null);
            setSelectedFiles([]);
            await fetchProducts(); 
            
        } catch (error) {
            console.error('Lỗi khi thêm/sửa sản phẩm:', error);
            setError('Có lỗi xảy ra khi thêm/sửa sản phẩm. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            title: product.title || '',
            price: product.price || '',
            description: product.description || '',
            category: product.category || '',
            brand: product.brand || '',
            quantity: product.quantity || '',
            color: product.color || '',
            images: product.images || []
        });
        setEditingProductId(product._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                setIsLoading(true);
                await deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Sản phẩm</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control mb-2" placeholder="Tên sản phẩm" required />
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control mb-2" placeholder="Giá sản phẩm" required />
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control mb-2" placeholder="Mô tả sản phẩm" required />
                
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

                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control mb-2" placeholder="Số lượng sản phẩm" required />
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="form-control mb-2" placeholder="Màu sắc" required />
                <input type="file" multiple onChange={handleFileChange} className="form-control mb-2" />
                {formData.images && formData.images.length > 0 && (
                    <div className="mb-2">
                        <p>Ảnh hiện tại:</p>
                        {formData.images.map((image, index) => (
                            <img key={index} src={image.url} alt={`Product ${index + 1}`} style={{width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px'}} />
                        ))}
                    </div>
                )}
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : (editingProductId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm')}
                </button>
            </form>
            <h2>Danh sách Sản phẩm</h2>
            <ul className="list-group mb-4">
                {products.map(product => (
                    <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h3>{product.title}</h3>
                            <p>Giá: {product.price}</p>
                            <p>Số lượng: {product.quantity}</p>
                            <p>Màu sắc: {product.color}</p>
                            <p>Danh mục ID: {product.category}</p>
                            <p>Thương hiệu ID: {product.brand}</p>
                        </div>
                        <div>
                            {product.images && product.images.length > 0 && (
                                <img src={product.images[0].url} alt={product.title} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                            )}
                        </div>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(product)} disabled={isLoading}>Sửa</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(product._id)} disabled={isLoading}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductPage;