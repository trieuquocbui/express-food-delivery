const express = require('express');
const router = express.Router();
const PublicController = require('../../controllers/public/PublicController.js');
const NotificationController = require('../../controllers/public/NotificationController.js');
const OrderController = require('../../controllers/public/OrderController.js');

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

router.get('/image/:imageId', PublicController.getImage);

router.get('/product/:productId', PublicController.getProduct);

router.get('/order/:orderId', PublicController.getOrder);

router.get('/products', PublicController.getProductList);

router.get('/category/all', PublicController.getAllCategory);

router.get('/account/user/:userId', PublicController.getAccountByUser);

router.get('/account/:accountId', PublicController.getAccount);

router.get('/notification/list', AuthMiddleware.hasAuthorization , NotificationController.getNotificationList)

router.put('/order/:orderId/edit/status', AuthMiddleware.hasAuthorization, OrderController.editOrderStatus);

router.put('/account/:username/edit/status', AuthMiddleware.hasAuthorization, PublicController.changeAccountStatus);

module.exports = router;