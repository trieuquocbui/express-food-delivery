const mongoose = require("mongoose");

const OrderDetailScheme = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    quantity: Number,
    price: Number
});

module.exports = mongoose.model("order_details", OrderDetailScheme);