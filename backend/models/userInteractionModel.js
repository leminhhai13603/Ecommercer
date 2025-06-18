const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    interactionType: {
        type: String,
        enum: ['view', 'cart', 'purchase', 'wishlist'],
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastInteracted: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Tạo compound index cho user và product
userInteractionSchema.index({ user: 1, product: 1 }, { unique: true });
// Index cho việc tìm kiếm tương tác gần đây
userInteractionSchema.index({ user: 1, lastInteracted: -1 });
// Index cho việc tìm kiếm theo loại tương tác
userInteractionSchema.index({ user: 1, interactionType: 1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema); 