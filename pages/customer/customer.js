const Customer = require("../../models/customer_model")
// const fs = require("fs")
// const path = require("path")


const tryVTR = async(req,res)=>{
    try{
        const customerID  = req.user.customerId
        
        //update customer
        const customer = await Customer.findOne({customerID:customerID})
        const url = req.protocol+"://"+req.get('host')
        const imgsUrls = customer.customerVirtualTryRoomImages
        imgsUrls.push({
            imgUrl : url+"/public/upload/"+req.file.filename
        })
        await Customer.findOneAndUpdate({customerID:customerID},{
            customerVirtualTryRoomImages : imgsUrls
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
        const id = req.user.customerId
        const customer =await Customer.findOne({customerID:id})
        const images = customer.customerVirtualTryRoomImages
        console.log(images);
        res.status(200).json({
            customerVTEimages : images,
            message : `fetched all the Virtual Try Room Images for customer with ID ${id}`,
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