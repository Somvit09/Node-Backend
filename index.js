const express = require('express');
const mongoose = require('mongoose');
const Customer = require('./models/customer_model')
const fastcsv = require("fast-csv")
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require("path")

const app = express();

// Serve images from the 'uploads' directory
app.use('/public', express.static('public'));

// storage middleware for uploading images
const storage = multer.diskStorage({
    destination: './public/upload',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    },
})

// creating a multer instance with the specified storage
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png'
        ) {
            cb(null, true)
        }
        else {
            cb(null, false);
            cb(new Error('Only jpeg,  jpg , and png Image allowed'))
        }
    }
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
const tryONRouter = require('./routes/tryOnRouter')


// Middlewares
app.use(express.json());
// Configure CORS
const corsOptions = {
    origin: '*', // Update with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable CORS credentials (cookies, authorization headers, etc.)
    allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));


// MongoDB Connection
try {
    // MongoDB Connection
    mongoose.connect(process.env.MONGO_URI_MAIN, {}).catch(error => {
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
        // db.useDb(database)
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

// virtual tryon button
app.use('/tryon', tryONRouter)

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


// check if any images in virtual tryon section is 6 days past image or not
const removeOldImagesFromDB = async () => {
    const sixDaysAgo = new Date()
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6) // 6 for 6 days older images to be deleted

    try {
        const result = await Customer.updateMany({
            'customerVirtualTryRoomImages.createdAt': { $lt: sixDaysAgo }
        },
            { $pull: { customerVirtualTryRoomImages: { createdAt: { $lt: sixDaysAgo } } } }
        )
        console.log(`${result.nModified} images removed.`)
    } catch (err) {
        console.error(err.message)
    }
}


const deleteImageFiles = async () => {
    try {
        const sixDaysAgo = new Date()
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6) // 6 for 6 days older images to be deleted
        const customers = await Customer.find({
            'customerVirtualTryRoomImages.createdAt': { $lt: sixDaysAgo }
        })

        await Promise.all(customers.map(async (customer) => {
            await Promise.all(customer.customerVirtualTryRoomImages.map(async (image) => {
                const imagePath = path.join(__dirname, image.imgUrl)
                const doesFileExist = await fs.promises.access(imagePath)
                    .then(() => true)
                    .catch(() => false);

                if (doesFileExist) {
                    await fs.promises.unlink(imagePath);
                    console.log(`File ${imagePath} deleted successfully.`);
                } else {
                    console.log(`File ${imagePath} does not exist.`);
                }

            }));
        }));
    } catch (err) {
        console.error(`Error deleting image files: ${err.message}`)
    }
}


const removeOldImages = async () => {
    await deleteImageFiles()
    await removeOldImagesFromDB()
}



// Set up a scheduler to run the checkAndUpdateMerchantStatus function every 24 hours
setInterval(checkAndUpdateMerchantStatus, 24 * 60 * 60 * 1000); // Run every 24 hours
setInterval(removeOldImages, 12 * 60 * 60 * 1000); // Run every 12 hours

app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});