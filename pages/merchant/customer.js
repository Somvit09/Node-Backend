const Customer = require("../../models/customer_model");
const Merchant = require("../../models/merchant_model")

//to get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
        return res.status(200).json({
            customers: customers,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

//to get a specific customer
const getSpecificCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerID: parseInt(req.params.id) })
        return res.status(200).json({
            success: true,
            customer: customer
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
}


// get all customers for a single merchant

const getAllCustomersForASpecificMerchant = async (req, res) => {
    
    try{
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
        if (!merchant){
            return res.status(404).json({
                message: "merchant not found",
                success: false
            })
        }
        allCustomers = await Customer.find({ merchantAssociatedCustomers: merchant.merchantID })
        if (!allCustomers || allCustomers.length === 0) {
            return res.status(404).json({
                allCustomers,
                success: false,
                message: " No customers found"
            })
        }
        return res.status(200).json({
            allCustomers,
            success: true,
            message: "Found customers"
        })

    } catch(err) {
        res.ststus(500).json({
            success: false,
            error: err.message
        })
    }
}


module.exports ={
    getAllCustomers,getSpecificCustomer, getAllCustomersForASpecificMerchant
}