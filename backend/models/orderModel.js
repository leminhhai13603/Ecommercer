const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: Number,
        color: String
    }],
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        id: {
            type: String,
            required: true
        },
        status: {               
            type: String,
            required: true
        }
    },
    paidAt: {
        type: Date,
        required: true
    },
    orderStatus: {
        type: String,
        default: "Đang xử lý",
        enum: ['Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy']
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true }); 

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
                            
