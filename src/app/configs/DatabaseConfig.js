require('dotenv').config();
const RolesConstant = require('../constants/RoleConstant.js');
const Role = require('../models/Role.js')
const mongoose = require("mongoose");

createRoles = async (values) => {
    for (let val of values) {
        let isRole = await Role.findOne({ _id: val.id });
        if (!isRole) {
            let newRole = new Role({
                _id: val.id,
                name: val.name,
            });
            try {
                await newRole.save();
            } catch (error) {
                console.error(`Error when create role ${val.id}:`, error);
            }
        }
    }
};

mongoose
    .connect(process.env.MONGO_PROD_URI)
    .then(() => console.log('Successfully connected to the database'))
    .then(() => {
        return createRoles(RolesConstant);
    })
    .catch(err => {
        console.log(err)
        process.exit();
    });

