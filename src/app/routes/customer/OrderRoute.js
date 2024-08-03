const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const OrderController = require('../../controllers/customer/OrderController.js')

router.post('/create', AuthMiddleware.verifyTokenCustomer, OrderController.createOrder);

router.get('/list/:status', AuthMiddleware.verifyTokenCustomer, OrderController.getOrderListOfCustomer);

module.exports = router;