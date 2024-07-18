const mongoose = require("mongoose");

const OrderDetailScheme = mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    quantity: Number,
    price: Number
});

module.exports = mongoose.model("order_details", OrderDetailScheme);