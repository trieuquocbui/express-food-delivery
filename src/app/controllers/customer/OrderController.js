const OrderService = require('../../services/OrderService.js');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');
const Code = require('../../constants/CodeConstant.js');
const Status = require('../../constants/OrderStatus.js');
const namespace = require('../../constants/NamespaseSocket.js')

const createOrder = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    let order = req.body;
    const io = req.io;
    try { 
        let result = await OrderService.createOrder(infor.userId, order, next);
        let success = {
            code: Code.SUCCESS,
            message: "Tạo đơn hàng thành công",
            data: result
        }

        io.of(namespace.ADMIN).emit('registerNotificationToAdmin', "Có đơn đặt hàng mới");

        io.of(namespace.EMPLOYEE).emit('request-location', "Có đơn đặt hàng mới")

        res.send(success);
    } catch (error) {
        next(error);
    }
}

const getOrderListOfCustomer = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || 'createdAt';
    let sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    let searchQuery = req.query.search;
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        searchQuery: searchQuery
    }

    try {
        let result = await OrderService.getOrderListOfCustomer(infor.userId, inforQuery);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách đơn hàng thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const getOrder = async (req, res, next) => {
    let orderId = req.params.orderId;
    try {
        let result = await OrderService.getOrder(orderId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy thông tin đơn hàng thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

module.exports = { createOrder, getOrderListOfCustomer, getOrder }