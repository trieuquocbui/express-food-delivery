const express = require('express');
const router = express.Router();
const PublicController = require('../../controllers/public/PublicController.js');
const NotificationController = require('../../controllers/public/NotificationController.js');

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

router.get('/image/:imageId', PublicController.getImage);

router.get('/product/:productId', PublicController.getProduct);

router.get('/order/:orderId', PublicController.getOrder);

router.get('/products', PublicController.getProductList);

router.get('/category/all', PublicController.getAllCategory);

router.get('/notification/list', AuthMiddleware.hasAuthorization , NotificationController.getNotificationList)

module.exports = router;