const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    customer_uid: { type: String, default: "" },
    user_name: { type: String },
    email: { type: String },
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    profile_pic: { type: String },
    password: { type: String },
    deleted: { type: Number, default: "0" },
    userType: { type: Number, default: "3" },
}, {
        timestamps: true
    })
module.exports = mongoose.model('UserSchema', UserSchema)


