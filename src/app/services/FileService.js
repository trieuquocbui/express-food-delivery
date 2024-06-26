const Image = require('../models/Image.js');
const Code = require('../constants/CodeConstant.js');

const uploadImage = async (file) => {
    try {
        const newImage = new Image({
            filename: file.originalname,
            contentType: file.mimetype,
            image: file.buffer,
        });
        let data = await newImage.save();
        return { code: Code.SUCCESS, message: 'upload file thành công', data: data };
    } catch (error) {
        return { code: Code.ERROR, message: 'Lỗi upload file' + error.message };
    }
}

const deleteImage = async (fileId) => {
    try {
        let data = await Image.deleteOne({ _id: fileId });
        return { code: Code.SUCCESS, message: 'Xóa file thành công', data: fileId };
    } catch (error) {
        return { code: Code.ERROR, message: 'Lỗi xóa file' + error.message };
    }
}

const getImage = async (fileId) => {
    try {
        let data = await Image.findOne({ _id: fileId });
        return { code: Code.SUCCESS, message: 'Lấy file thành công', data: data };
    } catch (error) {
        return { code: Code.ERROR, message: 'Lỗi lấy file' + error.message };
    }
}

module.exports = { uploadImage, deleteImage, getImage } 