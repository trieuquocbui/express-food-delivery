const Assignment = require('../models/Assignment.js');
const User = require('../models/User.js');
const Order = require('../models/Order.js');
const Code = require('../constants/CodeConstant.js');
const OrderStatus = require('../constants/OrderStatus.js')
const AccountStatus = require('../constants/AccountStatus.js')
const AssignmentStatus = require('../constants/AssignmentStatus.js');
const Account = require('../models/Account.js')

const assignedOrderToEmployee = (data, next) =>{
    return new Promise (async (resolve, reject) => {
        try {
            let admin = await User.findOne({fullName: 'Admin'});
            console.log(admin)
            let employee = await User.findOne({_id: data.employee});

            let order = await Order.findOne({_id: data.order});

            let assignment = await new Assignment({
                admin: admin,
                employee: employee,
                order: order,
                status: AssignmentStatus.ACCEPT,
            }).save();

            let account = await Account.findOne({user: employee});

            account.status = AccountStatus.SHIPPING

            await account.save()

            order.status = OrderStatus.ACCEPT

            order.assignmented = true

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

const getOrderOfNewestAssignment = (userId,status, next) => {
    return new Promise( async (resolve, reject) => {
        try {
            const assignment = await Assignment.find({ employee: userId, status: 1 }).populate({
                path:'order',
                populate: {
                path: 'orderDetails',
                populate: {
                    path: 'product',
                    model: 'products' 
                }
            }})
            .sort({ assignedAt: -1 }) 
            .limit(1);
            if(assignment.length > 0 && assignment[0].order.status == status){
                resolve(assignment[0])
            } else {
                resolve(null)
            }
            
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy đơn: ${error}`)
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy đơn",
            }
            reject(err);
        }
    })
}

const getAssignment = (userId,assignmentId, next) => {
    return new Promise( async (resolve, reject) => {
        try {
            const assignments = await Assignment.findOne({_id: assignmentId ,employee: userId }).populate({path:'order', populate: {
                path: 'orderDetails',
                populate: {
                    path: 'product',
                    model: 'products'
                }
            }})
            resolve(assignments)
           
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy đơn: ${error}`)
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy đơn",
            }
            reject(err);
        }
    })
}

const getListAssignment = (userId, inforQuery ,next) => {
    return new Promise( async (resolve, reject) => {
        try {
            const assignments = await Assignment.find({ employee: userId, status: 1 }).populate({path:'order', populate: {
                path:'orderDetails'
            }})
            .sort({ [inforQuery.sortField]: -1 })
            .skip((inforQuery.page - 1) * inforQuery.limit)
            .limit(inforQuery.limit);
    
            const total = await Assignment.countDocuments({ employee: userId, status: 1 });
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;
    
            let result = {
                content: assignments,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy đơn: ${error}`)
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy đơn",
            }
            reject(err);
        }
    })
}

module.exports = {assignedOrderToEmployee, employeeAcceptOrder, getOrderOfNewestAssignment, getListAssignment , getAssignment};