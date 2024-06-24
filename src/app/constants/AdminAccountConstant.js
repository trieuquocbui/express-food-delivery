const RolesConstant = require('../constants/RoleConstant.js');

const AdminAccountConstant = {
    username: "admin",
    password: "123456",
    phoneNumber:"123456789",
    status:1,
    roleId: RolesConstant[0].id,
}

const AdminInforConstant = {
    ids:"1234567890",
    fullName:"Nguyễn Văn A",
    address:"Hồ chí Minh",
    accountId:"",
}

module.exports = {AdminAccountConstant, AdminInforConstant };