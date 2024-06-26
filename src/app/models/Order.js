const mongoose = require("mongoose");
const OrderDetail = require('../models/OrderDetail.js').schema;

const OrderScheme = mongoose.Schema({
    customerId: String,
    totalAmount: Number,
    status: Number,
    address: String,
    createdAt: Date,
    orderDetails: [OrderDetail]
});

module.exports = mongoose.model("order", OrderScheme);