const express = require('express');
const uploadFile = require('../../services/uploadFile');
const productController = require('../../controllers/product')
const router = express.Router();
const { Success, Fail } = require('../../services/response')

router
    .post('/', uploadFile.upload.single('file'), uploadFile.validate, (req, res) => {
        productController
            .create_registered_products({ file: req.file.filename })
            .then((data) => {
                res.json(Success(data, 'Excel file successfully loaded'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .post('/single', (req, res) => {
        productController
            .createSingle_Product({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'Product saved Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/', (req, res) => {
        productController
            .get_all_products({ query: req.query })
            .then((data) => {
                res.json(Success(data, 'Products fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/:id', (req, res) => {
        productController
            .getOne_product({ productid: req.params.id })
            .then((data) => {
                res.json(Success(data, 'Product fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })


router
    .patch('/:id', (req, res) => {
        productController
            .update_product({ productid: req.params.id, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Product updated Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .delete('/:product_uid', (req, res) => {
        productController
            .delete_product({ product_uid: req.params.product_uid })
            .then((data) => {
                res.json(Success(data, 'Product deleted successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

module.exports = router;

