const mongoose = require("mongoose");

const CategoryScheme = mongoose.Schema({
    name: String,
    thumbnail: String,
    status: Boolean,
});

module.exports = mongoose.model("categories", CategoryScheme);