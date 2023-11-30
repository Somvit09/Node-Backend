require('dotenv').config(); 
const jwt = require("jsonwebtoken")
const express = require("express")
const { loginCustomer, verifyOTP, addDetails, resendOTP } = require("../pages/customer/customerLogin")
const {getAllVTRImages,tryVTR} = require('../pages/customer/customer')
const multer = require("multer")

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

// storage middleware for uploading images
const storage = multer.diskStorage({
    destination:'./public/upload',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    },
})

// creating a multer instance with the specified storage
const upload = multer({
    storage: storage,
    fileFilter:(req, file, cb)=>{
        if(
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png' 
        ){
            cb(null, true)
        }
        else{
            cb(null, false);
            cb(new Error('Only jpeg,  jpg , and png Image allowed'))
        }
    }
})


// login customer
customerRouter.post('/login', loginCustomer)

// verify otp
customerRouter.post('/verify-otp', verifyOTP)

// add details for new customer
customerRouter.post('/add-details', addDetails)

// resend otp
customerRouter.post('/resend-otp', resendOTP)

//get image from VTR
customerRouter.post('/tryOn',authenticationToken,upload.single('file'),tryVTR)

//get all images given by VTR
customerRouter.get('/VTRimages',authenticationToken,getAllVTRImages)

module.exports = customerRouter