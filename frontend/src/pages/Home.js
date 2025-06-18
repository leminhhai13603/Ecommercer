import React, { useEffect, useState, useCallback, useContext } from 'react';
import { getAllProducts, getAllCategories, getAllBrands, addToCart as apiAddToCart } from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { FaPlus, FaMinus, FaEye, FaShoppingCart, FaPalette, FaRulerHorizontal } from 'react-icons/fa';
import QuickViewModal from '../components/QuickViewModal';

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
    const [sizeFilter, setSizeFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [productsPerPage] = useState(12);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);

    // State để theo dõi các mục đã mở/đóng
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        sizes: true,
        gender: true
    });

    // Các lựa chọn size và gender có sẵn
    const sizeOptions = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];
    const genderOptions = ['Unisex', 'Nam', 'Nữ'];

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

    const handleSizeClick = (size) => {
        setSizeFilter(prev => prev === size ? '' : size);
    };

    const handleGenderClick = (gender) => {
        setGenderFilter(prev => prev === gender ? '' : gender);
    };

    const handlePageClick = (event) => setCurrentPage(event.selected);
    
    // Xử lý đóng/mở một mục lọc
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const openQuickView = (product) => {
        setSelectedProduct(product);
        setShowQuickView(true);
    };

    const closeQuickView = () => {
        setShowQuickView(false);
        setSelectedProduct(null);
    };

    // Hàm kiểm tra match Category
    const categoryMatches = (product, filterValue) => {
        if (!filterValue) return true;
        
        // Nếu category là object, kiểm tra _id
        if (product.category && typeof product.category === 'object' && product.category._id) {
            return product.category._id === filterValue;
        }
        
        // Nếu category là string, so sánh trực tiếp
        return product.category === filterValue;
    };
    
    // Hàm kiểm tra match Brand
    const brandMatches = (product, filterValue) => {
        if (!filterValue) return true;
        
        // Nếu brand là object, kiểm tra _id
        if (product.brand && typeof product.brand === 'object' && product.brand._id) {
            return product.brand._id === filterValue;
        }
        
        // Nếu brand là string, so sánh trực tiếp
        return product.brand === filterValue;
    };

    const filteredAndSortedProducts = React.useMemo(() => {
        return products
            .filter((product) =>
                product.title?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter((product) => categoryMatches(product, categoryFilter))
            .filter((product) => brandMatches(product, brandFilter))
            .filter((product) => {
                if (!sizeFilter) return true;
                
                // Xử lý trường hợp Free Size
                if (sizeFilter === 'Free Size') {
                    return !product.size || product.size === 'Free Size' || 
                           (Array.isArray(product.size) && product.size.length === 0) ||
                           (Array.isArray(product.sizes) && product.sizes.length === 0);
                }

                // Kiểm tra size trong mảng sizes
                if (Array.isArray(product.sizes)) {
                    return product.sizes.includes(sizeFilter);
                }

                // Kiểm tra size trong mảng size
                if (Array.isArray(product.size)) {
                    return product.size.includes(sizeFilter);
                }

                // Kiểm tra size là chuỗi (có thể chứa nhiều size ngăn cách bằng dấu phẩy)
                if (typeof product.size === 'string') {
                    const sizes = product.size.split(',').map(s => s.trim());
                    return sizes.includes(sizeFilter);
                }

                // Kiểm tra trong variants nếu có
                if (Array.isArray(product.variants)) {
                    return product.variants.some(variant => variant.size === sizeFilter);
                }

                return false;
            })
            .filter((product) =>
                genderFilter ? (product.gender === genderFilter || (!product.gender && genderFilter === 'Unisex')) : true
            )
            .sort((a, b) => {
                if (sortBy === 'price-asc') return a.price - b.price;
                if (sortBy === 'price-desc') return b.price - a.price;
                return 0;
            });
    }, [products, searchTerm, categoryFilter, brandFilter, sizeFilter, genderFilter, sortBy]);

    const offset = currentPage * productsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(
        offset,
        offset + productsPerPage
    );
    const pageCount = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

    // Hàm để lấy số lượng màu sắc của sản phẩm
    const getColorCount = (product) => {
        // Trường hợp 1: Sản phẩm có mảng colors
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
            return product.colors.length;
        }
        
        // Trường hợp 2: Sản phẩm có chuỗi color ngăn cách bởi dấu phẩy
        if (product.color && typeof product.color === 'string') {
            const colorArray = product.color.split(',').map(color => color.trim()).filter(Boolean);
            return colorArray.length || 1;
        }
        
        // Trường hợp 3: Kiểm tra variants
        if (product.variants && Array.isArray(product.variants)) {
            const uniqueColors = new Set();
            product.variants.forEach(variant => {
                if (variant.color) {
                    uniqueColors.add(variant.color);
                }
            });
            if (uniqueColors.size > 0) {
                return uniqueColors.size;
            }
        }
        
        // Mặc định trả về 1 nếu không tìm thấy thông tin
        return 1;
    };

    const getSizeCount = (product) => {
        if (product.size && Array.isArray(product.size) && product.size.length > 0) {
            return product.size.length;
        }
        
        if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            return product.sizes.length;
        }

        if (product.variants && Array.isArray(product.variants)) {
            const uniqueSizes = new Set();
            product.variants.forEach(variant => {
                if (variant.size) {
                    uniqueSizes.add(variant.size);
                }
            });
            if (uniqueSizes.size > 0) {
                return uniqueSizes.size;
            }
        }

        if (product.size && typeof product.size === 'string') {
            const sizeArray = product.size.split(',').map(size => size.trim()).filter(Boolean);
            return sizeArray.length || 1;
        }
        return 1;
    };

    const calculateDiscountedPrice = (product) => {
        if (product.coupon) {
            const discount = product.couponInfo?.discount || 0;
            const price = product.price || 0;
            const discountedPrice = price - (price * (discount / 100));
            return discountedPrice;
        }
        return product.price || 0;
    };

    // Thêm hàm kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    const handleAddToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        
        try {
            await apiAddToCart({ productId, quantity });
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error) {
            toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
        }
    };

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
        <div className="container-fluid py-5 mt-4">
            <div className="row">
                {/* Sidebar */}
                <div className="col-lg-3 col-md-4 mb-4">
                    <div className="mb-4">
                        <div 
                            className="d-flex justify-content-between align-items-center mb-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleSection('categories')}
                        >
                            <h5 className="mb-0">Danh mục sản phẩm</h5>
                            {expandedSections.categories ? <FaMinus /> : <FaPlus />}
                        </div>
                        {expandedSections.categories && (
                            <ul className="list-group">
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
                        )}
                    </div>

                    <div className="mb-4">
                        <div 
                            className="d-flex justify-content-between align-items-center mb-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleSection('brands')}
                        >
                            <h5 className="mb-0">Thương hiệu</h5>
                            {expandedSections.brands ? <FaMinus /> : <FaPlus />}
                        </div>
                        {expandedSections.brands && (
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
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <div 
                            className="d-flex justify-content-between align-items-center mb-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleSection('sizes')}
                        >
                            <h5 className="mb-0">Size</h5>
                            {expandedSections.sizes ? <FaMinus /> : <FaPlus />}
                        </div>
                        {expandedSections.sizes && (
                            <ul className="list-group">
                                {sizeOptions.map((size) => (
                                    <li 
                                        key={size} 
                                        className={`list-group-item ${sizeFilter === size ? 'active' : ''}`} 
                                        onClick={() => handleSizeClick(size)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {size}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <div 
                            className="d-flex justify-content-between align-items-center mb-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleSection('gender')}
                        >
                            <h5 className="mb-0">Giới tính</h5>
                            {expandedSections.gender ? <FaMinus /> : <FaPlus />}
                        </div>
                        {expandedSections.gender && (
                            <ul className="list-group">
                                {genderOptions.map((gender) => (
                                    <li 
                                        key={gender} 
                                        className={`list-group-item ${genderFilter === gender ? 'active' : ''}`} 
                                        onClick={() => handleGenderClick(gender)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {gender}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div className="col-lg-9 col-md-8">
                    {/* Search and Sort Controls */}
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

                    {/* Product Grid */}
                    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <div key={product._id} className="col">
                                    <div className="card h-100 position-relative">
                                        {/* Thêm nhãn giảm giá */}
                                        {product.coupon && (
                                            <div className="discount-label">
                                                -{product.couponInfo?.discount || 0}%
                                            </div>
                                        )}
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
                                            <div className="price-container mb-2">
                                                {product.coupon ? (
                                                    <>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="text-muted text-decoration-line-through">
                                                                {product.price?.toLocaleString()} VNĐ
                                                            </span>
                                                            <span className="fw-bold text-danger">
                                                                {calculateDiscountedPrice(product).toLocaleString()} VNĐ
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="fw-bold">{product.price?.toLocaleString()} VNĐ</span>
                                                )}
                                            </div>
                                            
                                            {/* Thêm thông tin về màu sắc và kích thước */}
                                            <div className="mt-2 d-flex justify-content-between product-options">
                                                <span className="small text-muted">
                                                    <FaPalette className="me-1" /> 
                                                    +{getColorCount(product)} Màu sắc
                                                </span>
                                                <span className="small text-muted">
                                                    <FaRulerHorizontal className="me-1" />
                                                    +{getSizeCount(product)} Kích thước
                                                </span>
                                            </div>
                                            
                                            {/* Di chuyển nút vào trong card-body */}
                                            <button 
                                                className="add-to-cart-btn" 
                                                onClick={() => openQuickView(product)}
                                                disabled={product.quantity <= 0}
                                            >
                                                <FaShoppingCart className="me-2" />
                                                {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                            </button>
                                        </div>
                                        <div className="product-action-buttons">
                                            <button 
                                                className="product-action-btn" 
                                                onClick={() => openQuickView(product)}
                                                title="Xem nhanh"
                                            >
                                                <FaEye />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <ReactPaginate
                                previousLabel={<span>&laquo; Trước</span>}
                                nextLabel={<span>Sau &raquo;</span>}
                                breakLabel={<span>...</span>}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageClick}
                                containerClassName={'custom-pagination'}
                                pageClassName={'page-item'}
                                pageLinkClassName={'page-link'}
                                previousClassName={'page-item'}
                                previousLinkClassName={'page-link'}
                                nextClassName={'page-item'}
                                nextLinkClassName={'page-link'}
                                breakClassName={'page-item'}
                                breakLinkClassName={'page-link'}
                                activeClassName={'active'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal 
                show={showQuickView}
                onClose={closeQuickView}
                product={selectedProduct}
            />

            <style jsx>{`
                .custom-pagination {
                    display: flex;
                    justify-content: center;
                    list-style: none;
                    padding: 0;
                    margin: 20px 0;
                }

                .custom-pagination .page-item {
                    margin: 0 5px;
                }

                .custom-pagination .page-link {
                    color: #333;
                    padding: 8px 16px;
                    text-decoration: none;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .custom-pagination .page-link:hover {
                    background-color: #f8f9fa;
                }

                .custom-pagination .active .page-link {
                    background-color: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .product-action-buttons {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .card:hover .product-action-buttons {
                    opacity: 1;
                }

                .product-action-btn {
                    background: white;
                    border: none;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    transition: transform 0.2s ease;
                }

                .product-action-btn:hover {
                    transform: scale(1.1);
                }

                .add-to-cart-btn {
                    width: 100%;
                    padding: 8px;
                    margin-top: 10px;
                    border: none;
                    border-radius: 4px;
                    background-color: #007bff;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: background-color 0.3s ease;
                }

                .add-to-cart-btn:hover {
                    background-color: #0056b3;
                }

                .add-to-cart-btn:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .product-options {
                    font-size: 0.9rem;
                    color: #6c757d;
                }
            `}</style>
        </div>
    );
};

export default Home;
