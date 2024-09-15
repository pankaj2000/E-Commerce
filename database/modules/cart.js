const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true,
        default: 1
    }
},
    { timestamps: true }
);

const cartModel = mongoose.model('cart', cartSchema);

module.exports = cartModel;