const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchantID: Number,
    merchantName: String,
    merchantType: String,
    merchantEmail: String,
    merchantPassword: String,
    merchantLocation: String,
    merchantPricingPlan: {
        type: String,
        required: false,
        enum: ['PlanA', 'PlanB', 'PlanC'] // these are the plans and can changed as per required
    },
    merchantPricingStarted: Date,
    merchantPricingEnded: Date,
    merchantColourTheme: {
        type: String,
        required: false,
        enum: ['Red', 'Green', 'Blue'] // these are the plans and can changed as per required
    },
    merchantLogo: String, // containing the url path of the logo

});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;