const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const AssignmentController = require('../../controllers/admin/AssignmentController.js')

router.post('/create', AuthMiddleware.verifyTokenAdmin, AssignmentController.assignedOrderToEmployee);

module.exports = router;