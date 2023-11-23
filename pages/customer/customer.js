const Customer = require("../../models/customer_model")

const tryVTR = async(req,res)=>{
    try{
        const id = req.params.customerID
        // adding dummy image from unsplash
        const image =await axios.get("https://api.unsplash.com/photos/random/?client_id=cOoy9hV3Nu0z7dKQpa8fssqZZAtvRsDc-RKaMmwmSD8")
        const data = image.data.urls.full
        // finding customer with given id
        const customer =await Customer.findOneAndUpdate({customerID:id}) 
        const arrImgs = customer.customerVirturalTryRoomImages
        arrImgs.push({
           url:data
        })
        // update the output image array in the customer model
        const updateCustomer = await Customer.findOneAndUpdate({customerID:id},{customerVirturalTryRoomImages:arrImgs})
        
        res.status(200).json({
            imageUrl : data, // sending the image url as response
            message:"New image updated",
            success:true
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
        const customer =await Customer.findOne({customerID:req.params.customerID})
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