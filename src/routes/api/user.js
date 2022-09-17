const express = require('express');
const userController = require('../../controllers/user')
const router = express.Router();

router.post('/login', userController.login)
router.post('/', userController.create)
router.get('/', userController.get)
router.get('/:id', userController.getOne)
router.put('/:id', userController.update)
router.put('/:id', userController.updatePassword)
router.put('/:id/profile', userController.updateProfilePic)

module.exports = router;