const express = require('express')
const { merchantLogin } = require('../pages/merchant/merchantLogin')
const { registerMerchant } = require('../pages/merchant/merchantRegister')
const { forgotPassword, verifyPasswordResetOTP, resendOTP } = require('../pages/merchant/forgotPassword')

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


module.exports = merchantRouter
