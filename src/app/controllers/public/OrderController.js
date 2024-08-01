const OrderService = require('../../services/OrderService')
const Code = require('../../constants/CodeConstant')

const editOrderStatus = async (req, res, next) => {
    const orderId = req.params.orderId;
    const data = req.body;
    const io = req.io
    try {

        let result = await OrderService.editOrderStatus(io,orderId, data, next);

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

module.exports = { editOrderStatus }