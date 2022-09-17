const express = require('express');
const invoiceController = require('../../controllers/invoice')
const router = express.Router();
const { Success, Fail } = require('../../services/response')
const uploadFile = require('../../services/uploadFile');


router
    .patch('/:id', (req, res) => {
        invoiceController
            .create_invoice({ res: res, packinglistid: req.params.id, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Invoice generated successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/updateinvoice/:id', (req, res) => {
        invoiceController
            .update_proformainvoice({ res: res, packinglistid: req.params.id, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Invoice updated successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/invoicelists', (req, res) => {
        invoiceController
            .getallinvoices({})
            .then((data) => {
                res.json(Success(data, 'Invoice lists data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/invoices', (req, res) => {
        invoiceController
            .get_invoices({ query: req.query })
            .then((data) => {
                res.json(Success(data, 'Invoice lists data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/uploadadmindoc/:invoiceid', uploadFile.upload.fields([{ name: 'packing_doc', maxCount: 1 }, { name: 'invoice_doc', maxCount: 1 }, { name: 'coa_doc', maxCount: 1 }, { name: 'certificate_of_origin_doc', maxCount: 1 }, { name: 'bill_of_lading_doc', maxCount: 1 }, { name: 'insurance_doc', maxCount: 1 }, { name: 'airway_bill_doc', maxCount: 1 }]), (req, res) => {
        let packing_doc = '', coa_doc = '', invoice_doc = '', certificate_of_origin_doc = '', bill_of_lading_doc = '', insurance_doc = '', airway_bill_doc = '';
        if (req.files && req.files['packing_doc']) {
            packing_doc = req.files['packing_doc'][0].filename
        }
        if (req.files && req.files['coa_doc']) {
            coa_doc = req.files['coa_doc'][0].filename
        }
        if (req.files && req.files['invoice_doc']) {
            invoice_doc = req.files['invoice_doc'][0].filename
        }
        if (req.files && req.files['certificate_of_origin_doc']) {
            certificate_of_origin_doc = req.files['certificate_of_origin_doc'][0].filename
        }
        if (req.files && req.files['bill_of_lading_doc']) {
            bill_of_lading_doc = req.files['bill_of_lading_doc'][0].filename
        }
        if (req.files && req.files['insurance_doc']) {
            insurance_doc = req.files['insurance_doc'][0].filename
        }
        if (req.files && req.files['airway_bill_doc']) {
            airway_bill_doc = req.files['airway_bill_doc'][0].filename
        }
        invoiceController
            .upload_admindoc({ invoiceid: req.params.invoiceid, packing_doc: packing_doc, coa_doc: coa_doc, invoice_doc: invoice_doc, certificate_of_origin_doc: certificate_of_origin_doc, bill_of_lading_doc: bill_of_lading_doc, insurance_doc: insurance_doc, airway_bill_doc: airway_bill_doc })
            .then((data) => {
                res.json(Success(data, 'Invoice Admin doc uploaded Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/uploadclientdoc/:invoiceid', uploadFile.upload.fields([{ name: 'packing_doc', maxCount: 1 }, { name: 'invoice_doc', maxCount: 1 }, { name: 'coa_doc', maxCount: 1 }, { name: 'certificate_of_origin_doc', maxCount: 1 }, { name: 'bill_of_lading_doc', maxCount: 1 }, { name: 'insurance_doc', maxCount: 1 }, { name: 'airway_bill_doc', maxCount: 1 }]), (req, res) => {
        let packing_doc = '', coa_doc = '', invoice_doc = '', certificate_of_origin_doc = '', bill_of_lading_doc = '', insurance_doc = '', airway_bill_doc = '';
        if (req.files && req.files['packing_doc']) {
            packing_doc = req.files['packing_doc'][0].filename
        }
        if (req.files && req.files['coa_doc']) {
            coa_doc = req.files['coa_doc'][0].filename
        }
        if (req.files && req.files['invoice_doc']) {
            invoice_doc = req.files['invoice_doc'][0].filename
        }
        if (req.files && req.files['certificate_of_origin_doc']) {
            certificate_of_origin_doc = req.files['certificate_of_origin_doc'][0].filename
        }
        if (req.files && req.files['bill_of_lading_doc']) {
            bill_of_lading_doc = req.files['bill_of_lading_doc'][0].filename
        }
        if (req.files && req.files['insurance_doc']) {
            insurance_doc = req.files['insurance_doc'][0].filename
        }
        if (req.files && req.files['airway_bill_doc']) {
            airway_bill_doc = req.files['airway_bill_doc'][0].filename
        }
        invoiceController
            .upload_clientdoc({ invoiceid: req.params.invoiceid, packing_doc: packing_doc, coa_doc: coa_doc, invoice_doc: invoice_doc, certificate_of_origin_doc: certificate_of_origin_doc, bill_of_lading_doc: bill_of_lading_doc, insurance_doc: insurance_doc, airway_bill_doc: airway_bill_doc })
            .then((data) => {
                res.json(Success(data, 'Invoice client doc uploaded Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/uploadsignedcreditnote/:invoiceid', uploadFile.upload.fields([{ name: 'rejection_docs', maxCount: 4 }, { name: 'signed_creditnote_doc', maxCount: 1 }]), (req, res) => {
        let signed_creditnote_doc = '';
        if (req.files['signed_creditnote_doc']) {
            signed_creditnote_doc = req.files['signed_creditnote_doc'][0].filename
        }
        invoiceController
            .uploadsigned_creditnote({ invoiceid: req.params.invoiceid, body: req.body, files: req.files['rejection_docs'], signedcreditnote_doc: signed_creditnote_doc })
            .then((data) => {
                res.json(Success(data, 'Signed creditnote doc uploaded Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/getsignedcreditnotes/:invoiceid', (req, res) => {
        invoiceController
            .getsigned_creditnotes({ invoiceid: req.params.invoiceid })
            .then((data) => {
                res.json(Success(data, 'Signed creditnote doc fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/getmanagepayments/:invoiceid', (req, res) => {
        invoiceController
            .getmanagepayments({ invoiceid: req.params.invoiceid })
            .then((data) => {
                res.json(Success(data, 'manage payments fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/addshippedinfo/:invoiceid', (req, res) => {
        invoiceController
            .Add_shipped_info({ invoiceid: req.params.invoiceid, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Invoice shipped info added Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/invoicedetails/:invoiceid', (req, res) => {
        invoiceController
            .getinvoice_details({ invoiceid: req.params.invoiceid })
            .then((data) => {
                res.json(Success(data, 'Invoice details fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/getinvoiceuids/:client_uid', (req, res) => {
        invoiceController
            .getinvoice_uids({ client_uid: req.params.client_uid })
            .then((data) => {
                res.json(Success(data, 'Invoices returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/getinvoiceproducts', (req, res) => {
        invoiceController
            .getinvoice_products({ client_uid: req.query.client_uid, invoice_uid: req.query.invoice_uid })
            .then((data) => {
                res.json(Success(data, 'Invoice products returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/getinvoiceproductbatches', (req, res) => {
        invoiceController
            .getinvoice_product_batches({ invoice_uid: req.query.invoice_uid, product_id: req.query.product_id })
            .then((data) => {
                res.json(Success(data, 'Invoice products batches returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


module.exports = router;

