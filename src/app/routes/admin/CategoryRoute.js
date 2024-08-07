const express = require('express');
const multer = require('multer');

const CategoryController = require('../../controllers/admin/CategoryController.js');

const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/list', AuthMiddleware.verifyTokenAdmin, CategoryController.getCategoryList);

route.post('/add', AuthMiddleware.verifyTokenAdmin, upload.single('image'), CategoryController.addCategory);

route.put('/:categoryId/edit', AuthMiddleware.verifyTokenAdmin, upload.single('image'), CategoryController.editCategory);

route.get('/all', AuthMiddleware.verifyTokenAdmin, CategoryController.getAll);

route.get('/:categoryId', AuthMiddleware.verifyTokenAdmin, CategoryController.getCategory);

route.delete('/:categoryId/delete', AuthMiddleware.verifyTokenAdmin, CategoryController.deleteCategory);

module.exports = route;