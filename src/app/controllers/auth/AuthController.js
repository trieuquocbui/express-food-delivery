const AuthService = require('../../services/AuthService');
const Code = require('../../constants/CodeConstant.js');

const onLogin = async (req, res, next) => {
    let accountInfor = {
        username: req.body.username,
        password: req.body.password
    }
    try {
        let token = await AuthService.onLogin(accountInfor, next);
        res.send({
            message: "Login thành công.",
            code: Code.SUCCESS,
            data: token
        });
    } catch (error) {
        return next(error);
    }

}

const onEmployeeRegister = async (req, res, next) => {
    let registerInfor = {
        account: req.body,
        infor: req.body.infor
    }

    try {
        let data = await AuthService.onEmployeeRegister(registerInfor, next);
        res.send({
            message: "Tạo tài khoản thành công!",
            code: Code.SUCCESS,
            data: data
        });
    } catch (error){
        return next(error);
    }
    
}

const onCustomerRegister = async (req, res, next) => {
    let accountInfor = req.body;
    try{
        let data = await AuthService.onCustomerRegister(accountInfor, next);
        res.send({
            message: "Tạo tài khoản thành công!",
            code: Code.SUCCESS,
            data: data
        });
    } catch (error){
        return next(error);
    }
    
}

const getProfile = async (req, res, next) => {
    const username = req.params.username;
    try{
        let data = await AuthService.getProfile(username, next);
        let success = {
            message: "Lấy thành công profile",
            code: Code.SUCCESS,
            data: data
        }
        res.send(success);
    } catch (error) {
        return next(error);
    }
    

    
}

const editProfile = async (req, res, next) => {
    let accountInfor = {
        username: req.params.username,
        infor: req.body
    } 
    try {
        let data = AuthService.editProfile(accountInfor, next);
        let success = {
            message: "Chỉnh sữa thành công profile",
            code: Code.SUCCESS,
            data: data
        };
        res.send(success)
    } catch (error)  {
        return next(error);
    }
    
}

module.exports = { onLogin, onEmployeeRegister, onCustomerRegister, getProfile, editProfile }