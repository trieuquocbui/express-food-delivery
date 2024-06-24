require('dotenv').config();
const RolesConstant = require('../constants/RoleConstant.js');
const { AdminAccountConstant, AdminInforConstant } = require('../constants/AdminAccountConstant.js');
const Employee = require('../models/Employee.js')
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
                phoneNumber: account.phoneNumber,
                roleId: account.roleId,
                status: account.status,
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
        }
    } catch (error) {
        console.error(`Lỗi:`, error);
    }
}

mongoose
    .connect(process.env.MONGO_PROD_URI)
    .then(() => console.log('Successfully connected to the database'))
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

