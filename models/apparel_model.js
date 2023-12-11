const mongoose = require('mongoose');

const apparalSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    aaprelIDBySystem: {
        type: String,
        required: true,
        unique: true
    },
    apparelName: String,
    apparelType: String,
    apparelTryOnStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    imageUrl: String, // uploading images and store the path
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    apparelAssociatedMerchant: String
});

const Apparel = mongoose.model('Apparel', apparalSchema);

module.exports = Apparel;