const mongoose = require('mongoose');

const CreditNote = mongoose.Schema({
    credit_note_uid: { type: String },
    credit_note_number: { type: Number },
    client: {
        client_name: { type: String },
        client_uid: { type: String }
    },
    invoice_uid: { type: String },
    product_uid: { type: String },
    product_batch: [{
        batch_number: { type: String }
    }],
    reason_for_creditnote: { type: String },
    qauntity_of_batch: {
        batch_type: { type: String, enum: ['EntireBatch', 'PartialBatch'] },
        batch_size: { type: Number, default: 0 }
    },
    credit_amount: {
        amount_type: { type: String, enum: ['Discount', 'CreditValue'] },
        amount_size: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    signed_creditnote_doc: { type: String }
}, {
        timestamps: true
    })
module.exports = mongoose.model('creditnote', CreditNote)
