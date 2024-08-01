require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../models/Account.js');
const User = require('../models/User.js');
const Code = require('../constants/CodeConstant.js');
const authMethod = require('../middlewares/AuthMiddleware.js');
const AccountStatus = require('../constants/AccountStatus.js')

const onLogin = (accountInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {

            let account = await Account.findOne({ username: accountInfor.username }).populate('user').populate('role')

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
            
            let checkPassword = await bcrypt.compare(accountInfor.password, account.password);

            if (!checkPassword) {
                const err = {
                    statusCode: 400,
                    message: "Mật khẩu không chính xác!",
                    code: Code.WRONG_PASSWORD,
                };
                return next(err);
            }

            let payload  = {
                userId: account.user._id,
                accountId: account._id,
                username: account.username,
                role: account.role.name
            };

            account.status = AccountStatus.ONLINE

            account = await account.save();
           
            const token = authMethod.generateToken(payload);

            resolve({
                account: account,
                token: token
            });
        } catch (error) {
            console.error(`Lỗi trong quá trình xử lý:`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình xử lý!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const logout = (accountId, next ) => {
    return new Promise(async (resolve, reject) => {
        try {

            let account = await Account.findOne({ _id: accountId })

            if (!account) {
                const err = {
                    statusCode: 400,
                    message: "Tài khoản không tồn tại!",
                    code: Code.ENTITY_NOT_EXIST,
                };
                return next(err);
            }
            
            account.status = AccountStatus.OFFLINE

            account = await account.save();
           
            resolve(accounts);
        } catch (error) {
            console.error(`Lỗi trong quá trình xử lý:`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình xử lý!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

module.exports = { onLogin, logout }