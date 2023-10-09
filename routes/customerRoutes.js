const express = require("express")
const { loginCustomer, verifyOTP, addDetails } = require("../pages/customer/customerLogin")

const customerRouter = express.Router()

// login customer
customerRouter.post('/login', loginCustomer)

// verify otp
customerRouter.post('/verify-otp', verifyOTP)

// add details for new customer
customerRouter.post('/add-details', addDetails)

module.exports = customerRouter