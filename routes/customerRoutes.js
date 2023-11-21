require('dotenv').config(); 
const jwt = require("jsonwebtoken")
const express = require("express")
const { loginCustomer, verifyOTP, addDetails, resendOTP } = require("../pages/customer/customerLogin")

const customerRouter = express.Router()

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
customerRouter.post('/protected_route', authenticationToken, (req, res) => {
    const customerID = req.user.customerId
    res.status(200).json({message: customerID})
})

// login customer
customerRouter.post('/login', loginCustomer)

// verify otp
customerRouter.post('/verify-otp', verifyOTP)

// add details for new customer
customerRouter.post('/add-details', addDetails)

// resend otp
customerRouter.post('/resend-otp', resendOTP)

module.exports = customerRouter