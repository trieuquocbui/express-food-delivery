const ProductService = require('../../services/ProductService.js');
const Code = require('../../constants/CodeConstant.js')
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const getProductList = async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || '_id';
    let sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    let searchQuery = req.query.search;
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        searchQuery: searchQuery
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

const createProduct = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    let userId = infor.userId;
    let file = req.file;
    const { data } = req.body;
    const jsonData = JSON.parse(data);
    try {
        let result = await ProductService.createProduct(file, jsonData, userId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Tạo sản phẩm thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const deleteProduct = async (req, res, next) => {
    let productId = req.params.productId;
    try {
        let result = await ProductService.deleteProduct(productId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Xóa sản phẩm thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

const editProduct = async (req, res, next) => {
    let productId = req.params.productId;
    let file = req.file;
    const { data } = req.body;
    const jsonData = JSON.parse(data);
    try {
        let result = await ProductService.editProduct(productId, file, jsonData, next);
        let success = {
            code: Code.SUCCESS,
            message: "Chỉnh sữa sản phẩm thành công",
            data: result
        };
        res.send(success);
    } catch (error) {
        next(error);
    }

}

const getPriceListOfProduct = async (req, res, next) => {
    let productId = req.params.productId;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || 'appliedAt';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    let startDate = req.query.startDate || undefined
    let endDate = req.query.endDate || undefined
    let inforQuery = {
        page: page,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        startDate: startDate,
        endDate: endDate
    }
    try {
        let data = await ProductService.getPriceListOfProduct(productId, inforQuery, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách giá thành công",
            data: data
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const addNewPrice = async (req, res, next) => {
    let productId = req.params.productId;
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let infor = await AuthMiddleware.decoded(token);
    let data = req.body;
    try {
        let result = await ProductService.addNewPrice(productId, infor.userId, data, next);
        let success = {
            code: Code.SUCCESS,
            message: "Thêm giá thành công",
            data: result
        };
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const deleteNewPrice = async (req, res, next) => {
    let priceId = req.params.priceId;
    try {
        let result = await ProductService.delelteNewPrice(priceId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Xóa giá mới thành công",
            data: result
        };
        res.send(success);
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
            message: "Lấy sản phẩm thành công",
            data: result
        };
        res.send(success);
    } catch (error) {
        next(error);
    }
}



module.exports = { getProductList, createProduct, deleteProduct, editProduct, addNewPrice, deleteNewPrice, getPriceListOfProduct, getProduct };