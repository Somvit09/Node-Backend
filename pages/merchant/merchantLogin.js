const Merchant = require("../../models/merchant_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();


// Login function with OTP authentication
const merchantLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const merchant = await Merchant.findOne({ merchantEmail: email });

        if (!merchant) {
            return res.status(404).json({ 
                error: "Merchant not found. Please login with correct credentials.",
                redirectURL: '/login'
            });
        }

        // Compare the entered password with the stored hash
        const passwordMatch = await bcrypt.compare(password, merchant.merchantPassword);

        if (!passwordMatch) {
            return res.status(401).json({ 
                error: "Incorrect password. Please Login with correct details.",
                redirectURL: "/login"
             });
        }
        // Create and sign a JWT token for the newly registered user
        const token = jwt.sign({ merchantID: merchant._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });
        res.status(200).json({
            message: `Login Successfull.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/admin/merchant/${email}` // need to think about the email.,
        });
    } catch (error) {
        res.status(500).json({ 
            error: `Failed to login user. Please try after some time. ${error.message}`,
            redirectURL: "/login"
         });
    }
}

module.exports = {merchantLogin}
