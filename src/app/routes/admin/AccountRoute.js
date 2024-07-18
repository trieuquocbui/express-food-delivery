const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AccountController = require('../../controllers/admin/AccountController.js');

router.post('/register/employee', AuthMiddleware.verifyTokenAdmin, upload.single('image'), AccountController.registerEmployee);

router.get('/list/:roleId', AuthMiddleware.verifyTokenAdmin, AccountController.getAccountList);

router.put('/:username', AuthMiddleware.verifyTokenAdmin, AccountController.changeAccountStatus);

router.get('/employee/list', AuthMiddleware.verifyTokenAdmin, AccountController.getEmployeeStatusList);

module.exports = router;