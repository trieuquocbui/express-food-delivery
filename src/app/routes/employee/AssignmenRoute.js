const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AssignmentController = require('../../controllers/employee/AssignmentController.js')

router.post('/create', AuthMiddleware.verifyTokenEmployee, AssignmentController.employeeAcceptOrder);

router.get('/newest', AuthMiddleware.verifyTokenEmployee, AssignmentController.getOrderOfNewestAssignment)

router.get('/list', AuthMiddleware.verifyTokenEmployee, AssignmentController.getListAssignment)

router.get('/:assignmentId', AuthMiddleware.verifyTokenEmployee, AssignmentController.getAssignment)


module.exports = router;