const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AssignmentController = require('../../controllers/employee/AssignmentController.js')

router.post('/create', AuthMiddleware.verifyTokenEmployee, AssignmentController.employeeAcceptOrder);

module.exports = router;