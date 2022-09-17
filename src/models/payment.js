const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    payment_slip_UID: { type: String, unique: true },
    payment_UID: { type: String, unique: true },
    payment_number: { type: Number, unique: true },
    client: {
        client_name: { type: String },
        client_uid: { type: String }
    },
    invoice_uid: { type: String },
    amount_received: { type: Number },
    SWIFT_number: { type: String },
    UTR_number: { type: String }
}, {
        timestamps: true
    })
module.exports = mongoose.model('payments', PaymentSchema)
