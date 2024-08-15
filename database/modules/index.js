module.exports.init = function () {
    const mongoose = require("mongoose");
    mongoose.connect('mongodb+srv://Pankaj:1223334444@cluster0.k0mo0k1.mongodb.net/e-commerce?retryWrites=true&w=majority').then(function () {
        console.log("DB is ONNNNNNNNNNN");
    }).catch(function () {
        console.log("DB connect hi na ho raha");
    })
}