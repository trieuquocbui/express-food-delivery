const mongoose = require("mongoose")

const AccountScheme = mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    status: Number,
    roleId: {
        type: String,
    },
    createdAt: { type: Date, default: Date.now }
})


module.exports = mongoose.model("account", AccountScheme);