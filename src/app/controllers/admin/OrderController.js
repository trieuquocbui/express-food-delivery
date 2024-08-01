const OrderService = require('../../services/OrderService');
const Code = require('../../constants/CodeConstant.js');


const getOrderList = async (req, res, next) => {
    let status = parseInt(req.params.status);
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || 'createdAt';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    let startDate = req.query.startDate || undefined
    let endDate = req.query.endDate || undefined
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        startDate: startDate,
        endDate: endDate
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

module.exports = { getOrderList, getOrder }