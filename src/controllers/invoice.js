const invoiceModel = require('../models/packinglist');
const CreditNoteModel = require('../models/creditnote');
const paymentModel = require('../models/payment');
const generateuid = require('../services/generateuid');
const PDFConverter = require("phantom-html-to-pdf")({});
const customerModel = require('../models/customer')
const Mailer = require('../services/mailer')
const fs = require('fs')
const path = require('path');
const async = require("async");

exports.create_invoice = ({ res, packinglistid, body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoice_data = await invoiceModel.find({ "invoice_uid": { $exists: true, $ne: null } }).sort('-invoice_number').limit(1).exec();
            let { invoice_uid, invoice_number } = await generateuid.generateuidtypes({ uiddata: invoice_data, uidtype: 'invoice' })
            let data = {
                invoice_uid: invoice_uid,
                invoice_number: invoice_number,
                gross_price: body.gross_price,
                insurance: body.insurance,
                freight: body.freight,
                total_price: body.total_price,
                credit_price: body.credit_price
            }
            let invoice = await invoiceModel.findByIdAndUpdate(packinglistid, { $set: data }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice is not found..');
            }
            await generateandsentinvoicedoc(res, invoice.invoice_uid);
            resolve(invoice)
        } catch (err) {
            reject(err)
        }
    })
}

exports.update_proformainvoice = ({ res, packinglistid, body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = {
                gross_price: body.gross_price,
                insurance: body.insurance,
                freight: body.freight,
                total_price: body.total_price,
                credit_price: body.credit_price
            }
            let invoice = await invoiceModel.findByIdAndUpdate(packinglistid, { $set: data }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice is not found..');
            }
            await generateandsentinvoicedoc(res, invoice.invoice_uid);
            resolve(invoice)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getinvoice_uids = ({ client_uid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoices = await invoiceModel.find({ $and: [{ 'client.client_uid': client_uid }, { invoice_uid: { $exists: true } }] }, { invoice_uid: 1 }).sort({ "createdAt": -1 });
            resolve(invoices)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getallinvoices = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoices = await invoiceModel.find({ invoice_uid: { $exists: true } }, {}).sort({ "createdAt": -1 });
            resolve(invoices)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getinvoice_products = ({ client_uid, invoice_uid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoices = await invoiceModel.distinct('products.product_id', { $and: [{ 'client.client_uid': client_uid }, { invoice_uid: { $exists: true } }, { invoice_uid: invoice_uid }] });
            resolve(invoices)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getinvoice_product_batches = ({ invoice_uid, product_id }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoices = await invoiceModel.aggregate([{ $match: { $and: [{ invoice_uid: { $exists: true } }, { invoice_uid: invoice_uid }] } }, { $unwind: "$products" }, { $match: { 'products.product_id': product_id } }, { $group: { _id: "$products.batch_number" } }, { $group: { _id: "batch_number", distinctbatchs: { $addToSet: "$_id" } } }]);
            if (invoices.length > 0) {
                resolve(invoices[0].distinctbatchs)
            } else {
                resolve(invoices)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.get_invoices = ({ query }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoicequery = await invoiceQuery(query);
            let invoice = await invoiceModel.aggregate(invoicequery);
            if (!invoice || invoice == null) {
                throw new Error('PI does not exists.');
            } else {
                resolve(invoice)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.upload_admindoc = ({ invoiceid, packing_doc, coa_doc, invoice_doc, certificate_of_origin_doc, bill_of_lading_doc, insurance_doc, airway_bill_doc }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let admindoc = {};
            if (packing_doc != '') {
                admindoc = Object.assign({ 'admin_document.packinglist_doc': packing_doc }, admindoc);
            }
            if (coa_doc != '') {
                admindoc = Object.assign({ 'admin_document.CoA_doc': coa_doc }, admindoc);
            }
            if (invoice_doc != '') {
                admindoc = Object.assign({ 'admin_document.productinvoice_doc': invoice_doc }, admindoc);
            }
            if (certificate_of_origin_doc != '') {
                admindoc = Object.assign({ 'admin_document.certificate_of_origin_doc': certificate_of_origin_doc }, admindoc);
            }
            if (bill_of_lading_doc != '') {
                admindoc = Object.assign({ 'admin_document.bill_of_lading_doc': bill_of_lading_doc }, admindoc);
            }
            if (insurance_doc != '') {
                admindoc = Object.assign({ 'admin_document.insurance_doc': insurance_doc }, admindoc);
            }
            if (airway_bill_doc != '') {
                admindoc = Object.assign({ 'admin_document.airway_bill_doc': airway_bill_doc }, admindoc);
            }
            let invoice = await invoiceModel.findOneAndUpdate({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] }, { $set: admindoc }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice does not exists.');
            } else {
                resolve(invoice)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.upload_clientdoc = ({ invoiceid, packing_doc, coa_doc, invoice_doc, certificate_of_origin_doc, bill_of_lading_doc, insurance_doc, airway_bill_doc }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clientdoc = {};
            if (packing_doc != '') {
                clientdoc = Object.assign({ 'client_document.packinglist_doc': packing_doc }, clientdoc);
            }
            if (coa_doc != '') {
                clientdoc = Object.assign({ 'client_document.CoA_doc': coa_doc }, clientdoc);
            }
            if (invoice_doc != '') {
                clientdoc = Object.assign({ 'client_document.productinvoice_doc': invoice_doc }, clientdoc);
            }
            if (certificate_of_origin_doc != '') {
                clientdoc = Object.assign({ 'client_document.certificate_of_origin_doc': certificate_of_origin_doc }, clientdoc);
            }
            if (bill_of_lading_doc != '') {
                clientdoc = Object.assign({ 'client_document.bill_of_lading_doc': bill_of_lading_doc }, clientdoc);
            }
            if (insurance_doc != '') {
                clientdoc = Object.assign({ 'client_document.insurance_doc': insurance_doc }, clientdoc);
            }
            if (airway_bill_doc != '') {
                clientdoc = Object.assign({ 'client_document.airway_bill_doc': airway_bill_doc }, clientdoc);
            }
            let invoice = await invoiceModel.findOneAndUpdate({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] }, { $set: clientdoc }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice does not exists.');
            } else {
                resolve(invoice)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.Add_shipped_info = ({ invoiceid, body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let shipped_info = {
                'shipped_info.tracking_number': body.tracking_number,
                'shipped_info.date_of_courier': body.date_of_courier,
                'shipped_info.courires_agency': body.courires_agency
            }
            let invoice = await invoiceModel.findOneAndUpdate({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] }, { $set: shipped_info }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice does not exists.');
            } else {
                resolve(invoice)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.getinvoice_details = ({ invoiceid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let invoicedetails = await invoiceModel.aggregate([{ $match: { $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] } }, { $project: { invoice_uid: 1, client: 1, products: 1, workstatus_date: 1, estimated_arrival_date: 1, payment_due_date: 1, shipped_onboard_date: 1, total_products: { $size: "$products" }, total_price: 1, status: 1, admin_document: 1, client_document: 1, shipped_info: 1, gross_price: 1, insurance: 1, freight: 1, total_price: 1, credit_price: 1, status: 1, mode_of_shipping: 1, place_of_receipt: 1, port_of_loading: 1, port_of_discharge: 1, test_of_goods_info: 1 } }]);
            resolve(invoicedetails)
        } catch (err) {
            reject(err)
        }
    })
}


exports.uploadsigned_creditnote = ({ invoiceid, body, files, signedcreditnote_doc }) => {
    return new Promise(async (resolve, reject) => {
        try {
            body = JSON.parse(body.data);
            let rejection_files = [];
            let signedcreditnote_info = {
                'credit_note_uid': body.credit_note_uid,
                'doc_name': signedcreditnote_doc
            }
            if (files) {
                for (const file of files) {
                    rejection_files.push({ file_name: file.filename })
                }
            }
            let invoice = await invoiceModel.findOneAndUpdate({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }, { 'products.product_id': body.product_id }] }, { $push: { test_of_goods_info: { product_id: body.product_id, client_product_code: body.client_product_code, batch_number: body.batch_number, status: 'Rejected', rejection_files: rejection_files, signed_creditnote_info: signedcreditnote_info } } }, { new: true });
            if (!invoice || invoice == null) {
                throw new Error('Invoice Product does not exists.');
            } else {
                await CreditNoteModel.findOneAndUpdate({ $and: [{ invoice_uid: invoiceid }, { credit_note_uid: body.credit_note_uid }, { product_uid: body.product_id }] }, { $set: { status: 'Approved', signed_creditnote_doc: signedcreditnote_doc } });
                resolve(invoice)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.getsigned_creditnotes = ({ invoiceid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let signed_creditnote_doc = [], totalcreditamount = 0;
            let signed_creditnotes = await invoiceModel.findOne({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] }, { total_price: 1, 'test_of_goods_info.signed_creditnote_info': 1 }).sort({ "createdAt": -1 });
            if (signed_creditnotes.test_of_goods_info.length > 0) {
                async.each(signed_creditnotes.test_of_goods_info, function (creditnote, callback) {
                    if (creditnote.signed_creditnote_info) {
                        signed_creditnote_doc.push({ credit_note_uid: creditnote.signed_creditnote_info.credit_note_uid, signed_creditnote_doc: creditnote.signed_creditnote_info.doc_name })
                    }
                    callback(null);
                }, async function (err) {
                    let total_creditamount = await CreditNoteModel.aggregate([{ $match: { $and: [{ invoice_uid: invoiceid }, { "status": "Approved" }] } }, { "$group": { "_id": "$invoice_uid", "credit_amount": { "$sum": "$credit_amount.amount_size" } } }]);
                    if (total_creditamount && total_creditamount[0]) {
                        totalcreditamount = signed_creditnotes.total_price - total_creditamount[0].credit_amount;
                    }
                    resolve({ signed_creditnote_doc: signed_creditnote_doc, total_invoice_amount: signed_creditnotes.total_price, updated_invoice_amount: totalcreditamount })
                })
            } else {
                resolve({ signed_creditnote_doc: signed_creditnote_doc, total_invoice_amount: signed_creditnotes.total_price, updated_invoice_amount: signed_creditnotes.total_price })
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.getmanagepayments = ({ invoiceid }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let totalcreditamount = 0; totalamount_received = 0
            let invoice = await invoiceModel.findOne({ $and: [{ invoice_uid: invoiceid }, { invoice_uid: { $exists: true } }] }, { total_price: 1, shipped_onboard_date: 1 }).sort({ "createdAt": -1 });
            let total_creditamount = await CreditNoteModel.aggregate([{ $match: { $and: [{ invoice_uid: invoiceid }, { "status": "Approved" }] } }, { "$group": { "_id": "$invoice_uid", "credit_amount": { "$sum": "$credit_amount.amount_size" } } }]);
            if (total_creditamount && total_creditamount[0]) {
                totalcreditamount = invoice.total_price - total_creditamount[0].credit_amount;
            }
            let amount_received = await paymentModel.aggregate([{ $match: { invoice_uid: invoiceid } }, { "$group": { "_id": "$invoice_uid", "amount_received": { "$sum": "$amount_received" } } }]);
            if (amount_received && amount_received[0]) {
                totalamount_received = amount_received[0].amount_received;
            }
            let pending_amount = totalcreditamount - totalamount_received;
            resolve({ due_date_of_payment: invoice.shipped_onboard_date, total_invoice_amount: invoice.total_price, total_creditamount: totalcreditamount, total_amount_due: totalcreditamount, totalamount_received: totalamount_received, pending_amount: pending_amount })
        } catch (err) {
            reject(err)
        }
    })
}

function invoiceQuery(query) {
    return new Promise(async (resolve, reject) => {
        try {
            let { invoicelisttype } = query; let querydata;
            if (invoicelisttype && invoicelisttype != '' && invoicelisttype == 'invoicelistcount') {
                querydata = [{ $match: { $or: [{ status: 'OpenInvoice' }, { status: 'CloseInvoice' }] } }, { "$group": { "_id": 0, "openinvoice_count": { "$sum": { "$cond": [{ "$eq": ["$status", "OpenInvoice"] }, 1, 0] } }, "closeinvoice_count": { "$sum": { "$cond": [{ "$eq": ["$status", "CloseInvoice"] }, 1, 0] } } } }, { "$project": { "_id": 0, "OpenInvoice": "$openinvoice_count", "CloseInvoice": "$closeinvoice_count" } }]
            } else if (invoicelisttype && invoicelisttype != '' && invoicelisttype == 'openinvoicelist') {
                querydata = [{ $match: { status: 'OpenInvoice' } }, { $project: { invoice_uid: 1, client: 1, estimated_arrival_date: 1, payment_due_date: 1, total_products: { $size: "$products" }, total_price: 1, status: 1 } }]
            } else {
                querydata = [{ $match: { $or: [{ status: 'Pending' }, { status: 'Approved' }] } }, { $project: { client_po_number: 1, pi_uid: 1, client: 1, date_of_issue_of_po: 1, total_products: { $size: "$products" }, status: 1 } }]
            }
            resolve(querydata);
        } catch (err) {
            reject(err);
        }
    })
}

function generateandsentinvoicedoc(res, invoice_uid) {
    return new Promise(async (resolve, reject) => {
        try {
            let invoicedata = await invoiceModel.findOne({ invoice_uid: invoice_uid })
            if (!invoicedata || invoicedata == null) {
                throw new Error('invoice does not exists.');
            }
            let customerdata = await customerModel.findOne({ customer_uid: invoicedata.client.client_uid })
            if (!customerdata || customerdata == null) {
                throw new Error('customer does not exists.');
            }
            let dir = `${path.dirname(process.mainModule.filename)}/upload/invoice`
            let invoice_document = `invoice_${invoicedata.invoice_uid}_${new Date().getTime()}.pdf`
            let invoice = `${dir}/${invoice_document}`;
            let total_price = await inWords((invoicedata.total_price).toFixed(2));
            let total_val = await generateinvoiceproducts(invoicedata);
            await invoiceModel.findOneAndUpdate({ $and: [{ invoice_uid: invoice_uid }, { invoice_uid: { $exists: true } }] }, { $set: { 'admin_document.productinvoice_doc': invoice_document } }, { new: true })
            res.render('invoice', { invoice: invoicedata, customerdata: customerdata, total_price: total_price, total_val: total_val }, async (err, html) => {
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
                                filename: invoice_document,
                                contentType: 'application/pdf',
                                path: `${path.dirname(process.mainModule.filename)}/upload/invoice/${invoice_document}`
                            }]
                            await Mailer.send(process.env.ADMINEMAIL, 'Invoice', `Please find the below attachment for ${invoicedata.invoice_uid}`, attachments);
                            resolve(invoicedata)
                        }
                    })
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}

async function generateinvoiceproducts(invoice) {
    return new Promise(async (resolve, reject) => {
        try {
            let supplierorderno = []; let buyerorderno = []; let total_quantity = 0; let units = []; let products = []; let cartonsNo = 1; let total_carton = 0;
            async.each(invoice.products, function (product, callback) {
                if (supplierorderno.indexOf(product.pi_uid) < 0) {
                    supplierorderno.push(product.pi_uid);
                }
                if (buyerorderno.indexOf(product.client_po_number) < 0) {
                    buyerorderno.push(product.client_po_number)
                }
                if (units.indexOf(product.unit_of_billing) < 0) {
                    units.push(product.unit_of_billing);
                }
                total_quantity += product.quantity;
                let no_of_pkgs = '';
                total_carton += product.total_packing_carton;
                no_of_pkgs = no_of_pkgs.concat(cartonsNo).concat(' To ').concat(total_carton);
                cartonsNo += product.total_packing_carton;
                products.push({ total_packing_carton: product.total_packing_carton, no_of_pkgs: no_of_pkgs, complete_packaging_profile: product.complete_packaging_profile, client_product_code: product.client_product_code, batch_number: product.batch_number, manufacturing_date: product.manufacturing_date, expiry_date: product.expiry_date, hsn_code: product.hsn_code, quantity: product.quantity, unit_of_billing: product.unit_of_billing, price: product.price, amount: product.amount })
                callback(null)
            }, async function (err) {
                if (!err) {
                    resolve({ products: products, supplierorderno: supplierorderno.join(), units: units.join('/'), buyerorderno: buyerorderno.join(), total_quantity: total_quantity })
                } else {
                    throw new Error(err);
                }
            }
            );
            resolve(invoice)
        } catch (err) {
            reject(err)
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