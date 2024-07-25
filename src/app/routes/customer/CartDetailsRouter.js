const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const CartDetailsController = require('../../controllers/customer/CartDetailsController.js')

router.post('/create', AuthMiddleware.verifyTokenCustomer, CartDetailsController.createCartDetails);

router.delete('/delete', AuthMiddleware.verifyTokenCustomer, CartDetailsController.deleteCartDetails);

router.put('/:cartDetailsId/edit', AuthMiddleware.verifyTokenCustomer, CartDetailsController.editQuantityOfCartDetails);

router.get('/list', AuthMiddleware.verifyTokenCustomer, CartDetailsController.getList)

module.exports = router;