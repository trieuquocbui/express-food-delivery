const mongoose = require("mongoose")

const CustomerScheme = mongoose.Schema({
    fullName: {
        type: String,
        require: true,
    },
    accountId: String,
});

module.exports = mongoose.model("customer", CustomerScheme);