import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import BrandPage from './pages/BrandPage';
import ProductCategoryPage from './pages/ProductCategoryPage';
import BlogPage from './pages/BlogPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import CouponPage from './pages/CouponPage';
import UserPage from './pages/UserPage';
import OrderPage from './pages/OrderPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />}></Route>
                    <Route path="/admin" element={<Admin />}></Route>
                    <Route path="/admin/products" element={<ProductPage />}></Route>
                    <Route path="/admin/brands" element={<BrandPage />}></Route>
                    <Route path="/admin/product-categories" element={<ProductCategoryPage />}></Route>
                    <Route path="/admin/blogs" element={<BlogPage />}></Route>
                    <Route path="/admin/blog-categories" element={<BlogCategoryPage />}></Route>
                    <Route path="/admin/coupons" element={<CouponPage />}></Route>
                    <Route path="/admin/users" element={<UserPage />}></Route>
<Route path="/admin/orders" element={<OrderPage />}></Route>
                    <Route path="/about" element={<About />}></Route>
                    <Route path="/contact" element={<Contact />}></Route>
                    <Route path="/privacy" element={<Privacy />}></Route>
                    <Route path="/login" element={<Login />}></Route>
                </Route>                
            </Routes>
        </BrowserRouter>
    );
}

export default App;