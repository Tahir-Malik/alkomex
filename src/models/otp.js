const mongoose = require('mongoose');
const constants = require('../constants');
const moment = require('moment');

const { Schema } = mongoose;

const schema = new Schema({
    customerid: { type: Schema.Types.ObjectId, ref: 'customer' },
    adminid: { type: Schema.Types.ObjectId, ref: 'admin' },
    otp: { type: Number },
    type: { type: String, enum: ['Admin', 'Customer'], default: null }
}, { timestamps: true });

schema.methods.isExpired = async function (_id, type) {
    let otp;
    if (type == 'Admin') {
        otp = await this.model('otp').findOne({ adminid: _id });
    } else {
        otp = await this.model('otp').findOne({ customerid: _id });
    }
    let expiresAt = moment(otp.createdAt).add(constants.otpExpiresIn, 'ms');
    let expired = await moment().isSameOrAfter(expiresAt);
    if (expired) {
        return true;
    } else {
        return false;
    }
}

module.exports = mongoose.model('otp', schema);
