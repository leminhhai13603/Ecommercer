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
        ref: 'ProdCategory',
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
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
        required: false,
    },
    size: {
        type: mongoose.Schema.Types.Mixed,
        validate: {
            validator: function(value) {
                if (typeof value === 'string') {
                    return ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].includes(value);
                }
                if (Array.isArray(value)) {
                    return value.every(size => 
                        ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].includes(size)
                    );
                }
                return false;
            },
            message: 'Size không hợp lệ! Các giá trị cho phép: S, M, L, XL, XXL, Free Size'
        },
        default: 'Free Size',
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Unisex'],
        default: 'Unisex',
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
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    viewCount: {
        type: Number,
        default: 0
    },
    similarProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    tags: [{
        type: String
    }]
}, {timestamps: true});

productSchema.index({ style: 1, season: 1, material: 1, gender: 1, category: 1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);