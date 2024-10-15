const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
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
        quantity: {
            type: Number,
            required: true
        },
        color: String,
        price: Number,
    }],
    cartTotal: Number,
    totalAfterDiscount: Number
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;