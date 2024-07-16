const Image = require('../models/Image.js');
const Category = require('../models/Category.js');
const FileService = require('./FileService.js');
const Product = require('../models/Product.js');
const Code = require('../constants/CodeConstant.js');

const getCategoryList = (inforQuery) => {
    return new Promise(async (resolve, reject) => {
        try {
            const searchConditions = {};
            if (inforQuery.searchQuery) {
                searchConditions.$and = [
                    { name: { $regex: inforQuery.searchQuery, $options: 'i' } },
                ];
            }

            const categoryList = await Category.find(searchConditions)
                .sort({ [inforQuery.sortField]: inforQuery.sortOrder })
                .skip((inforQuery.page - 1) * inforQuery.limit)
                .limit(inforQuery.limit);

            const total = await Category.countDocuments();
            const totalPages = Math.ceil(total / inforQuery.limit);
            const isLastPage = inforQuery.page >= totalPages;

            let formattedCategoryList = categoryList.map(category => {
                return {
                    id: category._id,
                    name: category.name,
                    thumbnail: category.thumbnail,
                    status: category.status,
                };
            });

            let result = {
                content: formattedCategoryList,
                total: total,
                page: inforQuery.page,
                totalPages: totalPages,
                isLastPage: isLastPage,
            }
            resolve(result);
        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy danh sách thể loại: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy danh sách thể loại"
            };
            reject(err);
        }
    })
}

const addCategory = (file, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkId = await Category.findOne({ _id: data.id });
            if (checkId) {
                let err = {
                    code: Code.ERROR_ID_EXIST,
                    message: "Mã thể loại tồn tại!",
                }
                return next(err);
            }

            let checkName = await Category.findOne({ name: data.name });
            if (checkName) {
                let err = {
                    code: Code.ERROR_Name_EXIST,
                    message: "Tên thể loại đã tồn tại!",
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

            let category = new Category({
                _id: data.id,
                name: data.name,
                thumbnail: image.data._id,
                status: data.status,
            })

            let newCategory = await category.save();

            let categoryInfor = {
                id: newCategory.id,
                name: newCategory.name,
                thumbnail: newCategory.thumbnail,
                status: newCategory.status,
            }
            resolve(categoryInfor);

        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình tạo thể loại:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình tạo thể loại!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const editCategory = (categoryId, file, data, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let category = await Category.findOne({ _id: categoryId });
            if (!category) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Không tìm thấy thể loại!",
                }
                return next(err);
            }

            if (data.name != category.name) {
                let checkName = await Category.findOne({ name: data.name });
                if (checkName) {
                    let err = {
                        code: Code.ERROR_Name_EXIST,
                        message: "Tên thể loại đã tồn tại!",
                    }
                    return next(err);
                }
            }

            let image = {};
            if (file) {

                image = await FileService.uploadImage(file);

                if (image.code != Code.SUCCESS) {
                    let err = {
                        code: image.code,
                        message: image.message,
                    }
                    return next(err);
                }

                await FileService.deleteImage(category.thumbnail);
            }

            let editCaterogy = {
                name: data.name,
                status: data.status,
            }

            if (Object.keys(image).length > 0) {
                editCaterogy.thumbnail = image.data._id;
            }

            await Category.updateOne({ _id: categoryId }, editCaterogy);

            let editedCategory = await Category.findOne({ _id: categoryId });

            let categoryInfor = {
                _id: editedCategory.id,
                name: editedCategory.name,
                thumbnail: editedCategory.thumbnail,
                status: editedCategory.status,
            }
            resolve(categoryInfor);

        } catch (error) {
            console.error(`Lỗi xảy ra trong quá trình chỉnh sữa thể loại:`, error);
            let err = {
                status: 500,
                message: "Lỗi xảy ra trong quá trình chỉnh sữa thể loại!",
                code: Code.ERROR
            };
            reject(err);
        }
    })
}

const deleteCategory = (categoryId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let category = await Category.findOne({ _id: categoryId });
            if (!category) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Danh mục không tồn tại!",
                }
                return next(err);
            }

            let count = await Product.countDocuments({ categoryId: categoryId });
            if (count > 0) {
                let err = {
                    code: Code.ERROR,
                    message: "Không thể xóa thể loại!",
                }
                return next(err);
            }

            await FileService.deleteImage(category.thumbnail);

            await Category.deleteOne({ _id: categoryId });

            resolve(categoryId);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xóa thể loại: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xóa thể loại"
            };
            reject(err);
        }
    });
}

const getCategory = (cateroryId, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            let category = await Category.findOne({ _id: cateroryId });
            if (!category) {
                let err = {
                    code: Code.ENTITY_NOT_EXIST,
                    message: "Danh mục không tồn tại!",
                }
                return next(err);
            }

            resolve({id: category._id,
                    name: category.name,
                    thumbnail: category.thumbnail,
                    status: category.status});

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình xóa thể loại: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình xóa thể loại"
            };
            reject(err);
        }
    });
}

const getAll = ()=>{
    return new Promise(async (resolve, reject) => {
        try {
            let categoryList = await Category.find().select({ _id: 1, name: 1 });
            let formattedCategoryList = categoryList.map(category => {
                return {
                    id: category._id,
                    name: category.name,
                };
            });
            resolve(formattedCategoryList);

        } catch (error) {
            console.log(`Có lỗi xảy ra trong quá trình lấy danh mục: ${error}`);
            let err = {
                code: Code.ERROR,
                message: "Có lỗi xảy ra trong quá trình lấy danh mục"
            };
            reject(err);
        }
    });
}

module.exports = { getCategoryList, addCategory, editCategory, deleteCategory, getCategory, getAll }