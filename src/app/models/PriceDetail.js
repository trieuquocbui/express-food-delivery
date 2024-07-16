const mongoose = require("mongoose");

const PriceDetailScheme = mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    newPrice: Number,
    appliedAt: Date,
    createdAt: Date,
});

module.exports = mongoose.model("price_details", PriceDetailScheme);