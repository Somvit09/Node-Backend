const Apparel = require("../../models/apparel_model");
const Merchant = require("../../models/merchant_model");
const fs = require('fs')
const fastcsv = require("fast-csv")

// get 16 digit random number
function generateRandom16DigitNumber() {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}


// get all apparel with their details
const getAllApparels = async (req, res) => {
    try {
        const apparels = await Apparel.find()
        return res.status(200).json({
            apparels: apparels,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

// get a apparel by specific id
const getASingleApparel = async (req, res) => {
    try {
        const apparel = await Apparel.findOne({ apparelID: req.params.id })
        if (!apparel) {
            return res.status(404).json({
                message: "Apparel not found.",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            apparel: apparel
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

// add new apparel
const createApparel = async (req, res) => {
    const { apparelID, apparelName, apparelType, imageUrl } = req.body;
    const aaprelIDBySystem = generateRandom16DigitNumber()
    const merchantID = req.user.merchantID
    const merchant = await Merchant.findOne({ merchantID: merchantID })
    try {
        // Check if an apparel item with the same ID already exists
        const existingApparel = await Apparel.findOne({ aaprelIDBySystem: aaprelIDBySystem, apparelID: apparelID });
        if (existingApparel) {
            return res.status(409).json({
                message: "Apparel already exists",
                redirectURL: '/apparels',
                existingApparel
            });
        }

        // Create a new apparel item
        const newApparel = ({
            apparelName,
            imageUrl,
            apparelID,
            aaprelIDBySystem,
            apparelAssociatedMerchant: merchantID,
            apparelType,
            uploadDate: Date.now(),
        });

        // Save the new apparel item
        await Apparel.create(newApparel);

        // save the new apparel to the merchant
        if (!merchant.merchantAssociatedApparels.includes(apparelID)) {
            merchant.merchantAssociatedApparels.push(apparelID)

            await merchant.save()
        }

        return res.status(201).json({
            message: `Apparel with id ${apparelID} added.`,
            apparel: await Apparel.findOne({ apparelID: apparelID })
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            success: false
        });
    }
};


// Update the apparel data
const updateApparel = async (req, res) => {
    try {
        // Extract updated data from the request body
        const { status, apparelName, apparelType, imageUrl, apparelAssociatedMerchant } = req.body;

        // Create a new object with the updated data and the current date for uploadDate
        const updatedApparel = {
            apparelName,
            imageUrl,
            apparelAssociatedMerchant,
            apparelType,
            status,
            uploadDate: Date.now()
        }

        // Find and update the apparel item by its unique ID
        const updatedData = await Apparel.findOneAndUpdate(
            { apparelID: req.params.id },
            updatedApparel,
            { new: true }
        );

        // Confirm the update by retrieving the updated data
        return res.status(200).json({
            success: true,
            updatedData,
        });
    } catch (err) {
        // Handle any errors, providing a more specific error message if possible
        res.status(500).json({
            error: err.message,
            success: false
        });
    }
};



// delete the specific apparel
const deleteApparel = async (req, res) => {
    const id = req.params.id;
    const merchantID = req.user.merchantID
    try {
        const delApparel = await Apparel.findOneAndDelete({ apparelID: id });
        // Remove the apparel ID from the merchant's associated apparels array
        await Merchant.updateOne({
            merchantID: merchantID
        },
            {
                $pull: { merchantAssociatedApparels: id }
            });
        return res.status(200).json({
            apparel: delApparel,
            message: `Apparel with id ${id} is deleted.`,
            success: true
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

// get all the apparels which are associated with a particular merchant

const getAllApparelsForASpecificMerchant = async (req, res) => {
    const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
    if (!merchant) {
        return res.status(404).json({
            message: "Merchant not found",
            status: false
        })
    }
    try {
        const apparels = await Apparel.find({ apparelAssociatedMerchant: merchant.merchantID })
        if (!apparels || apparels.length === 0) {
            return res.status(404).json({
                apparels,
                success: false,
                message: 'Apparels not found',
            })
        }
        return res.status(200).json({
            apparels,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }

}


const uploadCSV = async (req, res) => {
    try {
        const merchant = await Merchant.findOne({ merchantID: req.user.merchantID })
        if (!req.file) {
            return res.status(404).json({
                success: false,
                error: "File not found",
            });
        }

        const csvFilePath = req.file.path;
        const requiredFields = ['apparel name', 'type', 'apparel image', 'apparel id']

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

        const existingApparels = []
        for (const row of data) {
            if (requiredFields.every((field) => field in row)) {
                const id = generateRandom16DigitNumber()
                const existedSystemId = await Apparel.findOne({ aaprelIDBySystem: id })
                const existedApparel = await Apparel.findOne({
                    apparelID: row['apparel id'],
                    apparelAssociatedMerchant: req.user.merchantID
                })

                if(existedSystemId){
                    id = generateRandom16DigitNumber()
                }

                if (existedApparel) {
                    existingApparels.push(row['apparel id'])
                } else {
                    await Apparel.create({
                        apparelID: row['apparel id'],
                        apparelName: row['apparel name'],
                        imageUrl: row['apparel image'],
                        apparelType: row['type'],
                        uploadDate: new Date(),
                        aaprelIDBySystem: id,
                        apparelAssociatedMerchant: req.user.merchantID,
                    });
                    if (!merchant.merchantAssociatedApparels.includes(row['apparel id'])) {
                        merchant.merchantAssociatedApparels.push(row['apparel id']);
                    } else {
                        console.log(`Apparel ID ${row['apparel id']} is already associated with merchant`)
                    }
                }
            }
        }
        await merchant.save();
        console.log(existingApparels)
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





module.exports = {
    getAllApparels, getASingleApparel, createApparel, updateApparel, deleteApparel, getAllApparelsForASpecificMerchant, uploadCSV
}