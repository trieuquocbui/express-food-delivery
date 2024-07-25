const mongoose = require("mongoose");

const CartDetailsScheme = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    quantity: Number,
});

module.exports = mongoose.model("cart_details",CartDetailsScheme);