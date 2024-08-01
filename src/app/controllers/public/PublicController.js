const FileService = require('../../services/FileService.js');
const ProductService = require('../../services/ProductService.js');
const OrderService = require('../../services/OrderService.js');
const CategoryService = require('../../services/CategoryService.js');
const AccountService = require('../../services/AccountService.js');
const Code = require('../../constants/CodeConstant.js');

const getImage = async (req, res, next) => {
    const imageId = req.params.imageId;
    try {
        let image = await FileService.getImage(imageId);
        res.contentType(image.data.contentType);
        res.send(image.data.image);
    } catch (error) {
        next(error);
    }
}

const getProduct = async (req, res, next) => {
    let productId = req.params.productId;
    try {
        let result = await ProductService.getProduct(productId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy phẩm thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

const getOrder = async (req, res, next) => {
    let orderId = req.params.orderId;
    try {
        let result = await OrderService.getOrder(orderId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy thông tin đơn hàng thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const getProductList = async (req, res, next) => {
    
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || '_id';
    let sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    let searchQuery = req.query.search;
    let category = req.query.category
    
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        searchQuery: searchQuery,
        category: category
    }
    try {
        let data = await ProductService.getProductList(inforQuery);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách sản phẩm thành công",
            data: data
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const getAllCategory = async(req, res, next) => {
    try {
        let result = await CategoryService.getAll();
        let success = {
            code: Code.SUCCESS,
            message: "lấy danh mục thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const getAccount = async(req, res, next) => {
    try {
        const result = await AccountService.getAccount(req.params.accountId,next)
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách sản phẩm thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const changeAccountStatus = async (req, res, next) => {
    let username = req.params.username
    let data = req.body
    try {
        let result = await AccountService.changeAccountStatus(username,data, next);
        res.send({
            message: "Chỉnh sửa tài khoản thành công!",
            code: Code.SUCCESS,
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getImage, getProduct, getOrder, getProductList, getAllCategory, getAccount, changeAccountStatus }