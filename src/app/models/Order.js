const mongoose = require("mongoose");
const OrderDetail = require('../models/OrderDetail.js');

const OrderScheme = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    totalAmount: Number,
    status: Number,
    address: String,
    createdAt: Date,
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order_details' }]
});

module.exports = mongoose.model("orders", OrderScheme);