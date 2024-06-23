const mongoose = require("mongoose");

const AssignmentScheme = mongoose.Schema({
    adminId: String,
    employeeId: String,
    OrderId: String,
    status: Number,
    assignedAt: Date,
});

module.exports = mongoose.model("assignment",AssignmentScheme);