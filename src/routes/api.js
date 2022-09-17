const express = require('express');
const cmsRoutes = require('./api/cmspages');
const creditnoteRoutes = require('./api/creditnote');
const customerRoutes = require('./api/customer');
const invoiceRoutes = require('./api/invoice');
const packinglistRoutes = require('./api/packinglist');
const paymentRoutes = require('./api/payment');
const piRoutes = require('./api/pi');
const productRoutes = require('./api/product');
const userRoutes = require('./api/user');
const authRoutes = require('./api/auth');

const router = express.Router();
router.use('/cms', cmsRoutes);
router.use('/creditnote', creditnoteRoutes);
router.use('/customer', customerRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/packinglist', packinglistRoutes);
router.use('/payment', paymentRoutes);
router.use('/pi', piRoutes);
router.use('/product', productRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

router.get('/', (req, res) => res.json('Welcome to Alkomex APIs.'));

module.exports = router;