const Customer = require("../../models/customer_model")
const fs = require("fs")
const path = require("path")


const tryVTR = async(req,res)=>{
    try{
        const uploadFolderPath = '../../uploads/'
        fs.readdir(uploadFolderPath,async(err,files)=> {
            if (err) {
              console.error('Error reading folder:', err)
              return res.status(500).json({
                message:err,
                success:false
              })
            }
            // const savedImages = []
            
            let mostRecentImage = null
            let mostRecentTimestamp = 0

            files.forEach(file => {
            const filePath = path.join(uploadFolderPath, file)
            const fileStats = fs.statSync(filePath)

            if (fileStats.mtimeMs > mostRecentTimestamp) {
                mostRecentTimestamp = fileStats.mtimeMs
                mostRecentImage = file
            }
            })
            if (!mostRecentImage) {
                return res.status(404).json({
                    message:"no image found",
                    success:false
                })
            }

            const customer = await Customer.findOne({customerID:req.user})
            const images = customer.customerVirturalTryRoomImages //existing images
            
            // images.forEach(function(currentImage, Index){
            //     savedImages[Index] += currentImage
            // })
            
            images.push(mostRecentImage)

            const updateCustomer =await Customer.findOneAndUpdate({customerID:req.user},
                {customerVirturalTryRoomImages:images})

            res.status(200).json({
                images: images,
                message:"images updated",
                success:true
            })
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
            customerVTEimages :images,
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