const mongoose = require('mongoose');

const ProductScheme = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    thumbnail: String,
    description: String,
    sold: Number,
    quantity: Number,
    status: Boolean,
    featured: Boolean
});

module.exports = mongoose.model("products", ProductScheme);
