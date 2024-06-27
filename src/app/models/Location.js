const mongoose = require("mongoose")

const LocationScheme = mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
})


module.exports = mongoose.model("locations", LocationScheme);