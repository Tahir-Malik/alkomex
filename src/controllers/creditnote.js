const CreditNoteModel = require('../models/creditnote');
const generateuid = require('../services/generateuid');
const invoiceModel = require('../models/packinglist');

exports.create_creditnote = ({ res, body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let credit_note_data = await CreditNoteModel.find().sort('-credit_note_number').limit(1).exec();
            let { credit_note_uid, credit_note_number } = await generateuid.generateuidtypes({ uiddata: credit_note_data, uidtype: 'creditnote' })
            const creditNoteObj = new CreditNoteModel({
                credit_note_uid: credit_note_uid,
                credit_note_number: credit_note_number,
                client: body.client,
                invoice_uid: body.invoice_uid,
                product_uid: body.product_uid,
                product_batch: body.product_batch,
                reason_for_creditnote: body.reason_for_creditnote,
                qauntity_of_batch: body.qauntity_of_batch,
                credit_amount: body.credit_amount
            })
            let creditnote = await creditNoteObj.save();
            if (!creditnote) {
                throw new Error('Credit note Not created ...');
            }
            await generateandsentcreditnotedoc(res, credit_note_uid);
            resolve(creditnote)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getallcreditnotes = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let creditnotes = await CreditNoteModel.find({}).sort({ "createdAt": -1 });
            resolve(creditnotes)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getcreditnote_details = ({ creditnoteid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let creditnotedetails = await CreditNoteModel.findOne({ credit_note_uid: creditnoteid });
            resolve(creditnotedetails)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getallinvoices = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoices = await invoiceModel.find({ invoice_uid: { $exists: true } }).sort({ "createdAt": -1 });
            resolve(invoices)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getOne = (req, res) => {
    CreditNoteModel.findById(req.params.id)
        .then(cn => {
            if (!cn || cn == null) {
                return res.status(200).send({
                    response: 'Credit Note not found.',
                    success: false
                });
            }
            res.status(200).send({
                data: cn,
                message: "Credit Note fetched Successfully",
                success: true
            });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}

exports.update = (req, res) => {
    let data = {
        client: req.body.client,
        invoice: req.body.invoice,
        product: req.body.product,
        batch_number: req.body.batch_number,
        reason: req.body.reason,
        qauntity_of_batch: req.body.qauntity_of_batch,
        invoice_amount: req.body.invoice_amount
    }
    CreditNoteModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
        .then(cn => {
            if (!cn || cn == null) {
                return res.status(200).send({
                    response: 'Credit not found..',
                    success: false
                });
            }
            res.status(200).send({
                data: cn, message: "Credit Note updated Successfully"
            });
        })
        .catch(err => {
            console.log("Error", err)
            res.status(500).send({ message: "Internal Server Error" })
        })
}

exports.delete = (req, res) => {
    CreditNoteModel.findByIdAndRemove(req.params.id)
        .then(cn => {
            if (!cn || cn == null) {
                return res.status(200).send({
                    response: 'Credit Note not found.',
                });
            }
            res.status(200).send({ message: "Credit Note deleted successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}

function generateandsentcreditnotedoc(res, credit_note_uid) {
    return new Promise(async (resolve, reject) => {
        try {
            let creditnotedata = await CreditNoteModel.findOne({ credit_note_uid: credit_note_uid });
            if (!creditnotedata || creditnotedata == null) {
                throw new Error('Credit Note does not exists.');
            }
            let customerdata = await customerModel.findOne({ customer_uid: creditnotedata.client.client_uid })
            if (!customerdata || customerdata == null) {
                throw new Error('customer does not exists.');
            }
            let dir = `${path.dirname(process.mainModule.filename)}/upload/creditnote_doc`
            let creditnote_document = `creditnote_${creditnotedata.credit_note_uid}_${new Date().getTime()}.pdf`
            let creditnote = `${dir}/${creditnote_document}`;
            let total_price = await inWords((creditnotedata.credit_amount.amount_size).toFixed(2));
            await piModel.findOneAndUpdate({ pi_uid: pi_uid }, { $set: { 'pi_document': pi_document } }, { new: true })
            res.render('proformainvoice', { pi: pidata, customerdata: customerdata, total_price: total_price }, async (err, html) => {
                if (err) {
                    throw new Error('html is not generated.');
                } else {
                    PDFConverter({ html: html, printDelay: 0, fitToPage: false, allowLocalFilesAccess: true }, async (err, pdf) => {
                        if (err) {
                            throw new Error('pdf is not generated.');
                        } else {
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            let stream = fs.createWriteStream(invoice);
                            pdf.stream.pipe(stream);
                            attachments = [{
                                filename: pi_document,
                                contentType: 'application/pdf',
                                path: `${path.dirname(process.mainModule.filename)}/upload/proformainvoice/${pi_document}`
                            }]
                            if (sender_type == 'Admin') {
                                await Mailer.send(process.env.ADMINEMAIL, 'Proforma Invoice', `Please find the below attachment for ${pidata.pi_uid}`, attachments);
                            } else {
                                await Mailer.send(customerdata.basic_details.email, 'Proforma Invoice', `Please find the below attachment for ${pidata.pi_uid}`, attachments);
                            }
                            resolve(pidata)
                        }
                    })
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function inWords(num) {
    var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Sighteen ', 'Nineteen '];
    var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    var numarray = num.toString().split('.');
    num = numarray[0];
    dot = numarray[1];
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    d = ('000' + dot).substr(-2).match(/^(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    str += (d[1] != 0) ? ((d[1] != '') ? 'And ' : '') + (a[Number(d[1])] || b[d[1][0]] + ' ' + a[d[1][1]]) + 'Cent Only ' : 'Only';
    return str;
}