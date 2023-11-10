const Admin = require('../../models/admin_model')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require('dotenv').config()

const adminRegister = async (req, res) => {
    const { email, password } = req.body
    try {
        const existedAdmin = await Admin.findOne({ emailId: email })
        if (existedAdmin) {
            return res.status(200).json({
                success: true,
                message: `Admin with email id ${email} already existed.`
            })
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await Admin.create({
            emailId: email,
            password: hashedPassword
        })
        // Create and sign a JWT token for the newly registered user
        const token = jwt.sign({ adminId: newAdmin._id }, process.env.JWT_SECRET, {
            expiresIn: "2h", // expires in 1 hour
        });
        res.status(201).json({
            newAdmin,
            message: `Admin registration successfull.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/admin/login`,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

module.exports = adminRegister