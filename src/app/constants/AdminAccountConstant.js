const RolesConstant = require('../constants/RoleConstant.js');

const AdminAccountConstant = {
    username: "admin",
    password: "123456",
    roleName: RolesConstant[0],
}

const AdminInforConstant = {
    fullName: "Admin",
}

module.exports = { AdminAccountConstant, AdminInforConstant };