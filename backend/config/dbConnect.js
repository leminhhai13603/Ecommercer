const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ Database connected successfully to:', conn.connection.host);
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            setTimeout(dbConnect, 5000);
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        setTimeout(dbConnect, 5000);
    }
};

module.exports = dbConnect;