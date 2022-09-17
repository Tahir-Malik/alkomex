const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const cmsPagesSchema = new Schema({
    pageName: { type: String, required: true, unique: true },
    pageContents: { type: String, required: true },
    status: { type: String,  enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('cmspages', cmsPagesSchema);

