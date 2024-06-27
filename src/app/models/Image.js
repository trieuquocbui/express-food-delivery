const mongoose = require("mongoose")

const ImageScheme = mongoose.Schema({
    filename: String,
    contentType: String,
    image: Buffer,
})

module.exports = mongoose.model('images', ImageScheme);