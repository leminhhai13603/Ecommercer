import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllCategories, getAllBrands, uploadProductImage, getAllCoupons, applyProductCoupon, removeProductCoupon } from '../api';
import { toast } from 'react-toastify';

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
        size: ['Free Size'],
        gender: 'Unisex',
        images: []
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [pastedImages, setPastedImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 7;
    const [searchQuery, setSearchQuery] = useState('');
    
    // Danh sách size có sẵn
    const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
    
    // State để lưu các màu sắc khi người dùng thêm nhiều màu
    const [colorInput, setColorInput] = useState('');
    const [colorList, setColorList] = useState([]);

    const imageInputRef = useRef(null);
    const pasteDivRef = useRef(null);

    const [coupons, setCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [selectedProductForCoupon, setSelectedProductForCoupon] = useState(null);
    const [selectedCouponId, setSelectedCouponId] = useState('');

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

    const fetchCoupons = useCallback(async () => {
        try {
            const response = await getAllCoupons();
            setCoupons(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
        fetchCoupons();
    }, [fetchProducts, fetchCategories, fetchBrands, fetchCoupons]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };
    
    // Xử lý thêm màu vào danh sách
    const handleAddColor = () => {
        if (colorInput.trim()) {
            const newColors = [...colorList, colorInput.trim()];
            setColorList(newColors);
            setFormData(prevData => ({ 
                ...prevData, 
                color: newColors.join(', ') 
            }));
            setColorInput('');
        }
    };
    
    // Xóa màu khỏi danh sách
    const handleRemoveColor = (colorToRemove) => {
        const updatedColors = colorList.filter(color => color !== colorToRemove);
        setColorList(updatedColors);
        setFormData(prevData => ({ 
            ...prevData, 
            color: updatedColors.join(', ') 
        }));
    };
    
    // Xử lý chọn nhiều size
    const handleSizeToggle = (size) => {
        const currentSizes = Array.isArray(formData.size) ? formData.size : [formData.size];
        
        if (currentSizes.includes(size)) {
            // Nếu đã có size này rồi thì xóa đi (trừ khi đây là size cuối cùng)
            if (currentSizes.length > 1) {
                const updatedSizes = currentSizes.filter(s => s !== size);
                setFormData(prevData => ({ ...prevData, size: updatedSizes }));
            }
        } else {
            // Nếu chưa có size này thì thêm vào
            const updatedSizes = [...currentSizes, size];
            setFormData(prevData => ({ ...prevData, size: updatedSizes }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prevFiles => [...prevFiles, ...files]);
            
            // Tạo preview cho các file mới
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewImages(prev => [...prev, {
                        url: e.target.result,
                        file: file,
                        name: file.name
                    }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    // Hàm xử lý sự kiện paste
    const handlePaste = (e) => {
        // Chỉ xử lý paste nếu đang focus vào vùng paste ảnh hoặc đang ở trong form
        const isInputElement = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        
        // Nếu đang focus vào input hoặc textarea thì không xử lý paste ảnh
        if (isInputElement) {
            return;
        }
        
        if (e.clipboardData) {
            const items = e.clipboardData.items;
            let hasImage = false;
            let imageFile = null;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    hasImage = true;
                    imageFile = items[i].getAsFile();
                    break;
                }
            }
            
            // Chỉ chặn sự kiện mặc định nếu là paste ảnh
            if (hasImage) {
                e.preventDefault();
                
                // Tạo tên file ngẫu nhiên
                const timestamp = new Date().getTime();
                const randomString = Math.random().toString(36).substring(2, 8);
                const fileName = `pasted_image_${timestamp}_${randomString}.png`;
                
                // Tạo file mới với tên đã đặt
                const renamedFile = new File([imageFile], fileName, { type: imageFile.type });
                
                setSelectedFiles(prevFiles => [...prevFiles, renamedFile]);
                setPastedImages(prev => [...prev, renamedFile]);
                
                // Tạo preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewImages(prev => [...prev, {
                        url: e.target.result,
                        file: renamedFile,
                        name: fileName
                    }]);
                };
                reader.readAsDataURL(renamedFile);
                
                // Hiển thị thông báo
                toast.success('Đã dán ảnh thành công');
            }
        }
    };
    
    // Focus vào div paste khi click
    const focusPasteArea = () => {
        if (pasteDivRef.current) {
            pasteDivRef.current.focus();
        }
    };
    
    // Xóa một ảnh preview
    const removePreviewImage = (index) => {
        const imageToRemove = previewImages[index];
        setPreviewImages(previewImages.filter((_, i) => i !== index));
        setSelectedFiles(selectedFiles.filter(file => 
            file.name !== imageToRemove.name || 
            file.lastModified !== imageToRemove.file.lastModified
        ));
    };

    useEffect(() => {
        // Reset state khi bắt đầu chỉnh sửa hoặc tạo mới
        if (!editingProductId) {
            setPreviewImages([]);
            setPastedImages([]);
            setSelectedFiles([]);
        }
    }, [editingProductId, showForm]);

    // Add paste event listener to document
    useEffect(() => {
        // Chỉ sử dụng một event listener ở cấp document
        if (showForm) {
            document.addEventListener('paste', handlePaste);
        }
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [showForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            let productData = { ...formData };
            
            // Chuyển đổi mảng size thành chuỗi nếu chỉ có một phần tử
            if (Array.isArray(productData.size) && productData.size.length === 1) {
                productData.size = productData.size[0];
            }
            
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
                size: ['Free Size'],
                gender: 'Unisex',
                images: []
            });
            setColorList([]);
            setEditingProductId(null);
            setSelectedFiles([]);
            setPreviewImages([]);
            setPastedImages([]);
            setShowForm(false);
            await fetchProducts();
        } catch (error) {
            setError('Có lỗi xảy ra khi thêm/sửa sản phẩm. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product) => {
        // Xử lý màu sắc từ chuỗi thành mảng để hiển thị
        const colorArray = product.color ? 
            product.color.split(',').map(c => c.trim()) : [];
        
        // Xử lý size từ chuỗi hoặc mảng
        let sizeArray = [];
        if (typeof product.size === 'string') {
            sizeArray = [product.size];
        } else if (Array.isArray(product.size)) {
            sizeArray = product.size;
        } else {
            sizeArray = ['Free Size'];
        }

        setFormData({
            title: product.title || '',
            price: product.price || '',
            description: product.description || '',
            category: product.category || '',
            brand: product.brand || '',
            quantity: product.quantity || '',
            color: product.color || '',
            size: sizeArray,
            gender: product.gender || 'Unisex',
            images: product.images || []
        });
        
        setColorList(colorArray);
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

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    };

    // Cập nhật hàm lọc sản phẩm để chỉ tìm kiếm theo tên
    const filteredProducts = products.filter(product => {
        if (!searchQuery.trim()) return true; // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
        
        const searchTerm = searchQuery.toLowerCase();
        
        // Chỉ tìm kiếm theo tên sản phẩm
        return product.title?.toLowerCase().includes(searchTerm) || false;
    });
    
    // Thay đổi cách tính toán phân trang để sử dụng sản phẩm đã lọc
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handlePrevPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    const handleNextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(filteredProducts.length / productsPerPage)));

    // Hiển thị màu sắc và size dưới dạng chuỗi để hiển thị trong bảng
    const displayColors = (colors) => {
        if (!colors) return 'Không có';
        return colors;
    };

    const displaySizes = (sizes) => {
        if (!sizes) return 'Free Size';
        if (Array.isArray(sizes)) return sizes.join(', ');
        return sizes;
    };

    // Hiển thị modal áp dụng mã giảm giá
    const openCouponModal = (product) => {
        setSelectedProductForCoupon(product);
        setSelectedCouponId(product.coupon || '');
        setShowCouponModal(true);
    };

    // Đóng modal mã giảm giá
    const closeCouponModal = () => {
        setShowCouponModal(false);
        setSelectedProductForCoupon(null);
        setSelectedCouponId('');
    };

    // Xử lý khi chọn mã giảm giá
    const handleCouponChange = (e) => {
        setSelectedCouponId(e.target.value);
    };

    // Áp dụng mã giảm giá cho sản phẩm
    const handleApplyCoupon = async () => {
        try {
            if (!selectedProductForCoupon) return;
            
            if (!selectedCouponId) {
                // Nếu không chọn mã giảm giá, thì xóa mã giảm giá hiện có
                await removeProductCoupon(selectedProductForCoupon._id);
                toast.success('Đã xóa mã giảm giá khỏi sản phẩm');
            } else {
                // Áp dụng mã giảm giá mới
                await applyProductCoupon(selectedProductForCoupon._id, selectedCouponId);
                toast.success('Đã áp dụng mã giảm giá cho sản phẩm');
            }
            
            // Cập nhật lại danh sách sản phẩm
            fetchProducts();
            closeCouponModal();
        } catch (error) {
            console.error('Lỗi khi áp dụng mã giảm giá:', error);
            toast.error('Không thể áp dụng mã giảm giá. Vui lòng thử lại.');
        }
    };
    
    // Hiển thị thông tin mã giảm giá của sản phẩm
    const displayCoupon = (product) => {
        if (!product.coupon) return 'Không có';
        
        // Nếu coupon đã được populate thành object
        if (typeof product.coupon === 'object') {
            return `${product.coupon.name} (${product.coupon.discount}%)`;
        }
        
        // Nếu coupon là id, tìm trong danh sách coupons
        const coupon = coupons.find(c => c._id === product.coupon);
        if (!coupon) return 'Không xác định';
        
        return `${coupon.name} (${coupon.discount}%)`;
    };

    // Sửa hàm để xác định chính xác category và brand
    const getCategoryName = (product) => {
        if (!product.category) return 'Không có';
        
        // Nếu category là object đã được populate
        if (typeof product.category === 'object' && product.category !== null) {
            return product.category.title || 'Không xác định';
        }
        
        // Nếu category là id, tìm trong danh sách categories
        const category = categories.find(c => {
            // So sánh string để đảm bảo đúng kiểu dữ liệu
            return c._id.toString() === product.category.toString();
        });
        
        return category ? category.title : 'Không xác định';
    };
    
    const getBrandName = (product) => {
        if (!product.brand) return 'Không có';
        
        // Nếu brand là object đã được populate
        if (typeof product.brand === 'object' && product.brand !== null) {
            return product.brand.title || 'Không xác định';
        }
        
        // Nếu brand là id, tìm trong danh sách brands
        const brand = brands.find(b => {
            // So sánh string để đảm bảo đúng kiểu dữ liệu
            return b._id.toString() === product.brand.toString();
        });
        
        return brand ? brand.title : 'Không xác định';
    };

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

            {/* Thêm thanh tìm kiếm */}
            <div className="mb-4">
                <div className="input-group">
                    <span className="input-group-text">
                        ⌕
                    </span>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Tìm kiếm theo tên sản phẩm..." 
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {searchQuery && (
                        <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => setSearchQuery('')}
                        >
                            &times;
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <div className="mt-2">
                        <small className="text-muted">
                            Tìm thấy {filteredProducts.length} sản phẩm có tên phù hợp với "{searchQuery}"
                        </small>
                    </div>
                )}
            </div>

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
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control" placeholder="Số lượng" required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                                        <option value="Unisex">Unisex</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Phần thêm nhiều màu */}
                            <div className="mb-3">
                                <label className="form-label">Màu sắc (thêm nhiều màu)</label>
                                <div className="input-group mb-2">
                                    <input 
                                        type="text" 
                                        value={colorInput} 
                                        onChange={(e) => setColorInput(e.target.value)} 
                                        className="form-control" 
                                        placeholder="Nhập màu sắc" 
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-primary" 
                                        onClick={handleAddColor}
                                    >
                                        Thêm màu
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {colorList.map((color, index) => (
                                        <div key={index} className="badge bg-primary d-flex align-items-center p-2">
                                            {color}
                                            <button 
                                                type="button" 
                                                className="btn-close btn-close-white ms-2" 
                                                style={{ fontSize: '0.65rem' }} 
                                                onClick={() => handleRemoveColor(color)}
                                            ></button>
                                        </div>
                                    ))}
                                </div>
                                {colorList.length === 0 && (
                                    <small className="text-muted">Chưa có màu nào được thêm</small>
                                )}
                            </div>
                            
                            {/* Phần chọn nhiều size */}
                            <div className="mb-3">
                                <label className="form-label">Kích thước (chọn nhiều size)</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {availableSizes.map((size, index) => {
                                        const isSelected = Array.isArray(formData.size) 
                                            ? formData.size.includes(size) 
                                            : formData.size === size;
                                        
                                        return (
                                            <button 
                                                key={index}
                                                type="button"
                                                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => handleSizeToggle(size)}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                                <small className="text-muted">Size đã chọn: {displaySizes(formData.size)}</small>
                            </div>
                            
                            {/* Phần upload và paste ảnh */}
                            <div className="mb-3">
                                <label className="form-label">Hình ảnh sản phẩm</label>
                                <div className="d-flex flex-column gap-2">
                                    <input 
                                        type="file" 
                                        multiple 
                                        onChange={handleFileChange} 
                                        className="form-control"
                                        ref={imageInputRef}
                                    />
                                    
                                    <div 
                                        ref={pasteDivRef}
                                        onClick={focusPasteArea}
                                        // Bỏ event onPaste ở đây để tránh xử lý trùng lặp
                                        className="form-control text-center p-3 mt-2 border border-dashed"
                                        style={{ 
                                            minHeight: '100px', 
                                            cursor: 'pointer',
                                            borderStyle: 'dashed'
                                        }}
                                        tabIndex="0"
                                    >
                                        <p className="mb-0 text-muted">Click vào đây và paste (Ctrl+V) để dán ảnh từ clipboard</p>
                                        <small className="text-muted d-block mt-1">hoặc paste ở bất kỳ đâu trên trang</small>
                                    </div>
                                </div>
                            </div>

                            {/* Hiển thị preview ảnh mới */}
                            {previewImages.length > 0 && (
                                <div className="mb-3">
                                    <p>Ảnh đã chọn:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {previewImages.map((image, index) => (
                                            <div key={index} className="position-relative" style={{ width: '100px' }}>
                                                <img 
                                                    src={image.url} 
                                                    alt={`Preview ${index}`} 
                                                    style={{
                                                        width: '100px', 
                                                        height: '100px', 
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }} 
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                    style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem' }}
                                                    onClick={() => removePreviewImage(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Hiển thị ảnh hiện tại của sản phẩm khi đang chỉnh sửa */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="mb-3">
                                    <p>Ảnh hiện tại của sản phẩm:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {formData.images.map((image, index) => (
                                            <img 
                                                key={index} 
                                                src={image.url} 
                                                alt={`Product ${index + 1}`} 
                                                style={{
                                                    width: '100px', 
                                                    height: '100px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }} 
                                            />
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
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Danh mục</th>
                                    <th>Thương hiệu</th>
                                    <th>Số lượng</th>
                                    <th>Mã giảm giá</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map(product => {
                                    // Sử dụng các hàm mới để xác định tên danh mục và thương hiệu
                                    const categoryName = getCategoryName(product);
                                    const brandName = getBrandName(product);
                                    
                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                <img 
                                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                                                    alt={product.title} 
                                                    className="img-thumbnail"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>{product.title}</td>
                                            <td>{product.price?.toLocaleString()} VNĐ</td>
                                            <td>{categoryName}</td>
                                            <td>{brandName}</td>
                                            <td>{product.quantity}</td>
                                            <td>{displayCoupon(product)}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm me-2"
                                                        onClick={() => handleDelete(product._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => openCouponModal(product)}
                                                    >
                                                        Mã giảm giá
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                            {[...Array(Math.ceil(filteredProducts.length / productsPerPage))].map((_, index) => (
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
                            disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                        >
                            Trang sau
                        </button>
                    </div>
                </>
            )}

            {/* Modal áp dụng mã giảm giá */}
            {showCouponModal && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Áp dụng mã giảm giá</h5>
                                <button type="button" className="btn-close" onClick={closeCouponModal}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Sản phẩm:</strong> {selectedProductForCoupon?.title}</p>
                                <p><strong>Giá hiện tại:</strong> {selectedProductForCoupon?.price?.toLocaleString()} VNĐ</p>
                                
                                <div className="form-group mb-3">
                                    <label htmlFor="couponSelect" className="form-label">Chọn mã giảm giá:</label>
                                    <select 
                                        id="couponSelect"
                                        className="form-select"
                                        value={selectedCouponId}
                                        onChange={handleCouponChange}
                                    >
                                        <option value="">-- Không áp dụng --</option>
                                        {coupons.map(coupon => (
                                            <option key={coupon._id} value={coupon._id}>
                                                {coupon.name} - Giảm {coupon.discount}% (Hết hạn: {new Date(coupon.expiry).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {selectedCouponId && (
                                    <div className="alert alert-info">
                                        <p className="mb-0">
                                            <strong>Giá sau khi áp dụng:</strong> {' '}
                                            {(() => {
                                                const coupon = coupons.find(c => c._id === selectedCouponId);
                                                if (!coupon || !selectedProductForCoupon?.price) return 'Không xác định';
                                                
                                                const discountAmount = (selectedProductForCoupon.price * coupon.discount) / 100;
                                                const finalPrice = selectedProductForCoupon.price - discountAmount;
                                                return `${finalPrice.toLocaleString()} VNĐ (Giảm ${discountAmount.toLocaleString()} VNĐ)`;
                                            })()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeCouponModal}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleApplyCoupon}>
                                    {selectedCouponId ? 'Áp dụng' : 'Xóa mã giảm giá'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
