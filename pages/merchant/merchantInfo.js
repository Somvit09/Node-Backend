const Merchant = require('../../models/merchant_model')

const getAMerchantBySpecificID = async (req, res) => {
    try {
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID }) // using merchantID for fetching a single merchant information
        if (!merchant) {
            return res.status(404).json({
                message: "Merchant not found.",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            merchant: await Merchant.findOne({ merchantID: req.user.merchantID}).select('-merchantPassword -__v -_id')
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
}

module.exports = getAMerchantBySpecificID