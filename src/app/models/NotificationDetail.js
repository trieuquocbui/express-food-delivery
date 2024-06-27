const mongoose = require("mongoose");

const NotificationDetaillScheme = mongoose.Schema({
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
    status: Boolean
});

module.exports = mongoose.model("notification_details", NotificationDetaillScheme);