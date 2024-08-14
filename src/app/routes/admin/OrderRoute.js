const express = require('express');
const route = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const OrderController = require('../../controllers/admin/OrderController.js');

route.get('/list/status/:status', AuthMiddleware.verifyTokenAdmin, OrderController.getOrderList);

route.get('/statistics', AuthMiddleware.verifyTokenAdmin, OrderController.getStatistics);

route.get('/:orderId', AuthMiddleware.verifyTokenAdmin, OrderController.getOrder);

module.exports = route;