const Order = require('../models/Order.js');
const User = require('../models/User.js');
const NotificationService = require('../services/NotificationService.js');
const Code = require('../constants/CodeConstant.js');
const Product = require('../models/Product.js');
const Account = require('../models/Account.js');
const Role = require('../models/Role.js');
const Assignment = require('../models/Assignment.js');
const Location = require('../models/Location.js');
const RoleConstant = require('../constants/RoleConstant.js');
const OrderDetail = require('../models/OrderDetail.js');
const OrderStatus = require('../constants/OrderStatus.js')
const AccountStatus = require('../constants/AccountStatus.js')
const namespace = require('../constants/NamespaseSocket.js')
const onlineEMployees = require('../sockets/employeeOnline.js')

const getOrderListOfCustomer = (customerId, inforQuery) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orderList = await Order.find({ customerId: customerId })
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);

            const total = await Order.countDocuments({ customerId: customerId });
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                data: orderList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình lấy danh sách đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình lấy danh sách đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

const getOrderList = (inforQuery, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = { 
                status: status
            };
    
            if (inforQuery.startDate && inforQuery.endDate) {
                query.createdAt = {
                    $gte: new Date(inforQuery.startDate),
                    $lte: new Date(inforQuery.endDate)
                };
            }

            const orderList = await Order.find(query).populate('customer').populate({path: 'orderDetails', populate: {
                path: 'product'
            }})
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);

            const total = await Order.countDocuments({ status: status });
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: orderList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình lấy danh sách đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình lấy danh sách đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

const createOrder = (customerId, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let customer = await User.findOne({ _id: customerId });

            if (!customer) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Khách hàng không tồn tại!",
                }
                return next(err);
            }

            const orderDetailIds = await Promise.all(data.orderDetails.map(async detail => {
                let product = await Product.findOne({_id: detail.product})
                product.quantity -= detail.quantity;
                product.sold += detail.quantity;
                await Product.updateOne({ _id: detail.product }, { quantity: product.quantity, sold: product.sold });

                const newDetail = new OrderDetail({
                    product: product,
                    quantity: detail.quantity,
                    price: detail.price
                });
                return savedDetail = await newDetail.save();
            }));

            let order = new Order({
                customer: customer,
                totalAmount: data.totalAmount,
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                shipping: data.shipping,
                status: data.status,
                location: {
                    type: "Point",
                    coordinates: [data.longitude, data.latitude]
                  },
                address1: data.address1,
                address2: data.address2,
                createdAt: new Date(),
                orderDetails: orderDetailIds
            });

            let newOrder = await order.save();

            let notification = await NotificationService.createNotification(newOrder, customer.fullName);

            let role = await Role.findOne({name: RoleConstant[0]})

            if (!role) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Chúc vụ không tồn tại",
                }
                return next(err);
            }

            let account = await Account.findOne({role: role});

            if (!account) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Tài khoản không tồn tại!",
                }
                return next(err);
            }

            NotificationService.createNotificationDetails(notification, account);

            resolve(newOrder);

        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình tạo đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình tạo đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

const deleteOrder = (orderId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await Order.findOne({ _id: orderId });

            if (!order) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Đơn hàng không tồn tại!",
                }
                return next(err);
            }

            if (order.status > 2) {
                let err = {
                    code: Code.ERROR,
                    message: "Đơn hàng không thể xóa!",
                }
                return next(err);
            }

            order.orderDetails.forEach(async element => {
                let product = await Product.findOne({ _id: element.productId });
                product.quantity += element.quantity;

                await Product.updateOne({ _id: element.productId }, { quantity: product.quantity });
            });

            order.status = 0;

            await Order.updateOne({ _id: orderId }, order);

            resolve(orderId);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình chỉnh xóa đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình chỉnh xóa đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

const getOrder = (orderId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await Order.findOne({ _id: orderId }).populate({path: 'orderDetails', populate: {
                path: 'productId'
            }});

            if (!order) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Đơn hàng không tồn tại!",
                }
                return next(err);
            }

            resolve(order);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình lấy đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình lấy đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const editOrderStatus = (io, orderId, data,next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await Order.findOne({ _id: orderId });

            if (!order) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Đơn hàng không tồn tại!",
                }
                return next(err);
            }

            if(data.status == OrderStatus.ACCEPT){
                await findAndAssignEmployee(io,order);
            } 
            order.status = data.status
            order = await order.save();
            resolve(order);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình chỉnh sữa đơn hàng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình chỉnh sữa đơn hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const findAndAssignEmployee = async (io,order) => {
    try {
        // lấy danh sách nhân viên
        const role = await Role.findOne({ name: RoleConstant[1] });
        const accounts = await Account.find({ role: role, status: AccountStatus.ONLINE }).populate('user');
        const onlineEmployeeIds = accounts.map(item => item.user._id);

        // lấy location mới nhất của nhân viên onl
        const latestLocations = await Location.aggregate([
            { $match: { employee: { $in: onlineEmployeeIds.map(id => id) } } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$employee", latestLocation: { $first: "$$ROOT" } } }
        ]);

        // tính toán khoản cách sắp xếp gần nhất hay xa nhất
        const employeesWithDistance = latestLocations.map(emp => ({
            employee: emp._id,
            distance: calculateDistance(order.location.coordinates, emp.latestLocation.location.coordinates)
        })).sort((a, b) => a.distance - b.distance);

        await assignOrderToEmployee(io,order, employeesWithDistance);
    } catch (error) {
        console.error('Lỗi trong quá trính phân công', error);
        
    }
}

// công  thức Haversine Formula
const  calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180; 
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; 
  return distance;
}

const assignOrderToEmployee = async (io,order, employees, index = 0) => {
    if (index >= employees.length) {
        console.log("Đơn hàng chưa phân công")
        await Order.findByIdAndUpdate(order._id, { assignmented: 0 });
        io.of(namespace.ADMIN).emit('order-unassigned', "Đơn hàng chưa phân công");
        return;
    }
    const employee = employees[index];
    const employeeSocket = onlineEMployees.get(employee.employee.toString());
    if (employeeSocket) {
        return new Promise((resolve) => {

            employeeSocket.emit('new-order-request', { 
                orderId: order._id, 
                distance: employee.distance
            }, async (response, err) => {
                if (err) {
                    console.error("Error:", err);
                }
                if (response && response.accepted) {
                    await createAssignment(io,order._id, employee.employee, 1);
                    resolve();
                } 
                else {
                    await createAssignment(io,order._id, employee.employee, 0);
                    await assignOrderToEmployee(io, order, employees, index + 1);
                    resolve();
                }
            });

            // Đặt timeout cho phản hồi của nhân viên
            // setTimeout(() => {
            //     assignOrderToEmployee(order, employees, index + 1);
            //     resolve();
            // }, 10000); // 30 giây
        });
    } 
}

const  createAssignment = async (io,orderId, employeeId, status) => {
    const assignment = new Assignment({
        employee: employeeId,
        order: orderId,
        status: status,
        assignedAt: new Date()
    });

    await assignment.save();

    if(status == 1){
        console.log("Đơn đã phân công")
        await Order.findByIdAndUpdate(orderId, { assignmented: 1 });
        io.of(namespace.ADMIN).emit('order-assigned', "Đơn đã phân công");
    }
}

module.exports = { getOrderListOfCustomer, getOrderList, createOrder, deleteOrder, getOrder, editOrderStatus };