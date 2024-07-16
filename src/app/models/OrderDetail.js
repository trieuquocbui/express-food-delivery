const mongoose = require("mongoose");

const OrderDetailScheme = mongoose.Schema({
    productId: { type: String, ref: 'products' },
    quantity: Number,
    price: Number
});

const OrderDetail = mongoose.model('OrderDetail', OrderDetailScheme);

module.exports = OrderDetail;