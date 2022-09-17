const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const constants = require('../constants');

const AdminSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    profileimage: { type: String },
    password: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, {
        timestamps: true
    })

AdminSchema.methods.hash = password => bcrypt.hashSync(password, constants.saltRounds);

AdminSchema.methods.compare = (password, hash) => bcrypt.compareSync(password, hash);

module.exports = mongoose.model('admin', AdminSchema)