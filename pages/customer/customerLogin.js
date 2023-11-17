const Customer = require("../../models/customer_model");
const OTP = require("../../models/otpModel");
const jwt = require("jsonwebtoken");
require('dotenv').config();


// for otp
const twilio = require('twilio');
const twilioAccountSid = process.env.YOUR_TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.YOUR_TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.YOUR_TWILIO_PHONE_NUMBER;

// initializing the Twilio client
const client = twilio(twilioAccountSid, twilioAuthToken);


// Helper function to generate a random OTP
function generateRandomOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandom16DigitNumber() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}



// Login function with OTP authentication
const loginCustomer = async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = generateRandomOTP();

    try {
        // stored the otp to the model
        // if already otp is in model
        existingOtp = await OTP.findOne({ phoneNumber: phoneNumber })
        if (!existingOtp) {
            // saving otp to the model
            console.log(existingOtp)
            await OTP.create({ phoneNumber: phoneNumber, otp: otp });
            // Send OTP via Twilio
            await client.messages.create({
                body: `Your otp is ${otp}. It will be valid for 5 minutes.`,
                from: twilioPhoneNumber,
                to: phoneNumber,
            });
            return res.status(201).json({
                message: `OTP sent Successfully. otp is ${otp}. It will be valid for 5 minutes.`,
            });
        }
        // Send OTP via Twilio
        await client.messages.create({
            body: `Your otp is ${existingOtp.otp}. It will be valid for 5 minutes.`,
            from: twilioPhoneNumber,
            to: phoneNumber,
        });
        return res.status(201).json({
            message: `OTP sent Successfully. otp is ${existingOtp.otp}. It will be valid for 5 minutes.`,
        });

    } catch (error) {
        console.log(`Failed to send OTP to the phone number ${phoneNumber}.`, error);
        res.status(500).json({
            error: `Failed to login user. Please try after some time. ${error.message}`,
        });
    }
}

// Verify OTP
const verifyOTP = async (req, res) => {
    const { phoneNumber, user_otp } = req.body;

    try {
        // Find the user by email
        const customer = await Customer.findOne({ customerPhoneNumber: phoneNumber });

        // Check if the OTP matches the stored OTP
        const storedOTP = await OTP.findOne({ phoneNumber: phoneNumber });

        // if otp expired
        if (!storedOTP) {
            return res.status(404).json({
                success: false,
                message: "OTP has expired, please retry again with newly generated OTP.",
                redirectURL: `/signup`
            })
        }
        if (storedOTP.otp) {
            if (storedOTP.otp !== user_otp) {
                return res.status(404).json({
                    success: false,
                    message: "Otp is incorrect.",
                    redirectURL: `/otp`
                })
            }
        }

        if (storedOTP && storedOTP.otp === user_otp) {
            // if otp verified and customer is not found
            if (!customer) {
                return res.status(201).json({
                    success: true,
                    message: "OTP verified successfully. Customer is not found, redirecting to the add details.",
                    redirectURL: `/uploadphoto`,
                })
            }
            // if customer found
            // Create and sign a JWT token for the newly registered user
            const token = jwt.sign({ customerId: customer.customerID }, process.env.JWT_SECRET, {
                expiresIn: "1h", // expires in 1 hour
            });
            return res.status(200).json({
                success: true,
                message: "OTP verified successfully. Customer is found, redirecting to the virtual tryon.",
                redirectURL: `/uploadphoto`,
                token: token,
                customer
            })
        } else {
            res.status(400).json({
                error: "error occured",
                redirectURL: `/signup`
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
}

const addDetails = async (req, res) => {
    const customerID = generateRandom16DigitNumber()
    const customer = await Customer.findOne({ customerID: customerID })
    if (customer) {
        customerID = generateRandom16DigitNumber()
    }
    try {
        const { phoneNumber, email, fullName } = req.body
        await Customer.create({ customerPhoneNumber: phoneNumber, customerEmail: email, customerName: fullName, customerID: customerID })

        const customer = await Customer.findOne({ customerPhoneNumber: phoneNumber })

        // Create and sign a JWT token for the newly registered user
        const token = jwt.sign({ customerId: customer.customerID }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });
        return res.status(201).json({
            success: true,
            message: "Updated new customer, redirecting to virtual tryon.",
            redirectURL: `/uploadphoto`,
            token: token,
            customer
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            redirectURL: '/signup'
        })
    }

}

module.exports = {
    loginCustomer, verifyOTP, addDetails
}
