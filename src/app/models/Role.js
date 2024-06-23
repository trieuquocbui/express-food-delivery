const mongoose = require('mongoose');

const Rolechema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model("role", Rolechema);
