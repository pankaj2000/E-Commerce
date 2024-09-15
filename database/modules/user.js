const mongoose = require("mongoose");

module.exports.userRoleEnums = {
    admin:1,
    customer:2
}


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        required: true
    },
    userType:{
        type: Number,
        required: true
    }
},
    { timestamps: true }
);

const userModel = mongoose.model('user', userSchema);

module.exports.model = userModel;