const mongoose = require("mongoose")

const EmployeeScheme = mongoose.Schema({
    ids: {
        type: String,
        require: true,
        unique: true
    },
    fullName: {
        type: String,
        require: true,
        unique: true
    },
    address: {
        type: String,
        require: true,
    },
    age: Number,
    gender: Boolean,
    accountId:String
})

module.exports = mongoose.model("employee", EmployeeScheme);