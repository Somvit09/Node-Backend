const express = require('express');
const mongoose = require('mongoose');
const fastcsv = require("fast-csv")
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads
const jwt = require("jsonwebtoken")
const fs = require('fs')

const app = express();

// Serve images from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


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


// load varialbles from .env
require('dotenv').config();
const port = process.env.PORT;
const database = process.env.DATABASE_NAME;

// models
const Merchant = require('./models/merchant_model')


// router configuration
const merchantRouter = require('./routes/merchantRoutes')
const customerRouter = require('./routes/customerRoutes')
const adminRouter = require('./routes/adminRoutes')


// Middlewares
app.use(express.json());
// Configure CORS
const corsOptions = {
    origin: 'http://localhost:5173', // Update with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable CORS credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));


// MongoDB Connection
try {
    // MongoDB Connection
    mongoose.connect(process.env.MONGO_URI, {}).catch(error => {
        console.log(error)
    });

    const db = mongoose.connection

    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // Log the error or handle it appropriately without stopping the application
        // For instance, you can choose to log the error and continue the server running
    });

    db.once('open', () => {
        console.log('Connected to MongoDB');
        db.useDb(database)
        // Perform additional actions when the MongoDB connection is successful
    });
} catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Handle the error as needed (logging, custom response, etc.)
}



// merchant routes
app.use('/merchant', merchantRouter)

// customer routes 
app.use('/customer', customerRouter)

// admin routes
app.use('/admin', adminRouter)


// for uploading a file
app.post('/upload_image', upload.any('image'), async (req, res) => {
    const files = req.files
    try {
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No file Uploaded." })
        }
        const imageUrls = files.map(file => '/uploads/' + file.filename)
        console.log(imageUrls)
        res.status(201).json({
            'imageURL': imageUrls,
            'success': "Uploaded"
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// automatically checks and updates the plans
const checkAndUpdateMerchantStatus = async () => {
    try {
        console.log('Checking and updating merchant status...');

        const currentDate = new Date(); // Get the current date

        // Find merchants with plans that have ended
        const expiredMerchants = await Merchant.find({
            merchantPricingEnded: { $lt: currentDate },
            merchantActive: 'active'
        });

        if (expiredMerchants.length > 0) {
            // Update merchantActive status to 'inactive' for expired plans
            expiredMerchants.forEach(async (merchant) => {
                merchant.merchantActive = 'inactive';
                await merchant.save();
            });

            console.log('Updated merchantActive status for expired plans.');
        } else {
            console.log('No expired plans found.');
        }
    } catch (err) {
        console.error('Error checking and updating merchant status:', err);
    }
};

// Set up a scheduler to run the checkAndUpdateMerchantStatus function every 24 hours
setInterval(checkAndUpdateMerchantStatus, 24 * 60 * 60 * 1000); // Run every 24 hours



app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});