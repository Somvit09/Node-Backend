const Merchant = require("../../models/merchant_model")
const bcrypt = require("bcrypt")

// get 16 digit random number
function generateRandom16DigitNumber() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

// get all merchant with their details
const getAllMerchants = async (req, res) => {
    try {
        const merchants = await Merchant.find().select('-_id -merchantPassword -__v')
        return res.status(200).json({
            merchants: merchants
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
    const { name, type, email, password, location, theme, imagePath } = req.body;
    const merchantId = generateRandom16DigitNumber()
    const existingMerchantId = Merchant.findOne({ merchantID: merchantId })
    try {
        // Check if the user already exists
        const existingMerchant = await Merchant.findOne({
            merchantEmail: email,
            merchantName: name,
        });
        if (existingMerchantId) {
            const merchantId = generateRandom16DigitNumber()
        }

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
            merchantID: merchantId,
            merchantType: type,
            merchantName: name,
            merchantPassword: hashedPassword,
            merchantLocation: location,
            merchantColourTheme: theme,
            merchantLogo: imagePath
        });
        newMerchant.save()
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

const merchantEdit = async (req, res) => {
    const { name, type, email, newPassword, location, plan, theme, imagePath } = req.body
    try {

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await Merchant.findOneAndUpdate({ merchantID: req.params.id }, {
            merchantName: name,
            merchantType: type,
            merchantEmail: email,
            merchantColourTheme: theme,
            merchantLogo: imagePath,
            merchantLocation: location,
            merchantPricingPlan: plan,
            merchantPassword: hashedPassword
        }, { new: true })

        res.status(200).json({
            success: true,
            message: `Merchant updated id - ${id}`,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const planCreation = async (req, res) => {
    const { plan, date } = req.body
    // assuming the date in the format 'dd.mm.yyyy' like '12.05.2023'
    const dateParts = date.split('.')
    const planStarts = new Date()

    planStarts.setFullYear(dateParts[2])
    planStarts.setMonth(dateParts[1] - 1)
    planStarts.setDate(dateParts[0])
    planStarts.setHours(0, 0, 0, 0); // Set time to midnight

    // Set the time to reflect IST (UTC+5:30)
    planStarts.setHours(planStarts.getHours() + 5)
    planStarts.setMinutes(planStarts.getMinutes() + 30)

    const planEnds = new Date(planStarts)
    try {
        if (plan === "Yearly") {
            planEnds.setFullYear(planEnds.getFullYear() + 1)
        } else if (plan === "Monthly") {
            planEnds.setMonth(planEnds.getMonth() + 1)
        } else if (plan === "Quarterly") {
            planEnds.setMonth(planEnds.getMonth() + 3)
        }

        // Extract only the date portion
        const planStartsDateOnly = planStarts.toISOString().split('T')[0];
        const planEndsDateOnly = planEnds.toISOString().split('T')[0];

        const updatedMerchant = await Merchant.findOneAndUpdate({merchantID: req.params.id}, {
            merchantPricingPlan: plan,
            merchantPricingStarted: planStartsDateOnly,
            merchantPricingEnded: planEndsDateOnly,
            merchantActive: 'active'
        }, {new:true})
        console.log(planStartsDateOnly)
        console.log(planEndsDateOnly)
        res.status(200).json({
            success: true,
            merchant: updatedMerchant
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}


module.exports = {
    getAllMerchants, getAMerchantBySpecificID, merchantCreation, merchantEdit, planCreation
}


