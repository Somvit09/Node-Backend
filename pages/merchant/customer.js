const Customer = require("../../models/customer_model");
const Merchant = require("../../models/merchant_model")
const fs = require('fs')
const fastcsv = require("fast-csv")

// get 16 digit random number
function generateRandom16DigitNumber() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

//to get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
        return res.status(200).json({
            customers: customers,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

//to get a specific customer
const getSpecificCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerID: parseInt(req.params.id) })
        return res.status(200).json({
            success: true,
            customer: customer
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
}


// get all customers for a single merchant

const getAllCustomersForASpecificMerchant = async (req, res) => {
    
    try{
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
        if (!merchant){
            return res.status(404).json({
                message: "merchant not found",
                success: false
            })
        }
        const allCustomers = await Customer.find({customerAssociatedMerchant: merchant.merchantID})
        if (!allCustomers || allCustomers.length === 0) {
            return res.status(404).json({
                allCustomers,
                success: false,
                message: " No customers found"
            })
        }
        return res.status(200).json({
            allCustomers,
            success: true,
            message: "Found customers"
        })

    } catch(err) {
        res.ststus(500).json({
            success: false,
            error: err.message
        })
    }
}


// testing purpose 
const customerUploadCSV = async (req, res) => {
    try {
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
        if (!req.file) {
            return res.status(404).json({
                success: false,
                error: "File not found",
            });
        }

        const csvFilePath = req.file.path;
        const requiredFields = ['name', 'email', 'image', 'phone_number']

        const csvParser = fastcsv.parse({ headers: true })
        const csvData = [];

        const parserPromise = new Promise((resolve, reject) => {
            csvParser
                .on('data', (row) => {
                    csvData.push(row);
                })
                .on('end', () => {
                    resolve(csvData);
                })
                .on('error', (err) => {
                    reject(err);
                });

            fs.createReadStream(csvFilePath).pipe(csvParser)
        });

        const data = await parserPromise

        const existingCustomers = []
        for (const row of data) {
            if (requiredFields.every((field) => field in row)) {
                const id = generateRandom16DigitNumber()
                const existedSystemId = await Customer.findOne({ 
                    customerEmail: row['email']
                })
                if (existedSystemId){
                    existingCustomers.push(id)                
                } else {
                    await Customer.create({
                        customerID: id,
                        customerName: row['name'],
                        customerImages: row['image'],
                        customerEmail: row['email'],
                        customerPhoneNumber: row['phone_number'],
                        customerAssociatedMerchant: req.user.merchantID,
                    });
                    if (!merchant.merchantAssociatedCustomers.includes(id)) {
                        merchant.merchantAssociatedCustomers.push(id);
                    } else {
                        console.log(`Customer ID ${id} is already associated with merchant`)
                    }
                }
            }
        }
        await merchant.save();
        console.log(existingCustomers)
        res.status(201).json({
            success: true,
            message: "CSV uploaded successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        })
    }
}


module.exports ={
    getAllCustomers,getSpecificCustomer, getAllCustomersForASpecificMerchant, customerUploadCSV
}