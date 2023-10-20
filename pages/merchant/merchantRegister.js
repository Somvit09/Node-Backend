const Merchant = require("../../models/merchant_model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()

// Register function
const registerMerchant = async (req, res) => {
    const { merchantID, merchantName, merchantType, merchantEmail,
        merchantPassword, merchantLocation, merchantPricingPlan,
        merchantColourTheme, merchantLogo } = req.body;

    try {
        // Check if the user already exists
        const existingMerchant = await Merchant.findOne({
            merchantEmail: merchantEmail,
            merchantName: merchantName,
        });

        if (existingMerchant) {
            return res.status(409).json({
                message: "Merchant already exists",
                redirectURL: '/admin',
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(merchantPassword, salt);

        // Create a new user with hashed password
        const newMerchant = await Merchant.create({
            merchantEmail: merchantEmail,
            merchantID: merchantID,
            merchantType: merchantType,
            merchantName: merchantName,
            merchantPassword: hashedPassword,
            merchantLocation: merchantLocation,
            merchantPricingPlan: merchantPricingPlan,
            merchantColourTheme: merchantColourTheme,
            merchantLogo: merchantLogo
        });

        // Create and sign a JWT token for the newly registered user
        const token = jwt.sign({ merchantID: newMerchant.merchantID }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });

        res.status(201).json({
            newMerchant,
            message: `Merchant registration successfull.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/admin`,
        });
    } catch (error) {
        res.status(500).json({
            error: `Failed to register Merchant. ${error.message}`,
            redirectURL: `/register?email=${email}&type=${type}&id=${id}&name=${name}`
        });
    }
}

module.exports = { registerMerchant }

