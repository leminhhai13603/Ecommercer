const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    brand: {
        type: String,
        enum: ['Apple', 'Samsung', 'Lenovo', 'Asus', 'HP', 'Dell', 'Microsoft', 'Razer', 'Logitech', 'Acer', 'Nvidia', 'AMD', 'Intel', 'Kingston', 'Seagate', 'Western Digital', 'Corsair', 'G.Skill', 'Samsung', 'Apple', 'Microsoft', 'Logitech', 'Razer', 'Acer', 'Nvidia', 'AMD', 'Intel', 'Kingston', 'Seagate', 'Western Digital', 'Corsair', 'G.Skill', 'MSI'],
    },
    quantity: {
        type: Number,
        required: true,
    },
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array,
    },
    color: {
        type: String,
        required: true,
    },
    ratings: [
        {
            star: Number,
            comment: String,
            postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        }
    ],
    totalrating: {
        type: String,
        default: 0,
    }
    
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);