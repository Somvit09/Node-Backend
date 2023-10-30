// load varialbles from .env
require('dotenv').config(); 
const multer = require('multer'); // middleware for handling file uploads
const jwt = require("jsonwebtoken")
const express = require('express')
const { merchantLogin } = require('../pages/merchant/merchantLogin')
const { registerMerchant } = require('../pages/merchant/merchantRegister')
const { forgotPassword, verifyPasswordResetOTP, resendOTP } = require('../pages/merchant/forgotPassword')
const { 
    getASingleApparel, getAllApparels, createApparel, updateApparel, deleteApparel, getAllApparelsForASpecificMerchant, uploadCSV
} = require('.././pages/merchant/apparel')
const {
    getAllCustomers, getAllCustomersForASpecificMerchant
} = require('.././pages/merchant/customer')


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


// storage middleware for uploading images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    },
})

// creating a multer instance with the specified storage
const upload = multer({
    storage: storage
})



const merchantRouter = express.Router()

// authentication required for this route using authenticationToken middleware, using for testing
merchantRouter.post('/protected_route', authenticationToken, (req, res) => {
    const merchantID = req.user.merchantID
    console.log(req.user)
    res.status(200).json({message: merchantID})
})

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
merchantRouter.post('/apparel/create', authenticationToken, createApparel)

// update a apparel
merchantRouter.post('/apparel/update/:id', authenticationToken, updateApparel);

// delete a apparel
merchantRouter.delete('/apparel/delete/:id', authenticationToken, deleteApparel)

// get apparels for a particular merchant
merchantRouter.get('/all-apparels', authenticationToken,  getAllApparelsForASpecificMerchant)

// get all customers for a particular merchant
merchantRouter.get('/all-customers', authenticationToken, getAllCustomersForASpecificMerchant)

// get all customers
merchantRouter.get('/customers', getAllCustomers)

// upload a csv file
merchantRouter.post('/upload-csv', upload.single('csvFile'), authenticationToken, uploadCSV)


module.exports = merchantRouter



// fetch('/protected_route', {
//     method: 'POST',
//     headers: {
//         'Authorization': `${yourJWTToken}`,
//         'Content-Type': 'application/json',
//     },
// });
// have to add the token to the header section named to be Authorization in the frontend