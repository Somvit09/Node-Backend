const Merchant = require("../../models/merchant_model")
const bcrypt = require("bcrypt")

// get all merchant with their details
const getAllMerchants = async (req, res) => {
    try {
        const merchants = await Merchant.find().select('-_id -merchantPassword -__v')
        return res.status(200).json({
            merchants: merchants,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false
        })
    }
}

// get a merchant by specific id
const getAMerchantBySpecificID = async (req, res) => {
    try {
        const merchant = await Merchant.findOne({ merchantID: req.params.id }).select('-merchantPassword -__v -_id') // using merchantID for fetching a single merchant information
        if (!merchant) {
            return res.status(404).json({
                message: "Merchant not found.",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            merchant: merchant
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
}

const merchantCreation = async (req, res) => {
    const { id, name, type, email, password, location, plan, theme, imagePath } = req.body;
    try {
        // Check if the user already exists
        const existingMerchant = await Merchant.findOne({
            merchantEmail: email,
            merchantName: name,
        });

        if (existingMerchant) {
            return res.status(409).json({
                message: "Merchant already exists",
                redirectURL: '/admin',
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with hashed password
        const newMerchant = await Merchant.create({
            merchantEmail: email,
            merchantID: id,
            merchantType: type,
            merchantName: name,
            merchantPassword: hashedPassword,
            merchantLocation: location,
            merchantPricingPlan: plan,
            merchantPricingStarted: Date.now(),
            merchantPricingEnded: Date.now(),
            merchantColourTheme: theme,
            merchantLogo: imagePath
        });
        return res.status(201).json({
            success: true,
            message: `Merchant created id: ${newMerchant.merchantID}`,
            merchant: newMerchant
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
}

module.exports = {
    getAllMerchants, getAMerchantBySpecificID, merchantCreation
}