require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../models/Account.js');
const User = require('../models/User.js');
const Code = require('../constants/CodeConstant.js');
const RoleConstant = require("../constants/RoleConstant.js");
const AccountStatus = require('../constants/AccountStatus.js');
const FileService = require('./FileService.js');

const getAccountList = (inforQuery, roleId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const searchConditions = { roleId: roleId };
            if (inforQuery.searchQuery) {
                searchConditions.$and = [
                    { username: { $regex: inforQuery.searchQuery, $options: 'i' } },
                    { roleId: roleId }
                ];
            }

            const accountList = await Account.aggregate([
                { $match: searchConditions },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: 'accountId',
                        as: 'infor'
                    }
                },
                {
                    $unwind: {
                        path: '$infor',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        status: 1,
                        thumbnail: 1,
                        createdAt: 1,
                        infor: {
                            _id: "$infor._id",
                            fullName: "$infor.fullName",
                            phoneNumber: "$infor.phoneNumber",
                            address: "$infor.address",
                            dob: "$infor.dob",
                            age: "$infor.age",
                            gender: "$infor.gender"
                        }
                    }
                },
                {
                    $sort: { [inforQuery.sortField]: inforQuery.sortOrder }
                },
                {
                    $skip: (inforQuery.page - 1) * inforQuery.limit
                },
                {
                    $limit: inforQuery.limit
                }
            ])

            const total = await Account.countDocuments(searchConditions);
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: accountList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình lấy danh sách tài khoản!`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình lấy danh sách tài khoản!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const changeAccountStatus = (username, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await Account.findOne({ username: username });

            if (!account) {
                const err = {
                    statusCode: 400,
                    message: "Không tìm thấy tài khoản!",
                    code: Code.ENTITY_NOT_EXIST,
                };
                return next(err);
            }

            account.status = data.status;
            
            account = await account.save();

            resolve({username: account.username, status: account.status});

        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình khóa tài khoản!`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình khóa tài khoản!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const registerEmployee = (file, registerInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let existingAccountByUsername = await Account.findOne({ username: registerInfor.username });
            if (existingAccountByUsername) {
                let err = {
                    message: "Tên tài khoản đã tồn tại!",
                    code: Code.ERROR_Name_EXIST
                };
                return next(err);
            }

            let existingPhoneNumber = await User.findOne({ phoneNumber: registerInfor.infor.phoneNumber });
            if (existingPhoneNumber) {
                let err = {
                    message: "Số điện thoại đã được sử dụng!",
                    code: Code.ERROR_PHONE_EXIST
                };
                return next(err);
            }

            let hashPassword = await bcrypt.hash(registerInfor.password, Number(process.env.SALTROUNDS));

            let image = await FileService.uploadImage(file);

            if (image.code != Code.SUCCESS) {
                let err = {
                    code: image.code,
                    message: image.message,
                }
                return next(err);
            }

            let newAccount = new Account({
                username: registerInfor.username,
                thumbnail: image.data._id,
                password: hashPassword,
                roleId: RoleConstant[1].id,
                status: AccountStatus.ONLINE,
                createdAt: new Date(),
            });

            await newAccount.save();

            let newEmployee = new User({
                phoneNumber: registerInfor.infor.phoneNumber,
                fullName: registerInfor.infor.fullName,
                address: registerInfor.infor.address,
                gender: registerInfor.infor.gender,
                dob: registerInfor.infor.dob,
                accountId: newAccount._id
            });

            await newEmployee.save();

            let result = {
                username: registerInfor.username,
            }

            resolve(result);

        } catch (error) {
            console.error(`Lỗi trong quá trình đăng kí tài khoản employee:`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình đăng kí tài khoản employee!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const registerCustomer = (registerInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let existingAccountByUsername = await Account.findOne({ username: registerInfor.username });
            if (existingAccountByUsername) {
                let err = {
                    message: "Tên tài khoản đã tồn tại!",
                    code: Code.ENTIRY_EXIST
                };
                return next(err);
            }

            let existingUserByPhoneNumber = await User.findOne({ phoneNumber: registerInfor.infor.phoneNumber });
            if (existingUserByPhoneNumber) {
                let err = {
                    message: "Số điện thoại đã được sử dụng!",
                    code: Code.ENTIRY_EXIST
                };
                return next(err);
            }

            let hashPassword = await bcrypt.hash(registerInfor.password, Number(process.env.SALTROUNDS));

            let newAccount = new Account({
                username: registerInfor.username,
                password: hashPassword,
                roleId: RoleConstant[2].id,
                status: AccountStatus.ONLINE,
                createdAt: new Date(),
            });

            await newAccount.save()

            let newCustomer = new User({
                phoneNumber: registerInfor.infor.phoneNumber,
                fullName: registerInfor.infor.fullName,
                accountId: newAccount._id
            });

            await newCustomer.save();

            let data = {
                username: newAccount.username
            };

            resolve(data);

        } catch (error) {
            console.error(`Lỗi trong quá trình đăng kí tài khoản khách hàng`, error);
            let err = {
                status: 500,
                message: "Lỗi trong quá trình đăng kí tài khoản khách hàng!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const getProfile = (username, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await Account.aggregate([
                { $match: { username: username } },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: 'accountId',
                        as: 'user_infor'
                    }
                }
            ]);

            if (account) {

                let infor = {
                    username: account[0].username,
                    thumbnail: account[0].thumbnail,
                    status: account[0].status,
                    user: {
                        fullName: account[0].user_infor[0].fullName,
                        phoneNumber: account[0].user_infor[0].phoneNumber,
                        address: account[0].user_infor[0].address,
                        age: account[0].user_infor[0].age,
                        gender: account[0].user_infor[0].gender,
                    }
                };

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

const editProfile = (accountId, accountInfor, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await Account.findOne({ _id: accountId });

            if (account) {

                let user = await User.findOne({ accountId: account._id });

                if (accountInfor.phoneNumber !== user.phoneNumber) {

                    let checkPhone = await User.findOne({ phoneNumber: accountInfor.phoneNumber }, 'phoneNumber');

                    if (checkPhone) {
                        let err = {
                            status: 400,
                            code: Code.ENTIRY_EXIST,
                            message: "Số điện thoại đã sử dụng",
                        }
                        return next(err);
                    } else {
                        user.fullName = accountInfor.fullName;
                        user.phoneNumber = accountInfor.phoneNumber,
                            user.address = accountInfor.address
                        user.age = accountInfor.age,
                            user.gender = accountInfor.gender
                        await user.save();

                    }
                }

                let result = await getProfile(account.username, next);

                resolve(result);
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

module.exports = { getAccountList, changeAccountStatus, registerEmployee, registerCustomer, getProfile, editProfile }