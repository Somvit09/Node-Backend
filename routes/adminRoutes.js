require('dotenv').config(); 
const jwt = require("jsonwebtoken")
const express = require("express")
const {
    getAllMerchants, getAMerchantBySpecificID, merchantCreation, merchantEdit, planCreation
} = require("../pages/admin/merchant")
const adminRegister = require('../pages/admin/adminRegister')
const adminLogin = require('../pages/admin/adminLogin')



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


// login
adminRouter.post('/login', adminLogin)

// register
adminRouter.post('/register/secureway/appliedOnlyForAdmin', adminRegister)

// get all merchants
adminRouter.get('/merchants', authenticationToken, getAllMerchants)

// get a merchant by merchantID
adminRouter.get('/merchant/:id', authenticationToken, getAMerchantBySpecificID)

// create a merchant
adminRouter.post('/merchant/create', authenticationToken, merchantCreation)

// merchant profile update
adminRouter.post('/merchant/edit/:id', authenticationToken, merchantEdit)

// plan creation
adminRouter.post('/merchant/plan-create/:id', authenticationToken, planCreation)



module.exports = adminRouter