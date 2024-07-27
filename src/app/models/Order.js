const mongoose = require("mongoose");
const OrderDetail = require('../models/OrderDetail.js');

const OrderScheme = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    totalAmount: Number,
    fullName:  String,
    phoneNumber:  String,
    shipping:  Number,
    status: Number,
    latitude: Number,
    longitude: Number,
    address1: String,
    address2: String,
    createdAt: Date,
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order_details' }]
});

module.exports = mongoose.model("orders", OrderScheme);