const mongoose = require('mongoose');

const ProductScheme = mongoose.Schema({
    _id:String,
    name:{
        type: String,
        require: true,
    },
    thumbnail:String,
    description:String,
    sold:Number,
    quantity:Number,
    status:Boolean,
    featured:Boolean
});

module.exports = mongoose.model("product", ProductScheme);
