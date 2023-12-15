const Merchant = require('../../models/merchant_model')

const creteMerchantTheme = async (req, res) =>  {
    try {
        const { colorCode } = req.body
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
        if (!merchant) {
            return res.status(404).json({
                message: "Merchant not found."
            })
        }
        merchant.merchantColourTheme = colorCode
        await merchant.save()
        res.status(200).json({
            success: true,
            message: "colorcode updated.",
            merchant
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

module.exports = creteMerchantTheme