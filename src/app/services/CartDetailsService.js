const Product = require('../models/Product')
const User = require('../models/User')
const CartDetails = require('../models/CartDetails')
const Code = require('../constants/CodeConstant.js');
const PriceDetail = require('../models/PriceDetail.js');

const createCartDetails = async (userId,infor,next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({_id : infor.product})
    
            const user = await User.findOne({_id : userId})

            const checkCartDetails = await CartDetails.findOne({customer: user, product: product})

            let cartDetails;

            if(checkCartDetails){
                cartDetails = checkCartDetails;
                cartDetails.quantity++
            } else{
                cartDetails = new CartDetails({
                    customer: user,
                    product: product,
                    quantity: 1,
                })
            }

            cartDetails = await cartDetails.save()

            cartDetails = await CartDetails.findOne({_id: cartDetails._id}).populate('product')

            const priceDetail = await PriceDetail.findOne({
                product: cartDetails.product._id,
                appliedAt: { $lte: new Date() }
            })
            .sort({ appliedAt: -1 })
            .exec();

            resolve({...cartDetails.toObject(),
                    product: {
                        ...cartDetails.product.toObject(),
                        price: priceDetail ? priceDetail.newPrice : null,
                    }});
        
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình thêm sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình thêm sản phẩm"
            };
            reject(err);
        }
    })
}

const deleteCartDetails = (infor,next) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            infor.forEach(async item => {
                await CartDetails.deleteOne({_id: item._id})
            });

            resolve(infor);
        
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xoá sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xoá sản phẩm"
            };
            reject(err);
        }
    })
}

const editQuantityOfCartDetails = (cartDetailsId, cart, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            let checkCartDetails = await CartDetails.findOne({_id: cartDetailsId}).populate('product');

            if(checkCartDetails.product.quantity == checkCartDetails.quantity){
                const err = {
                    statusCode: 400,
                    message: "Sản phẩm hiện có " + checkCartDetails.product.quantity,
                    code: Code.ENTITY_NOT_EXIST,
                };
                return next(err);
            } else if( checkCartDetails.quantity == 0){
                const err = {
                    statusCode: 400,
                    message: "Hiện tại số lượng là 0",
                    code: Code.ERROR,
                };
                return next(err);
            }

            checkCartDetails.quantity += cart.quantity

            checkCartDetails = checkCartDetails.save()

            resolve(checkCartDetails);
        
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xoá sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xoá sản phẩm"
            };
            reject(err);
        }
    })
}

const getCartDetails = (userId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            const user = await User.findOne({_id: userId})

            let list = await CartDetails.find({customer: user}).populate('product').sort({_id: -1})

            const cartDetailsWithPrice = await Promise.all(list.map(async (cartDetail) => {
                const priceDetail = await PriceDetail.findOne({
                    product: cartDetail.product._id,
                    appliedAt: { $lte: new Date() }
                })
                .sort({ appliedAt: -1 })
                .exec();
    
                return {
                    ...cartDetail.toObject(),
                    product: {
                        ...cartDetail.product.toObject(),
                        price: priceDetail ? priceDetail.newPrice : null,
                    }
                };
            }));
            
            resolve(cartDetailsWithPrice);
        
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xoá sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xoá sản phẩm"
            };
            reject(err);
        }
    })
}

module.exports = {createCartDetails, deleteCartDetails, editQuantityOfCartDetails, getCartDetails}