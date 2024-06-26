const OrderService = require('../../services/OrderService.js');
const Code = require('../../constants/CodeConstant.js');
const Status = require('../../constants/OrderStatus.js');

const finishedOrder = async (req, res, next) => {
    let orderId = req.params.orderId;
    try {
        let result = await OrderService.editOrderStatus(orderId, Status.FINISH);
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

module.exports = { finishedOrder }