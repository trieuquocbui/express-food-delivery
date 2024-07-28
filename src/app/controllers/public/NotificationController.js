const Code = require('../../constants/CodeConstant.js');
const NotificationService = require('../../services/NotificationService.js');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const getNotificationList = async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || '_id';
    let sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let decoded = await AuthMiddleware.decoded(token);
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
    }   
    try {
        let result = await NotificationService.getNotificationList(decoded.accountId ,inforQuery);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách thông báo thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

module.exports = { getNotificationList }