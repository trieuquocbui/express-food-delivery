const mongoose = require("mongoose");

const NotificationScheme = mongoose.Schema({
    order:{ type: mongoose.Schema.Types.ObjectId, ref: 'order' },
    message:String,
    createdAt:Date,
});

module.exports = mongoose.model("notifications",NotificationScheme);