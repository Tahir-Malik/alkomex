const express = require('express');
const piUseCase = require('../../controllers/pi');
const uploadFile = require('../../services/uploadFile');
const router = express.Router();
const path = require('path');
const { Success, Fail } = require('../../services/response')


router
    .post('/', uploadFile.upload.single('media'), uploadFile.validate, (req, res) => {
        piUseCase
            .create_proformainvoice({ res: res, body: req.body, file: req.file })
            .then((data) => {
                res.json(Success(data, 'Performa Invoice created Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/sendpiemail/:pi_uid', (req, res) => {
        piUseCase
            .sendEmailProformaInvoice({ res: res, pi_uid: req.params.pi_uid })
            .then((data) => {
                res.json(Success(data, 'Performa Invoice created Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .patch('/uploadsignedpi/:pi_uid', uploadFile.upload.single('signedpi'), (req, res) => {
        piUseCase
            .uploadsignedpidoc({ pi_uid: req.params.pi_uid, file: req.file })
            .then((data) => {
                res.json(Success(data, 'Signed PI uploaded Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/dashboard', (req, res) => {
        piUseCase
            .getallpri_post_order({})
            .then((data) => {
                res.json(Success(data, 'All Orders returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/download/doc', (req, res) => {
        let { doc_name, doc_type } = req.query; let pathname = '';
        if (doc_type == 'podoc') {
            pathname = './upload/podoc';
        } else if (doc_type == 'signedpi') {
            pathname = './upload/signedpi';
        } else if (doc_type == 'invoice') {
            pathname = './upload/invoice';
        } else if (doc_type == 'orderstatusdoc') {
            pathname = './upload/orderstatusfiles';
        } else if (doc_type == 'coadoc') {
            pathname = './upload/CoA_doc';
        } else if (doc_type == 'proformainvoice') {
            pathname = './upload/proformainvoice';
        } else if (doc_type == 'packinglist') {
            pathname = './upload/packinglist';
        } else if (doc_type == 'bill_of_lading_doc') {
            pathname = './upload/bill_of_lading_doc';
        } else if (doc_type == 'insurance_doc') {
            pathname = './upload/insurance_doc';
        } else if (doc_type == 'certificate_of_origin_doc') {
            pathname = './upload/certificate_of_origin_doc';
        } else if (doc_type == 'airwaybill_doc') {
            pathname = './upload/airwaybill_doc';
        }
        const dir = path.join(path.dirname(require.main.filename), pathname)
        var docpath = dir + '/' + doc_name;
        res.sendFile(docpath);
    })


router
    .get('/:pi_uid/:piordertype', (req, res) => {
        piUseCase
            .getPIdetails({ pi_uid: req.params.pi_uid, piordertype: req.params.piordertype })
            .then((data) => {
                res.json(Success(data, 'PI details returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/', (req, res) => {
        piUseCase
            .getallPIs({ query: req.query })
            .then((data) => {
                res.json(Success(data, 'All PIs returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .patch('/:id', uploadFile.upload.single('media'), (req, res) => {
        piUseCase
            .update_proformainvoice({ res: res, body: req.body, file: req.file, pi_uid: req.params.id })
            .then((data) => {
                res.json(Success(data, 'Performa Invoice updated Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .patch('/orderstatus/:id/:actiontype', uploadFile.upload.fields([{ name: 'files', maxCount: 10 }, { name: 'coa_doc', maxCount: 1 }]), (req, res) => {
        let coa_doc = '';
        if (req.files['coa_doc']) {
            coa_doc = req.files['coa_doc'][0].filename
        }
        piUseCase
            .updateOrderStatus({ body: req.body, files: req.files['files'], coa_doc: coa_doc, productId: req.params.id, actiontype: req.params.actiontype })
            .then((data) => {
                res.json(Success(data, 'Performa Invoice Order Status updated Successfullyy'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


module.exports = router;
