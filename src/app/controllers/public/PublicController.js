const FileService = require('../../services/FileService.js');
const ProductService = require('../../services/ProductService.js');
const Code = require('../../constants/CodeConstant.js');

const getImage = async (req, res, next) => {
    const imageId = req.params.imageId;
    try {
        let image = await FileService.getImage(imageId);
        res.contentType(image.data.contentType);
        res.send(image.data.image);
    } catch (error) {
        next(error);
    }
}

const getProduct = async (req, res, next) => {
    let productId = req.params.productId;
    try {
        let result = await ProductService.getProduct(productId, next);
        let success = {
            code: Code.SUCCESS,
            message: "Lấy phẩm thành công",
            data: result
        }
        res.send(success)
    } catch (error) {
        next(error);
    }
}

module.exports = { getImage, getProduct }