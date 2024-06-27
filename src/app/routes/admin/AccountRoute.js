const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AccountController = require('../../controllers/admin/AccountController.js');

router.post('/register/employee', AuthMiddleware.verifyTokenAdmin, AccountController.registerEmployee);

router.get('/list/:roleId', AuthMiddleware.verifyTokenAdmin, AccountController.getAccountList);

router.delete('/account/:accountId', AuthMiddleware.verifyTokenAdmin, AccountController.deleteAccount);

module.exports = router;