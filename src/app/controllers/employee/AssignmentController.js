const Code = require('../../constants/CodeConstant.js');

const AssignmentService = require('../../services/AssignmentService.js');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const employeeAcceptOrder = async (req, res, next) => {
    data = req.body;
    try {
        let result = await AssignmentService.employeeAcceptOrder(data, next);
        let success = {
            code : Code.SUCCESS,
            message: "Thiết lặp nhiệm vụ thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

const getOrderOfNewestAssignment = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    try {
        let result = await AssignmentService.getOrderOfNewestAssignment(infor.userId,req.query.status, next);
        let success = {
            code : Code.SUCCESS,
            message: "Lấy thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

const getAssignment = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    let assignmentId = req.params.assignmentId
    try {
        let result = await AssignmentService.getAssignment(infor.userId,assignmentId, next);
        let success = {
            code : Code.SUCCESS,
            message: "Lấy thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

const getListAssignment = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || '_id';
    let sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
    }
    try {
        let result = await AssignmentService.getListAssignment(infor.userId,inforQuery, next);
        let success = {
            code : Code.SUCCESS,
            message: "Lấy thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

module.exports = {employeeAcceptOrder, getOrderOfNewestAssignment, getListAssignment, getAssignment};