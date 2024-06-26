require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../models/Account.js');
const Employee = require('../models/Employee.js');
const Customer = require('../models/Customer.js');
const Code = require('../constants/CodeConstant.js');
const authMethod = require('../middlewares/AuthMiddleware.js');
const RoleConstant = require("../constants/RoleConstant.js");

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

                let userId = null;
                if (account.roleId === RoleConstant[2].id) {
                    let customer = await Customer.findOne({ accountId: account._id });
                    userId = customer._id.toString();
                } else {
                    let employee = await Employee.findOne({ accountId: account._id });
                    userId = employee._id.toString();
                }

                infor = {
                    userId: userId,
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
                console.error(`Lỗi:`, error);
                let err = {
                    status: 500,
                    message: "Lỗi trong quá trình xử lý!",
                    code: Code.ERROR
                };
                reject(err);
            });
    })
}

const onEmployeeRegister = (registerInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let existingAccountByUsername = await Account.findOne({ username: registerInfor.account.username });
            if (existingAccountByUsername) {
                let err = {
                    message: "Tên tài khoản đã tồn tại!",
                    code: Code.ENTIRY_EXIST
                };
                return next(err);
            }

            let existingAccountByPhoneNumber = await Account.findOne({ phoneNumber: registerInfor.account.phoneNumber });
            if (existingAccountByPhoneNumber) {
                let err = {
                    message: "Số điện thoại đã được sử dụng!",
                    code: Code.ENTIRY_EXIST
                };
                return next(err);
            }


            let hashPassword = await bcrypt.hash(registerInfor.account.password, Number(process.env.SALTROUNDS));

            let newAccount = new Account({
                username: registerInfor.account.username,
                password: hashPassword,
                phoneNumber: registerInfor.account.phoneNumber,
                roleId: RoleConstant[1].id,
                status: 1,
                createdAt: new Date(),
            });

            await newAccount.save();

            let newEmployee = new Employee({
                ids: infor.ids,
                fullName: registerInfor.infor.fullName,
                address: registerInfor.infor.address,
                accountId: newAccount._id
            });

            await newEmployee.save();

            let result = {
                username: registerInfor.username,
                password: registerInfor.password
            }

            resolve(result);

        } catch (error) {
            console.error(`Lỗi:`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình xử lý!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const onCustomerRegister = (account, next) => {
    return new Promise(async (resolve, reject) => {
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

            let data = {
                username: account.username,
                password: account.password
            };
            resolve(data);

        } catch (error) {
            console.error(`Lỗi:`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình xử lý!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const getProfile = (username, next) => {
    return new Promise(async (resolve, reject) => {

        try {
            let account = await Account.findOne({ username: username });

            if (account) {
                let infor = {
                    username: username,
                    phoneNumber: account.phoneNumber,
                    status: account.status,
                };

                if (account.roleId == RoleConstant[2].id) {

                    let customer = await Customer.findOne({ accountId: account._id });

                    infor.fullName = customer.fullName;

                } else {
                    let employee = await Employee.findOne({ accountId: account._id });
                    infor.address = employee.address;
                    infor.fullName = employee.fullName;
                    infor.age = employee.age;
                    infor.gender = employee.gender
                }
                resolve(infor);
            } else {
                let err = {
                    status: 500,
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy tài khoản",
                }
                return next(err);
            }
        } catch (error) {
            console.log(`Lỗi xảy ra trong quá trình lấy thông tin ${error}`)
            let err = {
                status: 500,
                code: Code.ERROR,
                message: "Lỗi xảy ra trong quá trình lấy thông tin",
            }
            reject(err);
        }
    })
}

const editProfile = (accountInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = {};
            let account = await Account.findOne({ username: accountInfor.username });
            if (account) {
                if (accountInfor.infor.phoneNumber !== account.phoneNumber) {
                    let checkPhone = await Account.findOne({ phoneNumber: accountInfor.infor.phoneNumber });
                    if (checkPhone) {
                        let err = {
                            status: 400,
                            code: Code.ENTIRY_EXIST,
                            message: "Số điện thoại đã sử dụng",
                        }
                        return next(err);
                    } else {
                        await Account.updateOne({ username: accountInfor.username }, { phoneNumber: accountInfor.infor.phoneNumber });

                        const updateAccount = await Account.findOne({ username: accountInfor.username });

                        result.phoneNumber = updateAccount.phoneNumber;
                    }
                }

                if (account.roleId == RoleConstant[2].id) {

                    let accountId = account._id.toString();

                    await Customer.updateOne({ accountId: accountId }, { fullName: accountInfor.infor.fullName });

                    const updateCusotmer = await Customer.findOne({ accountId: accountId });

                    result.fullName = updateCusotmer.fullName;

                } else {
                    // edit employee infor 
                }


                res.send(result);
            } else {
                let err = {
                    status: 500,
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy tài khoản",
                }
                return next(err);
            }

        } catch (error) {
            console.log(`Lỗi xảy ra trong quá trình lấy thông tin ${error}`)
            let err = {
                status: 500,
                code: Code.ERROR,
                message: "Lỗi xảy ra trong quá trình lấy thông tin",
            }
            reject(err);
        }
    })
}

module.exports = { onLogin, onEmployeeRegister, onCustomerRegister, getProfile, editProfile }