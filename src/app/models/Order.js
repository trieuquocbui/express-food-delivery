const mongoose = require("mongoose");
const OrderDetail = require('../models/OrderDetail.js');

const OrderScheme = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    totalAmount: Number,
    fullName:  String,
    phoneNumber:  String,
    shipping:  Number,
    status: Number,
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
    address1: String,
    address2: String,
    createdAt: Date,
    assignmented: Boolean,
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order_details' }]
});

OrderScheme.index({ location: '2dsphere' });

module.exports = mongoose.model("orders", OrderScheme);