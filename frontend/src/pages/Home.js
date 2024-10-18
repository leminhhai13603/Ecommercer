import React, { useEffect, useState } from 'react';
import { getAllProducts, addToCart } from '../api';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProducts();
                setProducts(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        const quantity = 1; 
        const color = 'default'; 
        try {
            const response = await addToCart({ productId, quantity, color });
            console.log(response.data.message);
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
        }
    };

    return (
        <div className="container">
            <h1 className="my-4">Chào mừng đến với Trang Chủ</h1>
            <p>Đây là nơi bạn có thể tìm thấy thông tin mới nhất.</p>
            <div className="row">
                {products.map(product => (
                    <div key={product._id} className="col-md-4 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{product.title}</h5>
                                <p className="card-text">Giá: {product.price} VNĐ</p>
                                <button className="btn btn-primary" onClick={() => handleAddToCart(product._id)}>Thêm vào giỏ hàng</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;