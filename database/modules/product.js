const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    user_id: {
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
    ProductQuantity:{
        type: Number,
        required: true,
        default: 1
    },
    ProductDescription:{
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const productModel = mongoose.model('product', productSchema);

module.exports = productModel;