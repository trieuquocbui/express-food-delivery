const mongoose = require("mongoose");

const PriceDetailScheme = mongoose.Schema({
    adminId:String,
    productId:String,
    newPrice:Number,
    appliedAt: Date,
    createdAt: Date,
});

module.exports = mongoose.model("price_detail",PriceDetailScheme);