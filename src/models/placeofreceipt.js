const mongoose = require('mongoose');

const placeofreceiptSchema = mongoose.Schema({
    place_name: { type: String },
    country_name: { type: String }
})
module.exports = mongoose.model('placeofreceipt', placeofreceiptSchema, 'placeofreceipts')