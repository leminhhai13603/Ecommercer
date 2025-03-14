import React, { useEffect, useState, useCallback, useContext } from 'react';
import { getAllProducts, getAllCategories, getAllBrands, addToCart as apiAddToCart } from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

const Home = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [productsPerPage] = useState(4);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllProducts();
            const data = response.data.data || [];
            setProducts(data);

            const categoryResponse = await getAllCategories();
            const brandResponse = await getAllBrands();

            setCategories(categoryResponse.data.data);
            setBrands(brandResponse.data.data);
        } catch (error) {
            toast.error('Không thể tải sản phẩm.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleSort = (e) => setSortBy(e.target.value);

    const handleCategoryClick = (categoryId) => {
        setCategoryFilter(prev => prev === categoryId ? '' : categoryId);
    };

    const handleBrandClick = (brandId) => {
        setBrandFilter(prev => prev === brandId ? '' : brandId);
    };

    const handlePageClick = (event) => setCurrentPage(event.selected);

    const addToCart = async (product) => {
        if (product.quantity <= 0) {
            toast.error('Sản phẩm đã hết hàng!');
            return;
        }

        try {
            await apiAddToCart(product._id, 1, product.color || 'default');
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
        }
    };

    const filteredAndSortedProducts = React.useMemo(() => {
        return products
            .filter((product) =>
                product.title?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter((product) =>
                categoryFilter ? product.category === categoryFilter : true
            )
            .filter((product) =>
                brandFilter ? product.brand === brandFilter : true
            )
            .sort((a, b) => {
                if (sortBy === 'price-asc') return a.price - b.price;
                if (sortBy === 'price-desc') return b.price - a.price;
                return 0;
            });
    }, [products, searchTerm, categoryFilter, brandFilter, sortBy]);

    const offset = currentPage * productsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(
        offset,
        offset + productsPerPage
    );
    const pageCount = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5" style={{ minWidth: '1200px' }}>
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3">
                    <h5>Danh mục</h5>
                    <ul className="list-group mb-4">
                        {categories.map((category) => (
                            <li 
                                key={category._id} 
                                className={`list-group-item ${categoryFilter === category._id ? 'active' : ''}`} 
                                onClick={() => handleCategoryClick(category._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {category.title}
                            </li>
                        ))}
                    </ul>

                    <h5>Thương hiệu</h5>
                    <ul className="list-group">
                        {brands.map((brand) => (
                            <li 
                                key={brand._id} 
                                className={`list-group-item ${brandFilter === brand._id ? 'active' : ''}`} 
                                onClick={() => handleBrandClick(brand._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {brand.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Product List */}
                <div className="col-md-9" style={{ minWidth: '800px' }}>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="col-md-6">
                            <select className="form-select" value={sortBy} onChange={handleSort}>
                                <option value="">Sắp xếp theo</option>
                                <option value="price-asc">Giá tăng dần</option>
                                <option value="price-desc">Giá giảm dần</option>
                            </select>
                        </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-4 g-4">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <div key={product._id} className="col">
                                    <div className="card h-100">
                                        <Link to={`/product/${product._id}`}>
                                            <img
                                                src={
                                                    product.images?.[0]?.url ||
                                                    'https://via.placeholder.com/500x500?text=No+Image'
                                                }
                                                className="card-img-top"
                                                alt={product.title || 'No title'}
                                                style={{ width: '100%', height: '250px', objectFit: 'contain' }}
                                            />
                                        </Link>
                                        <div className="card-body">
                                            <h5 className="card-title">{product.title || 'No title'}</h5>
                                            <p className="card-text">
                                                {product.description?.substring(0, 50) || 'Không có mô tả'}...
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>{product.price?.toLocaleString()} VNĐ</span>
                                            </div>
                                            <button 
                                                className="btn btn-primary btn-sm w-100 mt-2" 
                                                onClick={() => addToCart(product)}
                                                disabled={product.quantity <= 0}
                                            >
                                                {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <h4>Không có sản phẩm nào được tìm thấy.</h4>
                            </div>
                        )}
                    </div>
                    <ReactPaginate
                        previousLabel={<span className="btn btn-outline-primary">← Trước</span>}
                        nextLabel={<span className="btn btn-outline-primary">Sau →</span>}
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        containerClassName={'pagination justify-content-center mt-4'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        activeClassName={'active'}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
