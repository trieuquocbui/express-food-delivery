const { request } = require('express');
const Notification = require('../models/Notification.js');
const NotificationDetail = require('../models/NotificationDetail.js');
const Account = require('../models/Account.js');
const Code = require('../constants/CodeConstant.js');

const getNotificationList = (accountid, inforQuery) => {
    return new Promise( async (resovle, reject) => {
        try {
            
            const account = await Account.findOne({_id: accountid});

            const notificationList = await NotificationDetail.find({account: account}).populate('notification')
            .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
            .skip((inforQuery.page - 1) * inforQuery.limit)
            .limit(inforQuery.limit);

            const total = await NotificationDetail.countDocuments({account: account});
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: notificationList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }

            resovle(result);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình tạo thông báo:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình tạo thông báo!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}
 
const createNotification = (order ,fullName) => {
    return new Promise( async (resovle, reject) => {
        try {
            let message = `Có đơn đặt hàng ${order._id} từ khách hàng ${fullName}`;
            let notification = await new Notification({
                order: order,
                message: message,
                createdAt: new Date()
            }).save();

            resovle(notification);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình tạo thông báo:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình tạo thông báo!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

const createNotificationDetails = (notification, account) => {
    return new Promise( async (resovle, reject) => {
        try {
            let notificationDetail = await new NotificationDetail({
                notification: notification,
                account: account,
                status: false
            }).save();

            resovle(notificationDetail);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình tạo thông báo cho người dùng:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình tạo thông báo cho người dùng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
};

module.exports = {createNotification, createNotificationDetails, getNotificationList};