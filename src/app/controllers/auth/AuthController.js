require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../../models/Account.js');
const Employee = require('../../models/Employee.js');
const Customer = require('../../models/Customer.js');
const Code = require('../../constants/CodeConstant.js');
const authMethod = require('../../middlewares/auth.js');
const RoleConstant = require("../../constants/RoleConstant.js");

const onLogin = (req, res, next) => {
    const username = req.body.username;
    let password = req.body.password;
    let infor = null;
    Account.findOne({ username: username })
        .then((account) => {
            if (!account) {
                const err = {
                    statusCode: 400,
                    message: "Tài khoản không tồn tại!",
                    code: Code.ENTITY_NOT_EXIST,
                };
                return next(err);
            }

            infor = {
                username: username,
                role: account.roleId
            }

            return bcrypt.compare(password, account.password);
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

            res.send({
                message: "Login thành công.",
                code: Code.SUCCESS,
                data: token
            });
        })
        .catch((err) => {
            next(err);
        });
}

const onEmployeeRegister = async (req, res, next) => {
    let account = req.body;
    let infor = account.infor;
    try {
        let existingAccountByUsername = await Account.findOne({ username: account.username });
        if (existingAccountByUsername) {
            let err = {
                message: "Tên tài khoản đã tồn tại!",
                code: Code.ENTIRY_EXIST
            };
            return next(err);
        }

        let existingAccountByPhoneNumber = await Account.findOne({ phoneNumber: account.phoneNumber });
        if (existingAccountByPhoneNumber) {
            let err = {
                message: "Số điện thoại đã được sử dụng!",
                code: Code.ENTIRY_EXIST
            };
            return next(err);
        }


        let hashPassword = await bcrypt.hash(account.password, Number(process.env.SALTROUNDS));

        let newAccount = new Account({
            username: account.username,
            password: hashPassword,
            phoneNumber: account.phoneNumber,
            roleId: RoleConstant[1].id,
            status: 1,
            createdAt: new Date(),
        });

        await newAccount.save();

        let newEmployee = new Employee({
            ids: infor.ids,
            fullName: infor.fullName,
            address: infor.address,
            accountId: newAccount._id
        });

        await newEmployee.save();

        let success = {
            message: "Tạo tài khoản thành công!",
            code: Code.SUCCESS
        };
        res.send(success);

    } catch (error) {
        console.error(`Lỗi:`, error);
        let err = {
            status: 500,
            message: "Lỗi trong quá trình xử lý!",
            code: Code.ERROR
        };
        return next(err);
    }
}

const onCustomerRegister = async (req, res, next) => {
    try {
        let account = req.body;

        let existingAccountByUsername = await Account.findOne({ username: account.username });
        if (existingAccountByUsername) {
            let err = {
                message: "Tên tài khoản đã tồn tại!",
                code: Code.ENTIRY_EXIST
            };
            return next(err);
        }

        let existingAccountByPhoneNumber = await Account.findOne({ phoneNumber: account.phoneNumber });
        if (existingAccountByPhoneNumber) {
            let err = {
                message: "Số điện thoại đã được sử dụng!",
                code: Code.ENTIRY_EXIST
            };
            return next(err);
        }

        let hashPassword = await bcrypt.hash(account.password, Number(process.env.SALTROUNDS));

        let newAccount = new Account({
            username: account.username,
            password: hashPassword,
            phoneNumber: account.phoneNumber,
            roleId: RoleConstant[2].id,
            status: 1,
            createdAt: new Date(),
        });

        await newAccount.save();

        let newCustomer = new Customer({
            fullName: account.fullName,
            accountId: newAccount._id
        });

        await newCustomer.save();

        let success = {
            message: "Tạo tài khoản thành công!",
            code: Code.SUCCESS
        };
        res.send(success);

    } catch (error) {
        console.error(`Lỗi:`, error);
        let err = {
            status: 500,
            message: "Lỗi trong quá trình xử lý!",
            code: Code.ERROR
        };
        return next(err);
    }
}

module.exports = { onLogin, onEmployeeRegister, onCustomerRegister }