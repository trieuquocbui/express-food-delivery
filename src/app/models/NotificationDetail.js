const mongoose = require("mongoose");

const NotificationDetaillScheme = mongoose.Schema({
    notificationId:String,
    employeeId:String,
    status: Boolean
});

module.exports = mongoose.model("price_detail",NotificationDetaillScheme);