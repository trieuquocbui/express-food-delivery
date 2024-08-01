const mongoose = require("mongoose")

const LocationScheme = mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    location: {
        type: {
          type: String,
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number], 
          required: true
        }
      },
    timestamp: { type: Date, default: Date.now }
})

LocationScheme.index({ location: '2dsphere' });

module.exports = mongoose.model("locations", LocationScheme);