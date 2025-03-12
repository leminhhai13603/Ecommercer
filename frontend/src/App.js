import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import ProductPage from './pages/ProductPage';
import BrandPage from './pages/BrandPage';
import ProductCategoryPage from './pages/ProductCategoryPage';
import BlogPage from './pages/BlogPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import CouponPage from './pages/CouponPage';
import UserPage from './pages/UserPage';
import OrderPage from './pages/OrderPage';
import ForgotPassword from './pages/ForgotPassword';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Đang kiểm tra đăng nhập...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Layout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            
                            {/* Private Routes */}
                            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                            <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />  
                            <Route path="/order-history" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
                            <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
  
                            {/* Admin Routes */}
                            <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                                <Route path="products" element={<ProductPage />} />
                                <Route path="brands" element={<BrandPage />} />
                                <Route path="product-categories" element={<ProductCategoryPage />} />
                                <Route path="blogs" element={<BlogPage />} />
                                <Route path="blog-categories" element={<BlogCategoryPage />} />
                                <Route path="coupons" element={<CouponPage />} />
                                <Route path="users" element={<UserPage />} />
                                <Route path="orders" element={<OrderPage />} />
                            </Route>
                        </Routes>
                    </Layout>
                </Router>
                {/* ✅ Di chuyển ToastContainer ra ngoài Router */}
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
