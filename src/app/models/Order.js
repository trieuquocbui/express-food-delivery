const mongoose = require("mongoose");

const OrderScheme = mongoose.Schema({
    customerId:String,
    totalAmount: Number,
    status:Number,
    address:String
});

module.exports = mongoose.model("order",OrderScheme);