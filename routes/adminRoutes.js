require('dotenv').config(); 
const jwt = require("jsonwebtoken")
const express = require("express")
const {
    getAllMerchants, getAMerchantBySpecificID, merchantCreation, merchantEdit
} = require("../pages/admin/merchant")


const adminRouter = express.Router()

// for protected  or authenticated routes
function authenticationToken(req, res, next) {
    const token = req.header("Authorization")
    if (!token) {
        return res.status(400).json({
            error: "Unauthorized"
        })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({error: "Token is not valid"})
        }
        req.user = decoded
        console.log(req.user)
        next()
    })
}

// authentication required for this route using authenticationToken middleware, using for testing
adminRouter.post('/protected_route', authenticationToken, (req, res) => {
    const customerID = req.user.customerId
    res.status(200).json({message: customerID})
})

// get all merchants
adminRouter.get('/merchants', getAllMerchants)

// get a merchant by merchantID
adminRouter.get('/merchant/:id', getAMerchantBySpecificID)

// create a merchant
adminRouter.post('/merchant/create', merchantCreation)

// merchant profile update
adminRouter.post('/merchant/edit/:id', merchantEdit)



module.exports = adminRouter