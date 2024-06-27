
const OrderService = require('../../services/OrderService');
const Code = require('../../constants/CodeConstant.js');
const Status = require('../../constants/OrderStatus.js');

const getOrderList = async (req, res, next) => {
    let status = parseInt(req.params.status);
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
        let result = await OrderService.getOrderList(inforQuery, status);
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

const deleteOrder = async (req, res, next) => {
    let orderId = req.params.orderId;
    try {
        let order = await OrderService.getOrder(orderId);

        if (order.status > 1) {
            let err = {
                code: Code.ERROR,
                message: "Không thể chỉnh sữa đơn hàng",
            };
            return next(err);
        }

        let result = await OrderService.editOrderStatus(orderId, Status.CENCEL);

        let success = {
            code: Code.SUCCESS,
            message: "Chỉnh sữa đơn hàng thành công",
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
        let result = await OrderService.getOrder(orderId);
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

module.exports = { getOrderList, deleteOrder, getOrder }