const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const constants = require('../constants');

const CustomerSchema = mongoose.Schema({
    customer_uid: { type: String, unique: true },
    customer_number: { type: Number, unique: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: "Active" },
    basic_details: {
        registered_name: { type: String },
        country: { type: String },
        vat_number: { type: String },
        ports_of_discharge: [{ type: String }],
        address: { type: String },
        profileimage: { type: String },
        email: {
            type: String, lowercase: true, required: true, unique: true, trim: true
            //validate: [Email, 'Please provide a valid email address']
        },
        password: { type: String }
    },
    notify_party: {
        registered_name: { type: String },
        country: { type: String },
        vat_number: { type: String },
        address: { type: String }
    },
    client_poc: [{
        name: { type: String },
        mobile_number: { type: String },
        email_address: { type: String }
    }],
    additional_details: {
        currency_of_transaction: { type: String }
    }
}, {
        timestamps: true
    })

CustomerSchema.methods.hash = password => bcrypt.hashSync(password, constants.saltRounds);

CustomerSchema.methods.compare = (password, hash) => bcrypt.compareSync(password, hash);

module.exports = mongoose.model('customer', CustomerSchema, 'customers')
