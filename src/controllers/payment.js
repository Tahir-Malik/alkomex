const paymentModel = require('../models/payment');
const generateuid = require('../services/generateuid');

exports.create_invoice = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let payment_slip_data = await paymentModel.find({ "payment_slip_UID": { $exists: true, $ne: null } }).sort('-payment_number').limit(1).exec();
            let { payment_slip_UID, payment_UID, payment_number } = await generateuid.generateuidtypes({ uiddata: payment_slip_data, uidtype: 'paymentslip' })
            const paymentObj = new paymentModel({
                payment_slip_UID: payment_slip_UID,
                payment_UID: payment_UID,
                payment_number: payment_number,
                client: body.client,
                invoice_uid: body.invoice_uid,
                amount_received: body.amount_received,
                SWIFT_number: body.SWIFT_number,
                UTR_number: body.UTR_number
            })
            let payment = await paymentObj.save();
            if (!payment || payment == null) {
                throw new Error('Payment not added...');
            }
            resolve(payment)
        } catch (err) {
            reject(err)
        }
    })
}


exports.getallpayments = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let payments = await paymentModel.find({}).sort({ "createdAt": -1 });
            resolve(payments)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getpayment_details = ({ paymentid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let paymentdetails = await paymentModel.findOne({ payment_slip_UID: paymentid });
            resolve(paymentdetails)
        } catch (err) {
            reject(err)
        }
    })
}

exports.delete = (req, res) => {
    paymentModel.findByIdAndRemove(req.params.id)
        .then(packingList => {
            if (!packingList || packingList == null) {
                return res.status(200).send({
                    response: 'Invoice not found.',
                });
            }
            res.status(200).send({ message: "Invoice deleted successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}