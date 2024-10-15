import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

export const createUser = async (userData) => {
    return await axios.post(`${API_URL}/user`, userData);
};

export const loginUser = async (loginData) => {
    return await axios.post(`${API_URL}/user/login`, loginData);
};

export const getAllProducts = async () => {
    return await axios.get(`${API_URL}/product`);
};

export const addToCart = async (cartData, token) => {
    return await axios.post(`${API_URL}/cart`, cartData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
