const express = require('express');
const packingListController = require('../../controllers/packinglist')
const router = express.Router();
const { Success, Fail } = require('../../services/response')

router
    .post('/', (req, res) => {
        packingListController
            .create_packinglist({ res: res, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Packing List created Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .patch('/:packinglistid', (req, res) => {
        packingListController
            .update_packinglist({ res: res, body: req.body, packinglistid: req.params.packinglistid })
            .then((data) => {
                res.json(Success(data, 'Packing List updated Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/', (req, res) => {
        packingListController
            .get_packinglist({})
            .then((data) => {
                res.json(Success(data, 'Packing lists data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/placeofreceipts', (req, res) => {
        packingListController
            .getplaceofreceipts({})
            .then((data) => {
                res.json(Success(data, 'Place of receipts Lists data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/portofloadings', (req, res) => {
        packingListController
            .getportofloadings({})
            .then((data) => {
                res.json(Success(data, 'Port of loading data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .get('/productlists/:client_uid', (req, res) => {
        packingListController
            .getproductlists({ client_uid: req.params.client_uid })
            .then((data) => {
                res.json(Success(data, 'Product lists data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/:id', (req, res) => {
        packingListController
            .getOne_packinglist({ packingid: req.params.id })
            .then((data) => {
                res.json(Success(data, 'Packing List data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router.delete('/:id', packingListController.delete)

module.exports = router;


