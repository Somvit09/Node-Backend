const express = require("express")
const {
    getAllMerchants, getAMerchantBySpecificID, merchantCreation
} = require("../pages/admin/merchant")


const adminRouter = express.Router()

// get all merchants
adminRouter.get('/merchants', getAllMerchants)

// get a merchant by merchantID
adminRouter.get('/merchant/:id', getAMerchantBySpecificID)

// create a merchant
adminRouter.post('/merchant/create', merchantCreation)



module.exports = adminRouter