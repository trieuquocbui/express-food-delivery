require('dotenv').config();
const jwt = require("jsonwebtoken");
const RolesConstant = require('../constants/RoleConstant.js');
const Code = require('../constants/CodeConstant.js');

verifyToken = (req, res, next, role) => {
    const authorization = req.get("Authorization");
    if (!authorization) {
        const err = {
            statusCode: 401,
            message: "Bạn không có quyền truy cập!",
            code: Code.UNAUTHORIZATION,
        };
        return next(err);
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            const err = {
                statusCode: 401,
                message: "Chứng thực quyền truy cập thất bại!",
                code: Code.UNAUTHORIZATION,
            };
            return next(err);
        }
        
        if (decoded.role == role) {
            next();
        } else {
            const err = {
                statusCode: 401,
                message: "Chứng thực quyền truy cập thất bại!",
                code: Code.UNAUTHORIZATION,
            };
            return next(err);
        }
    });
}

exports.verifyTokenAdmin = async (req, res, next) => {
    verifyToken(req, res, next, RolesConstant[0].id)
}

exports.verifyTokenEmployee = async (req, res, next) => {
    verifyToken(req, res, next, RolesConstant[1].id)
}

exports.verifyTokenCustomer = async (req, res, next) => {
    verifyToken(req, res, next, RolesConstant[2].id)
}

exports.generateToken = (payload) => {
    try {
        return jwt.sign(payload, process.env.TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: process.env.TOKEN_LIFE,
        })
    } catch (error) {
        console.log(`Lỗi phát sinh trong quá trình tạo token:  + ${error}`);
        return null;
    }
}

