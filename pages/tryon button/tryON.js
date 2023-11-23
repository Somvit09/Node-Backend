const Merchant = require("../../models/merchant_model")

const tryON = async (req, res) => {
    const merchantID = req.query.merchanID
    const apparelID = req.query.apparelID
    try {
        const merchantExists = await Merchant.findOne({ merchantID: merchantID })
        if (!merchantExists) {
            return res.status(404).json({
                success: false,
                message: "Merchant doesnot exists.",
                redirectURL: "need to think about"
            })
        }
        const apparelExists = merchantExists.merchantAssociatedApparels.includes(apparelID)
        if (!apparelExists) {
            return res.status(404).json({
                success: false,
                message: `Apparel with id ${apparelID} with merchant id ${merchantID} doesnot exist.`,
                redirectURL: "need to think about it."
            })
        }
        res.status(200).json({
            success: true,
            message: `Apparel id ${apparelID} found associated with merchant id ${merchantID} found. Redirecting to the login.`,
            redirectURL: `/signup?merchanID=${merchantID}&apparelID=${apparelID}`
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


module.exports = tryON