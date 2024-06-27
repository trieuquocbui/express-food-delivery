const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AuthController = require('../../controllers/auth/AuthController.js');

router.post('/login', AuthController.onLogin);

router.post('/register/customer', AuthController.regisiterCustomer);

router.get('/profile/:username', AuthController.getProfile);

module.exports = router;