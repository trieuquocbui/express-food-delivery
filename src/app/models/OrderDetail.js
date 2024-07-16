const mongoose = require("mongoose");

const OrderDetailScheme = mongoose.Schema({
    productId: { type: String, ref: 'products' },
    quantity: Number,
    price: Number
});

module.exports = OrderDetailScheme;