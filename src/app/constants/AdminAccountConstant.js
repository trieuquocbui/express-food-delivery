const RolesConstant = require('../constants/RoleConstant.js');

const AdminAccountConstant = {
    username: "admin",
    password: "123456",
    roleId: RolesConstant[0].id,
}

const AdminInforConstant = {
    fullName: "Admin",
}

module.exports = { AdminAccountConstant, AdminInforConstant };