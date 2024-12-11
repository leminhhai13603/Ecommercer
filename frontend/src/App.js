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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';

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
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            {/* Private Routes */}
                            <Route 
                                path="/" 
                                element={
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                } 
                            />
                            <Route 
                                path="/cart" 
                                element={
                                    <PrivateRoute>
                                        <CartPage />
                                    </PrivateRoute>
                                } 
                            />

                            {/* Admin Routes */}
                            <Route 
                                path="/admin" 
                                element={
                                    <PrivateRoute>
                                        <AdminLayout />
                                    </PrivateRoute>
                                }
                            >
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
                    <ToastContainer />
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
