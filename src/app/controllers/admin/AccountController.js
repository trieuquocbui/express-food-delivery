
const AccountService = require('../../services/AccountService.js');

const Code = require('../../constants/CodeConstant.js');

const getAccountList = async (req, res, next) => {
    let roleId = req.params.roleId;
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
        let result = await AccountService.getAccountList(inforQuery, roleId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách tài khoản thành công",
            data: result,
        }
        res.send(success)
    } catch (error) {
        next(error)
    }
}

const deleteAccount = async (req, res, next) => {

}

const registerEmployee = async (req, res, next) => {
    let registerInfor = req.body;
    try {
        let data = await AccountService.registerEmployee(registerInfor, next);
        res.send({
            message: "Tạo tài khoản thành công!",
            code: Code.SUCCESS,
            data: data
        });
    } catch (error) {
        return next(error);
    }

}


module.exports = { deleteAccount, registerEmployee, getAccountList }