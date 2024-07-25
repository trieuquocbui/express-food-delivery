const Code = require('../../constants/CodeConstant.js');
const CartDetailsService = require('../../services/CartDetailsService.js');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const createCartDetails = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let decoded = await AuthMiddleware.decoded(token);
    let cartDetails = req.body;
    let userId = decoded.userId
    try {
        let result = await CartDetailsService.createCartDetails(userId, cartDetails, next);
        let success = {
            code: Code.SUCCESS,
            message: "Thêm vào giỏ hàng thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error)
    }
}

const deleteCartDetails = async (req, res, next) => {
    let cart = req.body;
    try {
        let result = await CartDetailsService.deleteCartDetails(cart, next);
        let success = {
            code: Code.SUCCESS,
            message: "Xoá khỏi giỏ hàng thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error)
    }
}

const editQuantityOfCartDetails = async(req, res, next) => {
    let cartDetailsId = req.params.cartDetailsId
    let cart = req.body;
    try {
        let result = await CartDetailsService.editQuantityOfCartDetails(cartDetailsId,cart, next);
        let success = {
            code: Code.SUCCESS,
            message: "Chỉnh sữa thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error)
    }
}

const getList = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let decoded = await AuthMiddleware.decoded(token);
    let userId = decoded.userId
    try {
        let result = await CartDetailsService.getCartDetails(userId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error)
    }
}

module.exports = { createCartDetails, deleteCartDetails, editQuantityOfCartDetails, getList }