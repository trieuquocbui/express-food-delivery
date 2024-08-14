require('dotenv').config();
const bcrypt = require("bcrypt");
const Account = require('../models/Account.js');
const Role = require('../models/Role.js');
const User = require('../models/User.js');
const Code = require('../constants/CodeConstant.js');
const RoleConstant = require("../constants/RoleConstant.js");
const AccountStatus = require('../constants/AccountStatus.js');
const FileService = require('./FileService.js');

const getAccountList = (inforQuery, roleName, next) => {
    return new Promise(async (resolve, reject) => {
        try {

            let role = await Role.findOne({name : roleName})
            const searchConditions = { role: role };
            if (inforQuery.searchQuery) {
                searchConditions.$and = [
                    { username: { $regex: inforQuery.searchQuery, $options: 'i' } },
                    { role: role }
                ];
            }
            
            const accounts = await Account.find(searchConditions).populate('user')
            .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
            .skip((inforQuery.page - 1) * inforQuery.limit)
            .limit(inforQuery.limit);;

            const total = await Account.countDocuments(searchConditions);
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: accounts,
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

            let existingPhoneNumber = await User.findOne({ phoneNumber: registerInfor.user.phoneNumber });
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

            let role = await Role.findOne({name : RoleConstant[1]})

            if (!role) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Chức vụ không tồn tại",
                }
                return next(err);
            }

            let newEmployee = new User({
                phoneNumber: registerInfor.user.phoneNumber,
                fullName: registerInfor.user.fullName,
                address: registerInfor.user.address,
                gender: registerInfor.user.gender,
                dob: registerInfor.user.dob,
            });

            newEmployee = await newEmployee.save();

            let newAccount = new Account({
                username: registerInfor.username,
                thumbnail: image.data._id,
                password: hashPassword,
                role: role,
                user: newEmployee,
                status: AccountStatus.ONLINE,
                createdAt: new Date(),
            });

            await newAccount.save();

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

            let existingUserByPhoneNumber = await User.findOne({ phoneNumber: registerInfor.phoneNumber });
            if (existingUserByPhoneNumber) {
                let err = {
                    message: "Số điện thoại đã được sử dụng!",
                    code: Code.PHONENUMBER_EXIST
                };
                return next(err);
            }

            let hashPassword = await bcrypt.hash(registerInfor.password, Number(process.env.SALTROUNDS));

            let newCustomer = new User({
                phoneNumber: registerInfor.phoneNumber,
                fullName: registerInfor.fullName,
            });

            newCustomer = await newCustomer.save();

            let role = await Role.findOne({name: RoleConstant[2]})

            let newAccount = new Account({
                username: registerInfor.username,
                password: hashPassword,
                role: role,
                user: newCustomer,
                status: AccountStatus.ONLINE,
                createdAt: new Date(),
            });

            newAccount = await newAccount.save()

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
            
            let account = await Account.findOne({ _id: accountId }).populate('user');

            if (account) {
                if (accountInfor.phoneNumber !== account.user.phoneNumber) {
                    console.log("asd")
                    let checkPhone = await User.findOne({ phoneNumber: accountInfor.phoneNumber });

                    if (checkPhone) {
                        let err = {
                            status: 400,
                            code: Code.ENTIRY_EXIST,
                            message: "Số điện thoại đã sử dụng",
                        }
                        return next(err);
                    } 
                } 

                let user = await User.findOne({ _id: account.user._id });
                        user.fullName = accountInfor.fullName;
                        user.phoneNumber = accountInfor.phoneNumber,
                            user.address = accountInfor.address
                        user.age = accountInfor.age,
                            user.gender = accountInfor.gender
                        await user.save();

                        account = await Account.findOne({ _id: accountId }).populate('user');

                resolve(account); 

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

const getEmployeeStatusList = (inforQuery, next) => {
    return new Promise(async (resolve, reject) => {
        try {

            let role = await Role.findOne({name : RoleConstant[1]})

            let accountQuery = { role: role, status: 1 };
            
            let total = 0
            let totalPages = 0
            let isLastPage = 0
            let accounts
            
            if(inforQuery.searchQuery){
                accounts = await Account.find(accountQuery).populate({path:'user', match: {fullName: new RegExp(inforQuery.searchQuery, 'i')}})
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                accounts = accounts.filter(account => account.user)
                total = accounts.length
                let result = [];
                let count = 0
                let i = (inforQuery.page - 1) * inforQuery.limit
                for(i; i < accounts.length && count < inforQuery.limit; i++ ){
                    count++
                    result.push(accounts[i])
                }
                accounts = result
                
            } else{
                accounts = await Account.find(accountQuery).populate({path:'user', match: {fullName: new RegExp(inforQuery.searchQuery, 'i')}})
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);
                total = await Account.countDocuments(accountQuery);
            }

            totalPages = Math.ceil(total / inforQuery.limit);
            isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: accounts,
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

const getAccount = (accountId , next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await Account.findOne({_id: accountId}).populate('user')
             
            resolve(account)
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

const getAccountByUser = (userId , next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await Account.findOne({user: userId}).populate('user')
             
            resolve(account)
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

module.exports = { getAccountList, getAccountByUser, changeAccountStatus, registerEmployee, registerCustomer, getProfile, editProfile, getEmployeeStatusList, getAccount }