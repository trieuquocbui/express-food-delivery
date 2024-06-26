const Notification = require('../models/Notification.js');
const NotificationDetail = require('../models/NotificationDetail.js');

const createNotification = ( orderId, fullName ) => {
    return new Promise( async (resovle, reject) => {
        try {
            let message = `Có đơn đặt hàng ${orderId} từ khách hàng ${fullName}`;
            let notification = await new Notification({
                orderId: orderId,
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

const createNotificationDetails = () => {

};

module.exports = {createNotification, createNotificationDetails};