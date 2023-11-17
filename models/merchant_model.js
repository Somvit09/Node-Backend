const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchantID: {
        type: String,
        required: true,
        unique: true
    },
    merchantName: String,
    merchantType: String,
    merchantEmail: String,
    merchantPassword: String,
    merchantLocation: String,
    merchantDesignation: String,
    merchantActive: {
        type: String,
        default: 'inactive',
        enum: ['active', 'inactive'],
        required: true
    },
    merchantPricingPlan: {
        type: String,
        required: false,
        enum: ['Yearly', 'Monthly', 'Quarterly'] // these are the plans and can changed as per required
    },
    merchantPricingStarted: String,// need to think about this
    merchantPricingEnded: String,
    merchantColourTheme: {
        type: String,
        required: false,
        enum: ['Red', 'Green', 'Blue'] // these are the plans and can changed as per required
    },
    merchantLogo: String, // containing the url path of the logo
    merchantAssociatedApparels: [String],
    merchantAssociatedCustomers: [String]
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;