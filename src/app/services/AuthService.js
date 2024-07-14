require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../models/Account.js');
const User = require('../models/User.js');
const Code = require('../constants/CodeConstant.js');
const authMethod = require('../middlewares/AuthMiddleware.js');

const onLogin = (accountInfor, next) => {
    return new Promise((resolve, reject) => {
        let infor = null;
        Account.findOne({ username: accountInfor.username })
            .then(async (account) => {
                if (!account) {
                    const err = {
                        statusCode: 400,
                        message: "Tài khoản không tồn tại!",
                        code: Code.ENTITY_NOT_EXIST,
                    };
                    return next(err);
                }
                if (account.status == 0) {
                    const err = {
                        statusCode: 400,
                        message: "Tài khoản đã bị khóa!",
                        code: Code.ERROR,
                    };
                    return next(err);
                }

                let user = await User.findOne({ accountId: account._id });

                infor = {
                    userId: user._id,
                    accountId: account._id,
                    username: accountInfor.username,
                    role: account.roleId
                }

                return bcrypt.compare(accountInfor.password, account.password);
            })
            .then((result) => {
                if (!result) {
                    const err = {
                        statusCode: 400,
                        message: "Mật khẩu không chính xác!",
                        code: Code.WRONG_PASSWORD,
                    };
                    return next(err);
                }

                let payload = infor;

                const token = authMethod.generateToken(payload);

                resolve(token);
            })
            .catch((error) => {
                console.error(`Lỗi trong quá trình xử lý:`, error);
                let err = {
                    status: 500,
                    message: "Lỗi trong quá trình xử lý!",
                    code: Code.ERROR
                };
                reject(err);
            });
    })
}

module.exports = { onLogin }