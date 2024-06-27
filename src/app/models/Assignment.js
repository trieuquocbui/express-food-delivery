const mongoose = require("mongoose");

const AssignmentScheme = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    OrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    status: Number,
    assignedAt: {type: Date, default: new Date},
});

module.exports = mongoose.model("assignments",AssignmentScheme);