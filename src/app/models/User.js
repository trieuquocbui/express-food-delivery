const mongoose = require("mongoose")

const UserScheme = mongoose.Schema({
    fullName: {
        type: String,
        require: true,
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    address: {
        type: String,
        require: true,
    },
    dob: Date,
    gender: Boolean,
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts'
    }
})

module.exports = mongoose.model("users", UserScheme);