import React, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';  
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import BrandPage from './pages/BrandPage';
import ProductCategoryPage from './pages/ProductCategoryPage';
import BlogPage from './pages/BlogPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import CouponPage from './pages/CouponPage';
import UserPage from './pages/UserPage';
import OrderPage from './pages/OrderPage';
import ForgotPassword from './pages/ForgotPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import CartPage from './pages/CartPage';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
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
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route 
                                path="/" 
                                element={
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                } 
                            />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/admin/products" element={<ProductPage />} />
                            <Route path="/admin/brands" element={<BrandPage />} />
                            <Route path="/admin/product-categories" element={<ProductCategoryPage />} />
                            <Route path="/admin/blogs" element={<BlogPage />} />
                            <Route path="/admin/blog-categories" element={<BlogCategoryPage />} />
                            <Route path="/admin/coupons" element={<CouponPage />} />
                            <Route path="/admin/users" element={<UserPage />} />
                            <Route path="/admin/orders" element={<OrderPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                        </Routes>
                    </Layout>
                    <ToastContainer />
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
