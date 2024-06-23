const mongoose = require("mongoose");

const OrderDetailScheme = mongoose.Schema({
    orderId: String,
    productId: String,
    quantity: Number,
    price: Number
});

module.exports = mongoose.model("order_detail",OrderDetailScheme);