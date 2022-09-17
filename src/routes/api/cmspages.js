const express = require('express');
const cmsController = require('../../controllers/cmspages')
const router = express.Router();
const { Success, Fail } = require('../../services/response')

router
    .post('/createandupdate', (req, res) => {
        cmsController
            .createAndUpdate({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'CMS Page created/updated Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/cmspage/:pageName', (req, res) => {
        cmsController
            .getOne({ params: req.params })
            .then((data) => {
                res.json(Success(data, 'CMS Page returned Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

module.exports = router;


