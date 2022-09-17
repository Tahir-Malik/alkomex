const express = require('express');
const creditNoteController = require('../../controllers/creditnote');
const router = express.Router();
const { Success, Fail } = require('../../services/response')

router
    .post('/', (req, res) => {
        creditNoteController
            .create_creditnote({ res: res, body: req.body })
            .then((data) => {
                res.json(Success(data, 'Credit note created Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/creditnotelists', (req, res) => {
        creditNoteController
            .getallcreditnotes({})
            .then((data) => {
                res.json(Success(data, 'Credit Note fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .get('/creditnotedetails/:creditnoteid', (req, res) => {
        creditNoteController
            .getcreditnote_details({ creditnoteid: req.params.creditnoteid })
            .then((data) => {
                res.json(Success(data, 'Credit Note details fetched Successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router.put('/:id', creditNoteController.update)
router.delete('/:id', creditNoteController.delete)

module.exports = router;