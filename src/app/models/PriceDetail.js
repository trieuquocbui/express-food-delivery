const mongoose = require("mongoose");

const PriceDetailScheme = mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    newPrice: Number,
    appliedAt: Date,
    createdAt: Date,
});

module.exports = mongoose.model("price_details", PriceDetailScheme);