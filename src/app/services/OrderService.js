const Order = require('../models/Order.js');
const Customer = require('../models/Customer.js');
const NotificationService = require('../services/NotificationService.js');
const Code = require('../constants/CodeConstant.js');
const Product = require('../models/Product.js');

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

const getOrderList = (inforQuery) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orderList = await Order.find()
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);

            const total = await Order.countDocuments();
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

const createOrder = (customerId, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let customer = await Customer.findOne({ _id: customerId });

            if (!customer) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Khách hàng không tồn tại!",
                }
                return next(err);
            }

            let order = new Order({
                customerId: customerId,
                totalAmount: data.totalAmount,
                status: 1,
                address: data.address,
                createdAt: new Date(),
                orderDetails: data.orderDetails,
            });

            let newOrder = await order.save();

            NotificationService.createNotification(newOrder._id.toString(), customer.fullName);

            data.orderDetails.forEach(async element => {
                let product = await Product.findOne({ _id: element.productId });
                product.quantity -= element.quantity;

                await Product.updateOne({ _id: element.productId }, { quantity: product.quantity });
            });

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

const deleteOrder = (orderId) => {
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

const getOrder = (orderId) => {
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