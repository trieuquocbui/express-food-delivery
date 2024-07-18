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
        let isRole = await Role.findOne({ name: val });
        if (!isRole) {
            let newRole = new Role({
                name: val,
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

            let role = await Role.findOne({ name: account.roleName})

            let newEmployee = new User({
                fullName: infor.fullName,
            });

            let user = await newEmployee.save();

            let newAccount = new Account({
                username: account.username,
                password: hashPassword,
                role: role,
                status: AccountStatus.ONLINE,
                user: user,
                createdAt: new Date(),
            });

            await newAccount.save();
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
        process.exit();
    });

