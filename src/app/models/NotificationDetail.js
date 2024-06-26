const mongoose = require("mongoose");

const NotificationDetaillScheme = mongoose.Schema({
    notificationId: String,
    accountId: String,
    status: Boolean
});

module.exports = mongoose.model("notification_details", NotificationDetaillScheme);