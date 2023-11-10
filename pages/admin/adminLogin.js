const Admin = require('../../models/admin_model')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require('dotenv').config()

const adminLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const existedAdmin = await Admin.findOne({ emailId: email })
        if (!existedAdmin) {
            return res.status(404).json({
                success: false,
                message: `Admin with emailid ${email} not found.`,
                redirectURL: '/admin/login'
            })
        }
        // Compare the entered password with the stored hash
        const passwordMatch = await bcrypt.compare(password, existedAdmin.password)

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Incorrect password. Please Login with correct details.",
                redirectURL: "/admin/login"
            })
        }
        // Create and sign a JWT token for the existed user
        const token = jwt.sign({ adminId: existedAdmin._id }, process.env.JWT_SECRET, {
            expiresIn: "2h", // expires in 1 hour
        })
        res.status(200).json({
            message: `Login Successfull.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/admin/merchants` // need to think about the email.,
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = adminLogin