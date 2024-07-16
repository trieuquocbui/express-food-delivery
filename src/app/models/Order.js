const mongoose = require("mongoose");
const OrderDetail = require('../models/OrderDetail.js');

const OrderScheme = mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    totalAmount: Number,
    status: Number,
    address: String,
    createdAt: Date,
    orderDetails: [OrderDetail.schema]
});

module.exports = mongoose.model("orders", OrderScheme);