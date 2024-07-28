const mongoose = require("mongoose");

const NotificationDetaillScheme = mongoose.Schema({
    notification: { type: mongoose.Schema.Types.ObjectId, ref: 'notifications' },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
    status: Boolean
});

module.exports = mongoose.model("notification_details", NotificationDetaillScheme);