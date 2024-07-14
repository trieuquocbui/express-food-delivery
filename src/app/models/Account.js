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
    thumbnail: String,
    status: Number,
    roleId: {
        type: String,
    },
    createdAt: { type: Date, default: Date.now }
})


module.exports = mongoose.model("accounts", AccountScheme);