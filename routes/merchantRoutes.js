const express = require('express')
const { merchantLogin } = require('../pages/merchant/merchantLogin')
const { registerMerchant } = require('../pages/merchant/merchantRegister')
const { forgotPassword, verifyPasswordResetOTP, resendOTP } = require('../pages/merchant/forgotPassword')
const { 
    getASingleApparel, getAllApparels, createApparel, updateApparel, deleteApparel, getAllApparelsForASpecificMerchant
} = require('.././pages/merchant/apparel')
const {
    getAllCustomers, getAllCustomersForASpecificMerchant
} = require('.././pages/merchant/customer')


const merchantRouter = express.Router()

// login merchant
merchantRouter.post('/login', merchantLogin)

// register merchant
merchantRouter.post('/register', registerMerchant)

// forgot password
merchantRouter.post('/forgot-password', forgotPassword)

// verify password
merchantRouter.post('/verify-password', verifyPasswordResetOTP)

// resend otp 
merchantRouter.post('/resend-otp', resendOTP)

// get a specific apparel
merchantRouter.get('/apparel/:id', getASingleApparel)

// get all apparels
merchantRouter.get('/apparels', getAllApparels)

// create a apparel
merchantRouter.post('/apparel/create', createApparel)

// update a apparel
merchantRouter.post('/apparel/:id', updateApparel);

// delete a apparel
merchantRouter.delete('/apparel/:id', deleteApparel)

// get apparels for a particular merchant
merchantRouter.get('/all-apparels', getAllApparelsForASpecificMerchant)

// get all customers for a particular merchant
merchantRouter.get('/all-customers', getAllCustomersForASpecificMerchant)

// get all customers
merchantRouter.get('/customers', getAllCustomers)


module.exports = merchantRouter
