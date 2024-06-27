require('dotenv').config();
const RolesConstant = require('../constants/RoleConstant.js');
const { AdminAccountConstant, AdminInforConstant } = require('../constants/AdminAccountConstant.js');
const AccountStatus = require('../constants/AccountStatus.js');
const User = require('../models/User.js')
const Account = require('../models/Account.js')
const Role = require('../models/Role.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

createRoles = async (values) => {
    for (let val of values) {
        let isRole = await Role.findOne({ _id: val.id });
        if (!isRole) {
            let newRole = new Role({
                _id: val.id,
                name: val.name,
            });
            try {
                await newRole.save();
            } catch (error) {
                console.error(`Lỗi khi tạo quyền ${val.id}:`, error);
            }
        }
    }
};

createAdminAccount = async (account, infor) => {
    try {
        let checkAccount = await Account.findOne({ username: account.username });

        if (!checkAccount) {

            let hashPassword = await bcrypt.hash(account.password, Number(process.env.SALTROUNDS));

            let newAccount = new Account({
                username: account.username,
                password: hashPassword,
                roleId: account.roleId,
                status: AccountStatus.ONLINE,
                createdAt: new Date(),
            });

            await newAccount.save();

            let newEmployee = new User({
                fullName: infor.fullName,
                accountId: newAccount._id
            });

            await newEmployee.save();

        }
    } catch (error) {
        console.error(`Lỗi xảy ra trong quá trình tạo tài khoản admin:`, error);
    }
}

mongoose
    .connect(process.env.MONGO_PROD_URI)
    .then(() => console.log('Kết nối database thành công'))
    .then(() => {
        createRoles(RolesConstant);
    })
    .then(() => {
        createAdminAccount(AdminAccountConstant, AdminInforConstant);
    })
    .catch(err => {
        console.log(err)
        process.exit();
    });

