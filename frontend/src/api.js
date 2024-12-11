import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

export const registerUser = async (userData) => {
    return await axios.post(`${API_URL}/user/register`, userData);
};

export const loginUser = async (loginData) => {
    return await axios.post(`${API_URL}/user/login`, loginData);
};
export const forgotPassword = async (email) => {
    return await axios.post(`${API_URL}/user/forgot-password-token`, { email });
};
export const resetPassword = async (resetToken, newPassword) => {
    return await axios.post(`${API_URL}/user/reset-password/${resetToken}`, { newPassword });
};
export const logout = async () => {
    return await axios.post(`${API_URL}/user/logout`, {}, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
// API cho Products
export const getAllProducts = async () => {
    return await axios.get(`${API_URL}/product`);
};
export const getProductById = async (id) => {
    return await axios.get(`${API_URL}/product/${id}`);
};

const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const createProduct = async (productData) => {
    return await axios.post(`${API_URL}/product`, productData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateProduct = async (id, productData) => {
    return await axios.put(`${API_URL}/product/${id}`, productData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteProduct = async (id) => {
    return await axios.delete(`${API_URL}/product/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
export const submitProductRating = async (data) => {
    const token = localStorage.getItem('token');
    return await axios.post(`${API_URL}/product/rating`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};


// API cho Brands
export const getAllBrands = async () => {
    return await axios.get(`${API_URL}/brand`);
};

export const createBrand = async (brandData) => {
    return await axios.post(`${API_URL}/brand`, brandData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateBrand = async (id, brandData) => {
    return await axios.put(`${API_URL}/brand/${id}`, brandData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteBrand = async (id) => {
    return await axios.delete(`${API_URL}/brand/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

// API cho Product Categories
export const getAllCategories = async () => {
    return await axios.get(`${API_URL}/product-category`);
};

export const createCategory = async (categoryData) => {
    return await axios.post(`${API_URL}/product-category`, categoryData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateCategory = async (id, categoryData) => {
    return await axios.put(`${API_URL}/product-category/${id}`, categoryData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteCategory = async (id) => {
    return await axios.delete(`${API_URL}/product-category/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

// API cho Blogs
export const getAllBlogs = async () => {
    return await axios.get(`${API_URL}/blog`);
};

export const createBlog = async (blogData) => {
    return await axios.post(`${API_URL}/blog`, blogData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateBlog = async (id, blogData) => {
    return await axios.put(`${API_URL}/blog/${id}`, blogData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteBlog = async (id) => {
    return await axios.delete(`${API_URL}/blog/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

// API cho Blog Categories
export const getAllBlogCategories = async () => {
    return await axios.get(`${API_URL}/blog-category`);
};

export const createBlogCategory = async (categoryData) => {
    return await axios.post(`${API_URL}/blog-category`, categoryData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateBlogCategory = async (id, categoryData) => {
    return await axios.put(`${API_URL}/blog-category/${id}`, categoryData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteBlogCategory = async (id) => {
    return await axios.delete(`${API_URL}/blog-category/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

// API cho Coupons
export const getAllCoupons = async () => {
    return await axios.get(`${API_URL}/coupon`);
};

export const createCoupon = async (couponData) => {
    return await axios.post(`${API_URL}/coupon`, couponData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateCoupon = async (id, couponData) => {
    return await axios.put(`${API_URL}/coupon/${id}`, couponData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteCoupon = async (id) => {
    return await axios.delete(`${API_URL}/coupon/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

// API cho Orders
export const getAllOrders = async () => {
    return await axios.get(`${API_URL}/order`);
};

export const createOrder = async (orderData) => {
    return await axios.post(`${API_URL}/order`, orderData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateOrder = async (id, orderData) => {
    return await axios.put(`${API_URL}/order/${id}`, orderData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteOrder = async (id) => {
    return await axios.delete(`${API_URL}/order/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
export const updateOrderStatus = async (id, status) => {
    return await axios.put(`${API_URL}/order/${id}/status`, { status }, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
// API cho Users
export const getAllUsers = async () => {
    return await axios.get(`${API_URL}/user/all-users`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const createUser = async (userData) => {
    return await axios.post(`${API_URL}/user`, userData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const updateUser = async (id, userData) => {
    return await axios.put(`${API_URL}/user/edit-user/${id}`, userData, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const deleteUser = async (id) => {
    return await axios.delete(`${API_URL}/user/${id}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
export const blockUser = async (id) => {
    return await axios.put(`${API_URL}/user/block-user/${id}`, {}, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const unblockUser = async (id) => {
    return await axios.put(`${API_URL}/user/unblock-user/${id}`, {}, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const resetUserPassword = async (id, password) => {
    return await axios.put(`${API_URL}/user/reset-password/${id}`, { password }, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};

export const uploadProductImage = (id, formData) => {
    return axios.put(`${API_URL}/product/upload/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
};
export const addToCart = async (productId, quantity, color) => {
    const token = getAuthToken();
    return await axios.post(`${API_URL}/user/cart`, { productId, quantity, color }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getCart = async () => {
    const token = getAuthToken();
    return await axios.get(`${API_URL}/user/cart`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const updateCartItem = async (productId, color, quantity) => {
    const token = getAuthToken();
    return await axios.put(`${API_URL}/user/cart/update-quantity`, { productId, color, quantity }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const removeFromCart = async (productId, color) => {
    const token = getAuthToken();
    return await axios.delete(`${API_URL}/user/remove-cart`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: { productId, color }
    });
};