import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const registerUser = (userData) => axiosInstance.post('/user/register', userData);
export const loginUser = (loginData) => axiosInstance.post('/user/login', loginData);
export const forgotPassword = (email) => axiosInstance.post('/user/forgot-password-token', { email });
export const resetPassword = (resetToken, newPassword) => axiosInstance.post(`/user/reset-password/${resetToken}`, { newPassword });
export const logout = () => axiosInstance.post('/user/logout');
export const changePassword = (data) => axiosInstance.put('/user/password', data);

// Product APIs
export const getAllProducts = () => axiosInstance.get('/product');
export const getProductById = (id) => axiosInstance.get(`/product/${id}`);
export const createProduct = (productData) => axiosInstance.post('/product', productData);
export const updateProduct = (id, productData) => axiosInstance.put(`/product/${id}`, productData);
export const deleteProduct = (id) => axiosInstance.delete(`/product/${id}`);
export const uploadProductImage = (id, formData) => axiosInstance.put(`/product/upload/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const applyProductCoupon = (productId, couponId) => axiosInstance.post(`/product/coupon/apply/${productId}`, { couponId });
export const removeProductCoupon = (productId) => axiosInstance.delete(`/product/coupon/${productId}`);

// Recommendation APIs
export const getSimilarProducts = async (productId, limit) => {
    try {
        const response = await axiosInstance.get(`/recommendations/similar/${productId}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching similar products:', error);
        // Trả về một object có cấu trúc giống với response thành công
        return { success: false, data: [], message: error.message };
    }
};

export const getPopularProducts = async (limit) => {
    try {
        const response = await axiosInstance.get(`/recommendations/popular`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular products:', error);
        throw error;
    }
};

export const getPersonalizedRecommendations = async (limit) => {
    try {
        const response = await axiosInstance.get(`/recommendations/personalized`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        throw error;
    }
};

export const recordUserInteraction = (productId, interactionType) => axiosInstance.post('/recommendations/interaction', {
    productId,
    interactionType
});

// Cart APIs
export const addToCart = (productId, count, color, size = 'Free Size') => 
    axiosInstance.post('/user/cart', { productId, count, color, size });
export const getCart = () => axiosInstance.get('/user/cart');
export const updateCartItem = (productId, color, quantity, size = 'Free Size') => 
    axiosInstance.put('/user/cart/update-quantity', { productId, color, quantity, size });
export const removeFromCart = (productId, color, size = 'Free Size') => 
    axiosInstance.delete('/user/remove-cart', { data: { productId, color, size } });

// Rating & Review APIs
export const submitProductRating = (data) => axiosInstance.post('/product/rating', data);

// Coupon APIs
export const getAllCoupons = () => axiosInstance.get('/coupon');
export const createCoupon = (couponData) => axiosInstance.post('/coupon', couponData);
export const updateCoupon = (id, couponData) => axiosInstance.put(`/coupon/${id}`, couponData);
export const deleteCoupon = (id) => axiosInstance.delete(`/coupon/${id}`);
export const applyCoupon = (couponName) => axiosInstance.post('/user/apply-coupon', { coupon: couponName });

// Order APIs
export const getAllOrders = () => axiosInstance.get('/user/get-orders');
export const getUserOrders = () => axiosInstance.get('/user/get-order');
export const createCheckoutOrder = (orderData) => axiosInstance.post('/user/create-order', orderData);
export const updateOrderStatus = (id, status) => axiosInstance.put(`/user/order/${id}/status`, status);

// Brand APIs
export const getAllBrands = () => axiosInstance.get('/brand');
export const createBrand = (brandData) => axiosInstance.post('/brand', brandData);
export const updateBrand = (id, brandData) => axiosInstance.put(`/brand/${id}`, brandData);
export const deleteBrand = (id) => axiosInstance.delete(`/brand/${id}`);

// Category APIs
export const getAllCategories = () => axiosInstance.get('/product-category');
export const createCategory = (categoryData) => axiosInstance.post('/product-category', categoryData);
export const updateCategory = (id, categoryData) => axiosInstance.put(`/product-category/${id}`, categoryData);
export const deleteCategory = (id) => axiosInstance.delete(`/product-category/${id}`);

// User Management APIs
export const getAllUsers = () => axiosInstance.get('/user/all-users');
export const getUserById = (id) => axiosInstance.get(`/user/${id}`);
export const updateUser = (id, userData) => axiosInstance.put(`/user/edit-user`, userData);
export const deleteUser = (id) => axiosInstance.delete(`/user/${id}`);
export const blockUser = (id) => axiosInstance.put(`/user/block-user/${id}`);
export const unblockUser = (id) => axiosInstance.put(`/user/unblock-user/${id}`);
export const resetUserPassword = (id, password) => axiosInstance.put(`/user/reset-password/${id}`, { password });

// Blog APIs
export const getAllBlogs = () => axiosInstance.get('/blog');
export const createBlog = (blogData) => axiosInstance.post('/blog', blogData);
export const updateBlog = (id, blogData) => axiosInstance.put(`/blog/${id}`, blogData);
export const deleteBlog = (id) => axiosInstance.delete(`/blog/${id}`);

// Blog Category APIs
export const getAllBlogCategories = () => axiosInstance.get('/blog-category');
export const createBlogCategory = (categoryData) => axiosInstance.post('/blog-category', categoryData);
export const updateBlogCategory = (id, categoryData) => axiosInstance.put(`/blog-category/${id}`, categoryData);
export const deleteBlogCategory = (id) => axiosInstance.delete(`/blog-category/${id}`);

// Chatbot APIs
export const sendChatbotQuery = (query, sessionId = 'default') => 
    axiosInstance.post('/chatbot/query', { query, sessionId });
export const getChatbotSuggestions = () => axiosInstance.get('/chatbot/suggest');
export const clearChatbotCache = () => axiosInstance.delete('/chatbot/cache');
export const getChatbotHistory = (sessionId = 'default') => 
    axiosInstance.get(`/chatbot/history/${sessionId}`);
export const clearChatbotHistory = (sessionId = 'default') => 
    axiosInstance.delete(`/chatbot/history/${sessionId}`);

// Lấy sản phẩm đang giảm giá
export const getDiscountedProducts = async (limit) => {
    try {
        const response = await axiosInstance.get(`/recommendations/products/discounted`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching discounted products:', error);
        throw error;
    }
};