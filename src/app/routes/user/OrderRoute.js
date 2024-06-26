const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const OrderController = require('../../controllers/user/OrderController.js')

router.post('/create', AuthMiddleware.verifyTokenCustomer, OrderController.createOrder);

router.get('/list', AuthMiddleware.verifyTokenCustomer, OrderController.getOrderListOfCustomer);

router.get('/:orderId', AuthMiddleware.verifyTokenCustomer, OrderController.getOrder);

module.exports = router;