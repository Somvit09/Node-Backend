const OTP = require('../../models/otpModel')
const Merchant = require("../../models/merchant_model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
require('dotenv').config()

// sending mail
const testGmail = process.env.EMAIL
const emailPassword = process.env.PASSWORD_GMAIL


// Helper function to generate a random OTP
function generateRandomOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// helper function for sending email
async function sendOTPByEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: testGmail, // Your email address
            pass: emailPassword, // Your email password (make sure to keep this secure)
        },
    })
    const mailOptions = {
        from: testGmail,
        to: email,
        subject: "Forgot Password",
        text: `Your otp for new password generation is ${otp}. It will be valid for 5 minutes.`,
    }
    await transporter.sendMail(mailOptions)
}


// request otp from email or phone number

const forgotPassword = async (req, res) => {
    const { email } = req.body
    const otp = generateRandomOTP()

    try {
        // check if merhcant exists
        merchant = await Merchant.findOne({ merchantEmail: email })
        if (!merchant) {
            return res.status(404).json({
                error: "Merchant not found.",
                redirectURL: `/forgot-password?email=${email}`,
            })
        }

        // still thinking about this jwt required in authentication or not
        const token = jwt.sign({ merchantID: merchant._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });

        // stored the otp to the model
        existingOtp = await OTP.findOne({ email: email })
        if (!existingOtp){
            // saving otp to the model
            await OTP.create({ email: email, otp: otp });
            // sending otp to email
            await sendOTPByEmail(email, otp)

        return res.status(201).json({
            message: `OTP sent Successfully. It will be valid for 5 minutes. otp = ${otp}`,
            redirectURL: `/verify-otp?email=${email}&otp=${otp}`,
            token: token
        })
        } else {
            return res.status(200).json({
                message: `OTP has already sent. otp = ${existingOtp.otp}`,
                redirectURL: `/verify-otp?email=${email}&otp=${existingOtp.otp}`,
                token: token
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: `Failed to send OTP. Please try again later. ${err.message}`,
        });
    }
}


// Verify OTP for Password Reset
const verifyPasswordResetOTP = async (req, res) => {
    const { email, user_otp, newPassword, retypedPassword } = req.body;

    try {
        merchant = await Merchant.findOne({ merchantEmail: email })
        if (!merchant) {
            return res.status(404).json({
                success: false,
                error: "Merchant not found.",
                redirectURL: `/register`,
            })
        }
        // Check if the OTP matches the stored OTP
        const storedOTP = await OTP.findOne({ email: email });

        // if otp expired
        if (!storedOTP) {
            return res.status(404).json({
                success: false,
                message: "OTP has expired, please retry again with newly generated OTP.",
                redirectURL: `/forgot-password?email=${email}`
            })
        }
        if (storedOTP.otp){
            if (storedOTP.otp !== user_otp){
                return res.status(404).json({
                    success: false,
                    message: "Otp is incorrect.",
                    redirectURL: `/verify-otp?email=${email}`
                })
            }
        }


        // password validation
        if (newPassword !== retypedPassword){
            return res.status(400).json({
                success: false,
                message: `password didnot matches`,
                redirectURL: `/verify-otp?email=${email}&otp=${user_otp}`,
            });
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (!hashedPassword) {
            return res.status(401).json({
                success: false,
                message: "Password hashing failed",
                redirectURL: `/verify-otp?email=${email}&otp=${user_otp}`
            })
        }
        // OTP is valid; reset the user's password with updated password that is correctly generated
        await Merchant.findOneAndUpdate({ merchantEmail: email }, { merchantPassword: hashedPassword });

        res.status(201).json({
            success: true,
            message: "Password reset is successfull.",
        })

    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({
            success: false,
            error: `Error verifying OTP. Please try again later. ${err.message}`,
        });
    }
}


// Resend OTP API
const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the merchant exists
        const merchant = await Merchant.findOne({ merchantEmail: email });

        if (!merchant) {
            return res.status(404).json({
                error: "Merchant not found.",
                redirectURL: `/forgot-password?email=${email}`,
            });
        }

        // Generate a new OTP
        const otp = generateRandomOTP();

        // Sign a JWT token (if required in your authentication flow)
        const token = jwt.sign({ merchantID: merchant._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });

        // Check if an OTP already exists
        let otpRecord = await OTP.findOne({ email: email });

        // If no OTP exists, generate a new one
        if (!otpRecord) {
            otpRecord = await OTP.create({ email: email, otp: otp });
        }
        // Store the new OTP in the database
        await OTP.findOneAndUpdate({ email: email }, { otp: otp });
        
        // Send the OTP by email
        await sendOTPByEmail(email, otp);

        return res.status(201).json({
            message: `New OTP sent successfully. It will be valid for 5 minutes. OTP = ${otp}`,
            redirectURL: `/verify-otp?email=${email}&otp=${otp}`,
            token: token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: `Failed to send OTP. Please try again later. ${err.message}`,
        });
    }
}


module.exports = {
    forgotPassword, verifyPasswordResetOTP, resendOTP
}