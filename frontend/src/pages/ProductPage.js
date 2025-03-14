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
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 7;

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

            if (selectedFiles.length > 0 && productId) {
                const imageFormData = new FormData();
                selectedFiles.forEach((file) => {
                    imageFormData.append('images', file);
                });
                try {
                    await uploadProductImage(productId, imageFormData);
                } catch (uploadError) {
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
            setShowForm(false);
            await fetchProducts();
        } catch (error) {
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
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                setIsLoading(true);
                await deleteProduct(id);
                fetchProducts();
            } catch (error) {
                setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handlePrevPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    const handleNextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(products.length / productsPerPage)));

    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Quản lý Sản phẩm</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Ẩn Form' : 'Thêm Sản phẩm'}
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" placeholder="Tên sản phẩm" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" placeholder="Giá sản phẩm" required />
                                </div>
                            </div>
                            <div className="mb-3">
                                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" placeholder="Mô tả sản phẩm" rows="3" required />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-control" required>
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <select name="brand" value={formData.brand} onChange={handleChange} className="form-control" required>
                                        <option value="">Chọn thương hiệu</option>
                                        {brands.map(brand => (
                                            <option key={brand._id} value={brand._id}>{brand.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control" placeholder="Số lượng sản phẩm" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} className="form-control" placeholder="Màu sắc" required />
                                </div>
                            </div>
                            <div className="mb-3">
                                <input type="file" multiple onChange={handleFileChange} className="form-control" />
                            </div>
                            {formData.images && formData.images.length > 0 && (
                                <div className="mb-3">
                                    <p>Ảnh hiện tại:</p>
                                    <div className="d-flex gap-2">
                                        {formData.images.map((image, index) => (
                                            <img key={index} src={image.url} alt={`Product ${index + 1}`} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="btn btn-success" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : (editingProductId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Màu sắc</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            {product.images && product.images.length > 0 && (
                                                <img src={product.images[0].url} alt={product.title} style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                                            )}
                                        </td>
                                        <td>{product.title}</td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.color}</td>
                                        <td>
                                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(product)} disabled={isLoading}>
                                                <i className="fas fa-edit"></i> Sửa
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id)} disabled={isLoading}>
                                                <i className="fas fa-trash"></i> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button 
                            className="btn btn-outline-primary" 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                        >
                            Trang trước
                        </button>
                        <div className="d-flex gap-2">
                            {[...Array(Math.ceil(products.length / productsPerPage))].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="btn btn-outline-primary" 
                            onClick={handleNextPage} 
                            disabled={currentPage === Math.ceil(products.length / productsPerPage)}
                        >
                            Trang sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductPage;
