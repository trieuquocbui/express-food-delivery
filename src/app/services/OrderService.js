const Order = require('../models/Order.js');
const User = require('../models/User.js');
const NotificationService = require('../services/NotificationService.js');
const Code = require('../constants/CodeConstant.js');
const Product = require('../models/Product.js');
const Account = require('../models/Account.js');
const Role = require('../models/Role.js');
const RoleConstant = require('../constants/RoleConstant.js');
const OrderDetail = require('../models/OrderDetail.js');

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
                latitude: data.latitude,
                longitude: data.longitude,
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

const editOrderStatus = (orderId, status) => {
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

            order.status = status

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

module.exports = { getOrderListOfCustomer, getOrderList, createOrder, deleteOrder, getOrder, editOrderStatus };