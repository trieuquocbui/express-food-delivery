const mongoose = require("mongoose");

const PriceDetailScheme = mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    productId: String,
    newPrice: Number,
    appliedAt: Date,
    createdAt: Date,
});

module.exports = mongoose.model("price_details", PriceDetailScheme);