const express = require('express');
const customerController = require('../../controllers/customer');
const router = express.Router();
const uploadFile = require('../../services/uploadFile');
const { Success, Fail } = require('../../services/response')

router
    .post('/', (req, res) => {
        customerController
            .create_customer({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'Customer created Successfully'))
            })
            .catch((error) => {
                if (error.message.includes("ValidationError")) {
                    res.json(Fail(error.message.split(',')))
                } else {
                    if (error.code == 11000) {
                        res.json(Fail("This e-mail address is already in use"))
                    } else {
                        res.json(Fail(error.message))
                    }
                }
            })
    })

router
    .get('/getUids', (req, res) => {
        customerController
            .getcustomeruids({})
            .then((data) => {
                res.json(Success(data, 'Customers data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/', (req, res) => {
        customerController
            .getallcustomers({})
            .then((data) => {
                res.json(Success(data, 'Customers data fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router.post('/getByFilter', customerController.getByFilter)
router.get('/:id', customerController.getOne)
router.put('/:id', customerController.update)
router.delete('/:id', customerController.delete)

module.exports = router;