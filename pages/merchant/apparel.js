const Apparel = require("../../models/apparel_model");
const Merchant = require("../../models/merchant_model");


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
const createApparel = (req,res) => {
    const { id, name,  type, MAppid, status, avatarImage } = req.body;
    const newApparel = new Apparel({
        apparelName: name,
        imageUrl: avatarImage,
        apparelID: id,
        apparelMAppid :MAppid,
        apparelType: type,
        uploadDate: Date.now(),
        status : status 
    });
    Apparel.findOne({apparelID:id})
    .then(data => {
        if(data){
            return res.status(409).json({
                message: "Apparel already exists",
                redirectURL: '/apparels'
            });
        }else{
            newApparel.save();
            return res.status(200).json({
                message:`Apparel with id ${id} added.`,
                apparel:newApparel
            })
        }
    }).catch( err => {
        return res.status(500).json({
            error: err.message,
            success: false
        })
    })
};

// Update the apparel data
const updateApparel = async (req, res) => {
    try {
        const newApparel = {
            apparelName: req.body.name,
            imageUrl: req.body.avatarImage,
            apparelID: req.body.id,
            apparelMAppid :req.body.MAppid,
            apparelType:req.body. type,
            status : req.body.status 
            
        }
        await Apparel.findOneAndUpdate({ apparelID:req.params.id }, newApparel, {new: true});
        const newData = await Apparel.findOne({ apparelID: req.params.id });
        return res.status(200).json({
            success: true,
            newData,
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
};


// delete the specific apparel
const deleteApparel = async(req,res)=>{
    const id =req.params.id;
    try{
        const delApparel = await Apparel.findOneAndDelete({apparelID:id});
        console.log(delApparel);
        return res.status(200).json({
            apparel:delApparel,
            message:`Apparel with id ${id} is deleted.`,
            success:true
        })
    }catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        })
    }
};

// get all the apparels which are associated with a particular merchant

const getAllApparelsForASpecificMerchant = async (req,res) => {
    merchant = await Merchant.findOne({ merchantID: req.body.merchantID })
    if (!merchant){
        return res.status(404).json({
            message: "Merchant not found",
            status: false
        })
    }
    try{
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
    } catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
    
}

module.exports ={
    getAllApparels,getASingleApparel,createApparel,updateApparel,deleteApparel, getAllApparelsForASpecificMerchant
}