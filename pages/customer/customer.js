const Customer = require("../../models/customer_model")
// const fs = require("fs")
// const path = require("path")


const tryVTR = async(req,res)=>{
    try{
        const customerID  = req.user
        //update customer
        const customer = await Customer.findOne({customerID:customerID})
        const imgsUrls = customer.customerVirturalTryRoomImages
        imgsUrls.push({
            imgUrl : "/upload/"+req.file.filename
        })
        const updateCustomer = await Customer.findOneAndUpdate({customerID:customerID},{
            customerVirturalTryRoomImages : imgsUrls
        })
        res.status(200).json({
            message :`image have been saved successfully.`,
            success : true
        })
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
}

const getAllVTRImages = async(req,res)=>{
    try{
        const customer =await Customer.findOne({customerID:req.user})
        const images = customer.customerVirturalTryRoomImages
        res.status(200).json({
            customerVTEimages : images,
            message : `fetched all the Virtual Try Room Images for customer with ID ${customerID}`,
            success : true
        })
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
}

module.exports = {getAllVTRImages,tryVTR}