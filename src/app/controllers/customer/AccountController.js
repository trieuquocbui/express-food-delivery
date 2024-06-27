const Code = require('../../constants/CodeConstant.js');
const AccountService = require('../../services/AccountService');
const AuthMiddleware = require('../../middlewares/AuthMiddleware.js');

const editProfile = async (req, res, next) => {
    const authorization = req.get("Authorization");
    const token = authorization.split(' ')[1];
    let decoded = await AuthMiddleware.decoded(token);
    let infor = req.body;
    if (req.params.accountId !== decoded.accountId) {
        let err = {
            code: Code.UNAUTHORIZATION,
            message: "Bạn không có quyền thay đổi thông tin!"
        }
        return next(err);
    }

    let accountId = req.params.accountId;
    try {
        let result = await AccountService.editProfile(accountId, infor, next);
        let success = {
            code: Code.SUCCESS,
            message: "Chỉnh sữa thông tin thành công",
            data: result
        }
        res.send(success);
    } catch (error) {
        next(error)
    }
}

module.exports = { editProfile }