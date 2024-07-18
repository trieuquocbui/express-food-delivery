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
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now }
})


module.exports = mongoose.model("accounts", AccountScheme);