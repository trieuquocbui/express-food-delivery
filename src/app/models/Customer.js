const mongoose = require("mongoose")

const CustomerScheme = mongoose.Schema({
    fullName: {
        type: String,
        require: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    accountId:String
});

module.exports = mongoose.model("customer", CustomerScheme);