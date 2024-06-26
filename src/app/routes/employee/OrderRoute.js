const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const OrderController = require('../../controllers/employee/OrderController.js')

router.post('/:orderId/finish', AuthMiddleware.verifyTokenEmployee, OrderController.finishedOrder);

module.exports = router;