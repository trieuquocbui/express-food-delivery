const Assignment = require('../models/Assignment.js');
const User = require('../models/User.js');
const Order = require('../models/Order.js');
const Code = require('../constants/CodeConstant.js');
const OrderStatus = require('../constants/OrderStatus.js')
const AccountStatus = require('../constants/AccountStatus.js')
const AssignmentStatus = require('../constants/AssignmentStatus.js');
const Account = require('../models/Account.js')

const assignedOrderToEmployee = (infor,data, next) =>{
    return new Promise (async (resolve, reject) => {
        try {
            let admin = await User.findOne({_id: infor.userId});

            let employee = await User.findOne({_id: data.employee});

            let order = await Order.findOne({_id: data.order});

            let assignment = await new Assignment({
                admin: admin,
                employee: employee,
                order: order,
                status: AssignmentStatus.AWAIT,
            }).save();

            let account = await Account.findOne({user: employee});

            account.status = AccountStatus.SHIPPING

            await account.save()

            order.status = OrderStatus.SHIPPING

            await order.save()

            resolve(assignment)
            
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình phân công đơn đặt hàng: ${error}`)
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình phân công đơn đặt hàng",
            }
            reject(err);
        }
    })
}

const employeeAcceptOrder = (data, next) => {
    return new Promise (async (resolve, reject) => {
        try {
            let employee = await User.findOne({_id: data.employee});

            let order = await Order.findOne({_id: data.order});

            let assignment = await new Assignment({
                employeeId: employee,
                orderId: order,
                status: AssignmentStatus.ACCEPT,
            }).save();

            resolve(assignment);
            
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình nhận đơn đặt hàng: ${error}`)
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình nhận đơn đặt hàng",
            }
            reject(err);
        }
    })
}

module.exports = {assignedOrderToEmployee, employeeAcceptOrder};