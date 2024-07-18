const mongoose = require('mongoose');

const Rolechema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model("roles", Rolechema);
