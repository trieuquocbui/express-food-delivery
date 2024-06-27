const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AccountController = require('../../controllers/customer/AccountController.js');

router.put('/:accountId/edit', AuthMiddleware.verifyTokenCustomer, AccountController.editProfile);

module.exports = router;