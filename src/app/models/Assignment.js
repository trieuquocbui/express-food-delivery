const mongoose = require("mongoose");

const AssignmentScheme = mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    status: Number,
    assignedAt: {type: Date, default: new Date},
});

module.exports = mongoose.model("assignments",AssignmentScheme);