const express = require('express');
const multer = require('multer');

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ProductController = require('../../controllers/admin/ProductController.js');

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

route.get('/list', AuthMiddleware.verifyTokenAdmin, ProductController.getProductList);

route.post('/add', AuthMiddleware.verifyTokenAdmin, upload.single('image'), ProductController.createProduct);

route.delete('/:productId/delete', AuthMiddleware.verifyTokenAdmin, ProductController.deleteProduct);

route.put('/:productId/edit', AuthMiddleware.verifyTokenAdmin, upload.single('image'), ProductController.editProduct);

route.get('/:productId/price/list', AuthMiddleware.verifyTokenAdmin, ProductController.getPriceListOfProduct);

route.post('/:productId/new-price/add', AuthMiddleware.verifyTokenAdmin, ProductController.addNewPrice);

route.delete('/:productId/new-price/delete/:priceId', AuthMiddleware.verifyTokenAdmin, ProductController.deleteNewPrice);

module.exports = route;