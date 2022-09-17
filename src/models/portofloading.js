const mongoose = require('mongoose');

const portofloadingSchema = mongoose.Schema({
    port_code: { type: String },
    port_name: { type: String },
    country_name: { type: String }
})
module.exports = mongoose.model('portofloading', portofloadingSchema, 'portofloadings')