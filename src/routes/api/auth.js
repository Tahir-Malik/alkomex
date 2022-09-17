const express = require('express');
const router = express.Router();
const authUseCase = require('../../controllers/auth');
const { Success, Fail } = require('../../services/response')

router
    .post('/signin', (req, res) => {
        authUseCase
            .login({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'login successfully'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .post('/forgot', (req, res) => {
        authUseCase
            .forgot({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'OTP has been sent to the customer email address.'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .post('/resetpassword', (req, res) => {
        authUseCase
            .resetpassword({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'Password changed successfully.'))
            })
            .catch((error) => {
                console.log('Err :----->', error);
                res.json(Fail(error))
            })
    })

router
    .post('/adminlogin', (req, res) => {
        authUseCase
            .adminlogin({ body: req.body })
            .then((data) => {
                res.json(Success(data, "Admin login successfully"))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .post('/adminforgot', (req, res) => {
        authUseCase
            .adminforgot({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'OTP has been sent to the admin email address.'))
            })
            .catch((error) => {
                res.json(Fail(error.message))
            })
    })

router
    .post('/adminresetpassword', (req, res) => {
        authUseCase
            .adminresetpassword({ body: req.body })
            .then((data) => {
                res.json(Success(data, 'Password changed successfully.'))
            })
            .catch((error) => {
                res.json(Fail(error))
            })
    })

module.exports = router;
