import React, { useEffect, useState, useCallback, useContext } from 'react';
import { getAllProducts, addToCart } from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';

const Home = () => {
    const { isAuthenticated, user } = useContext(AuthContext); 
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [productsPerPage] = useState(15);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllProducts();
            setProducts(response.data.data || []);
        } catch (error) {
            toast.error('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = async (productId) => {
        try {
            const response = await addToCart(productId, 1, 'default');
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleSort = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(0);
    };

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const filteredAndSortedProducts = React.useMemo(() => {
        return products
            .filter(product => product.title?.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sortBy === 'price-asc') return a.price - b.price;
                if (sortBy === 'price-desc') return b.price - a.price;
                return 0;
            });
    }, [products, searchTerm, sortBy]);

    const pageCount = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
    const offset = currentPage * productsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(offset, offset + productsPerPage);

    if (!isAuthenticated || loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* Hiển thị tên người dùng nếu tồn tại */}
            <h1 className="text-center mb-5">
                {user?.lastname 
                    ? `Chào mừng, ${user.lastname}`
                    : 'Chào mừng, Khách'}
            </h1>
            <h2 className="text-center mb-5">Sản phẩm của chúng tôi</h2>
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
            <div className="row row-cols-1 row-cols-md-5 g-4">
                {currentProducts.map(product => (
                    <div key={product._id} className="col">
                        <div className="card h-100 shadow-sm">
                            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300'} className="card-img-top" alt={product.title || 'No title'} style={{ height: '200px', objectFit: 'cover' }} />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{product.title || 'No title'}</h5>
                                <p className="card-text flex-grow-1">{product.description?.substring(0, 50) || 'No description'}...</p>
                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                    <span className="h5 mb-0">{product.price?.toLocaleString() || 0} VNĐ</span>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(product._id)}>
                                        <i className="bi bi-cart-plus"></i> Thêm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ReactPaginate
                previousLabel={"← Trước"}
                nextLabel={"Sau →"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={"pagination justify-content-center mt-4"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                activeClassName={"active"}
            />
        </div>
    );
};

export default Home;
