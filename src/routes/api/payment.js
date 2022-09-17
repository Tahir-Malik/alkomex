const express = require('express');
const paymentController = require('../../controllers/payment')
const router = express.Router();
const { Success, Fail } = require('../../services/response')

router
    .post('/', (req, res) => {
        paymentController
            .create_invoice({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'Payment Slip created Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/paymentlists', (req, res) => {
        paymentController
            .getallpayments({})
            .then((data) => {
                res.json(Success(data, 'Payment Slips fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/paymentdetails/:paymentid', (req, res) => {
        paymentController
            .getpayment_details({ paymentid: req.params.paymentid })
            .then((data) => {
                res.json(Success(data, 'Payment Slip details fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router.delete('/:id', paymentController.delete)

module.exports = router;
