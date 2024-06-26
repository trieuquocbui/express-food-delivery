const mongoose = require("mongoose");

const CategoryScheme = mongoose.Schema({
    _id: String,
    name: String,
    thumbnail: String,
    status: Boolean,
});

module.exports = mongoose.model("category", CategoryScheme);