const Code = require('../../constants/CodeConstant.js');
const onlineEMployees = require('../../sockets/employeeOnline.js')
const AssignmentService = require('../../services/AssignmentService.js');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const assignedOrderToEmployee = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    data = req.body;
    try {
        let result = await AssignmentService.assignedOrderToEmployee(infor,data,next);
        let success = {
            code : Code.SUCCESS,
            message: "Phân công nhân viên giao hàng thành công",
            data: result
        }

        const employeeSocket = onlineEMployees.get(data.employee.toString());
        employeeSocket.emit('assignmented', "Bạn có đơn hàng mới được giao");

        res.send(success);
    } catch (error) {
        next(error);
    }
}

module.exports = {assignedOrderToEmployee};