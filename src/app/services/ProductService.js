const FileService = require('./FileService.js');
const Product = require('../models/Product.js');
const PriceDetail = require('../models/PriceDetail.js');
const Code = require('../constants/CodeConstant.js');
const Category = require('../models/Category.js');
const Order = require('../models/Order.js');
const User = require('../models/User.js')

const getProductList = async (inforQuery) => {
    try {
        const searchConditions = {};

        if (inforQuery.searchQuery || inforQuery.category) {
            searchConditions.$and = [];
        }

        if (inforQuery.searchQuery) {
            searchConditions.$and.push({
                name: { $regex: inforQuery.searchQuery, $options: 'i' }
            });
        }

        if (inforQuery.category) {
            let category = await Category.findOne({ _id: inforQuery.category });
            
            if (category) {
                searchConditions.$and.push({
                    category: category._id
                });
            } else {
                return {
                    content: [],
                    total: 0,
                    page: inforQuery.page,
                    totalPages: 0,
                    isLastPage: true
                };
            }
        }

        const currentDate = new Date();
        const productList = await Product.aggregate([
            {
                $match: searchConditions
            },
            {
                $lookup: {
                    from: 'price_details',
                    let: { product: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$product', '$$product'] },
                                        { $lte: ['$appliedAt', currentDate] }
                                    ]
                                }
                            }
                        },
                        { $sort: { appliedAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestPriceDetail'
                }
            },
            {
                $unwind: {
                    path: '$latestPriceDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    category: { _id: 1, name: 1 },
                    thumbnail: 1,
                    description: 1,
                    sold: 1,
                    quantity: 1,
                    status: 1,
                    featured: 1,
                    price: '$latestPriceDetail.newPrice',
                    appliedAt: '$latestPriceDetail.appliedAt'
                }
            },
            {
                $sort: { [inforQuery.sortField]: inforQuery.sortOrder }
            },
            {
                $skip: (inforQuery.page - 1) * inforQuery.limit
            },
            {
                $limit: inforQuery.limit
            }
        ]);

        const total = await Product.countDocuments(searchConditions);
        const totalPages = Math.ceil(total / inforQuery.limit);
        const isLastPage = inforQuery.page >= totalPages;

        const result = {
            content: productList,
            total: total,
            page: inforQuery.page,
            totalPages: totalPages,
            isLastPage: isLastPage
        };

        return result;
    } catch (error) {
        console.log(`Có lỗi xảy ra trong quá trình lấy danh sách sản phẩm: ${error}`);
        throw {
            code: Code.ERROR,
            message: "Có lỗi xảy ra trong quá trình lấy danh sách sản phẩm"
        };
    }
}


const createProduct = (file, data, userId, next) => {
    return new Promise(async (resolve, reject) => {
        try {

            let checkCategory = await Category.findOne({ _id: data.category });
            if (!checkCategory) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Thể loại không tồn tại!",
                }
                return next(err);
            }

            let image = await FileService.uploadImage(file);

            if (image.code != Code.SUCCESS) {
                let err = {
                    code: image.code,
                    message: image.message,
                }
                return next(err);
            }

            let newProduct = new Product({
                name: data.name,
                category: checkCategory,
                thumbnail: image.data._id,
                description: data.description,
                sold: 0,
                quantity: data.quantity,
                status: data.status,
                featured: data.featured
            })

            let product = await newProduct.save();

            let user = await User.findOne({ _id: userId})

            if (!user) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Người dùng không tồn tại!",
                }
                return next(err);
            }

            let newPriceDetail = new PriceDetail({
                product: product,
                admin: user,
                newPrice: data.price,
                appliedAt: new Date(),
                createdAt: new Date(),
            })

            let priceDetail = await newPriceDetail.save();

            let productInfor = {
                _id: newProduct.id,
                name: newProduct.name,
                thumbnail: newProduct.thumbnail,
                description: newProduct.description,
                sold: newProduct.sold,
                quantity: newProduct.quantity,
                status: newProduct.status,
                featured: newProduct.featured,
                price: priceDetail.newPrice
            }

            resolve(productInfor);
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình tạo sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình tạo sản phẩm"
            };
            reject(err);
        }
    })
}

const editProduct = (productId, file, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkProduct = await Product.findOne({ _id: productId });
            if (!checkProduct) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy sản phẩm",
                }
                return next(err);
            }

            let checkCategory = await Category.findOne({ _id: data.category._id });
            if (!checkCategory) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Thể loại không tồn tại!",
                }
                return next(err);
            }

            let editProduct = {
                name: data.name,
                category: checkCategory,
                description: data.description,
                sold: 0,
                quantity: data.quantity,
                status: data.status,
                featured: data.featured
            }

            if (file) {
                let image = await FileService.uploadImage(file);

                if (image.code != Code.SUCCESS) {
                    let err = {
                        code: image.code,
                        message: image.message,
                    }
                    return next(err);
                }

                editProduct.thumbnail = image.data._id;

                await FileService.deleteImage(checkProduct.thumbnail);

            }
            await Product.updateOne({ _id: productId }, editProduct);

            checkProduct = await Product.findOne({ _id: productId });

            let productInfor = {
                _id: checkProduct.id,
                name: checkProduct.name,
                thumbnail: checkProduct.thumbnail,
                description: checkProduct.description,
                sold: checkProduct.sold,
                quantity: checkProduct.quantity,
                status: checkProduct.status,
                featured: checkProduct.featured,
            }

            resolve(productInfor);
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình chỉnh sữa sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình chỉnh sữa sản phẩm"
            };
            reject(err);
        }
    })
}

const deleteProduct = (productId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await Product.findOne({ _id: productId });

            if (!product) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy sản phẩm"
                }
                return next(err);
            }

            const orders = await Order.find({ 'orderDetails.productId': productId });
            if (orders.length > 0) {
                let err = {
                    code: Code.ERROR,
                    message: "Không thể xóa sản phẩm vì nó có trong đơn hàng"
                }
                return next(err);
            }

            await Product.deleteOne({ _id: productId });

            await FileService.deleteImage(product.thumbnail);

            await PriceDetail.deleteMany({ productId: productId });

            resolve(productId);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xóa sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xóa sản phẩm"
            };
            reject(err);
        }
    })
}

const getPriceListOfProduct = (productId, inforQuery) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await Product.findOne({_id: productId})

            const query = { 
                product: product
            };
    
            if (inforQuery.startDate && inforQuery.endDate) {
                query.appliedAt = {};
                query.createdAt = {};
                if (inforQuery.startDate) {
                    query.appliedAt.$gt = new Date(inforQuery.startDate);
                    query.createdAt.$gt = new Date(inforQuery.startDate);
                }
                if (inforQuery.endDate) {
                    query.appliedAt.$lte = new Date(inforQuery.endDate);
                    query.createdAt.$lte = new Date(inforQuery.endDate);
                }
            }

            const priceList = await PriceDetail.find(query)
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);

            const total = await PriceDetail.countDocuments({ product: product });
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let result = {
                content: priceList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy danh sách giá: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy danh sách giá"
            };
            reject(err);
        }
    })
}

const addNewPrice = (productId, userId, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await Product.findOne({ _id: productId });
            if (!product) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy sản phẩm"
                }
                return next(err);
            }

            let user = await User.findOne({_id: userId});
            if (!user) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy người dùng"
                }
                return next(err);
            }

            let priceDetail = new PriceDetail({
                admin: user,
                product: product,
                newPrice: data.newPrice,
                appliedAt: data.appliedAt,
                createdAt: new Date(),
            })

            let newPriceDetail = await priceDetail.save();

            resolve(newPriceDetail);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình tạo giá cho sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình tạo giá cho sản phẩm"
            };
            reject(err);
        }
    })
}

const delelteNewPrice = (priceId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let priceDetail = await PriceDetail.findOne({ _id: priceId });
            if (priceDetail.appliedAt < new Date()) {
                let err = {
                    code: Code.ERROR,
                    message: "Không thể xóa giá này vì đã áp dụng",
                }
                return next(err)
            } else if (+priceDetail.appliedAt === +new Date()) {
                let err = {
                    code: Code.ERROR,
                    message: "Không thể xóa giá này vì đã áp dụng",
                }
                return next(err)
            }

            await PriceDetail.deleteOne({ _id: priceId });

            resolve(priceId);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình quá giá mới`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình quá giá mới",
            }
            reject(err)
        }
    })
}

const getProduct = (productId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await Product.findOne({ _id: productId }).populate('category');
            if (!product) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy sản phẩm",
                }
                return next(err);
            }

            let priceDetail = await PriceDetail.findOne({ product: product, appliedAt: { $lte: new Date() } })
                .sort({ appliedAt: -1 }).limit(1);

            let productInfor = {
                _id: product.id,
                name: product.name,
                thumbnail: product.thumbnail,
                description: product.description,
                category: product.category,
                sold: product.sold,
                quantity: product.quantity,
                status: product.status,
                featured: product.featured,
                price: priceDetail.newPrice
            }
            resolve(productInfor);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy sản phẩm: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy sản phẩm"
            };
            reject(err);
        }
    })
}

module.exports = { createProduct, editProduct, deleteProduct, addNewPrice, delelteNewPrice, getPriceListOfProduct, getProductList, getProduct }