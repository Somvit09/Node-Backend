const Merchant = require("../../models/merchant_model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()


function generateRandom16DigitNumber() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}


// Register function
const registerMerchant = async (req, res) => {
    const { merchantName, merchantType, merchantEmail,
        merchantPassword, merchantLocation, merchantPricingPlan,
        merchantColourTheme, merchantLogo, merchantFirstName, merchantLastName, merchantDesignation } = req.body;

    const merchantID = generateRandom16DigitNumber()

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
        const ifIDExisted = await Merchant.findOne({ merchantID: merchantID })
        if (ifIDExisted){
            const merchantID = generateRandom16DigitNumber()
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
            merchantLogo: merchantLogo,
            merchantFirstName: merchantFirstName,
            merchantLastName: merchantLastName,
            merchantDesignation: merchantDesignation
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

