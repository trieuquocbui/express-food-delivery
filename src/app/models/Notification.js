const mongoose = require("mongoose");

const NotificationScheme = mongoose.Schema({
    orderId:String,
    message:String,
    createdAt:Date,
});

module.exports = mongoose.model("notification",NotificationScheme);