import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="app-container d-flex flex-column min-vh-100">
            <Header />
            <main className="main-content flex-grow-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
