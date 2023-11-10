const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Admin', adminSchema)