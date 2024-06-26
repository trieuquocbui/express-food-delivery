
const CategoryService = require('../../services/CategoryService.js');
const Code = require('../../constants/CodeConstant.js');

const getCategoryList = async (req, res, next) => {
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
        let data = await CategoryService.getCategoryList(inforQuery);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy danh sách thể loại thành công",
            data: data
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const addCategory = async (req, res, next) => {
    let file = req.file;
    const { data } = req.body;
    const jsonData = JSON.parse(data);
    try {
        let result = await CategoryService.addCategory(file, jsonData, next);
        let success = {
            code: Code.SUCCESS,
            message: "Tạo thể loại thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const editCategory = async (req, res, next) => {
    const caterogyId = req.params.caterogyId;
    let file = req.file;
    const { data } = req.body;
    const jsonData = JSON.parse(data);
    try {
        let result = await CategoryService.editCategory(caterogyId, file, jsonData, next);
        let success = {
            code: Code.SUCCESS,
            message: "Chỉnh sửa thể loại thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

const deleteCategory = async (req, res, next) => {
    const caterogyId = req.params.caterogyId;
    try {
        let result = await CategoryService.deleteCategory(caterogyId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Xoá thể loại thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error);
    }
}

module.exports = { getCategoryList, addCategory, editCategory, deleteCategory }