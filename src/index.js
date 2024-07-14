require('dotenv').config();
require('./app/configs/DatabaseConfig.js');
const express = require('express');
const cors = require('./app/configs/CorsConfig.js');

const authRoute = require('./app/routes/auth/AuthRoute.js');
const productManagementRoute = require('./app/routes/admin/ProductRoute.js');
const categoryManagementRoute = require('./app/routes/admin/CategoryRoute.js');
const publicRoute = require('./app/routes/public/PublicRoute.js');
const customerOrderRoute = require('./app/routes/customer/OrderRoute.js');
const employeeOrderRoute = require('./app/routes/employee/OrderRoute.js');
const orderManagementRoute = require('./app/routes/admin/OrderRoute.js');
const accountManagementRoute = require('./app/routes/admin/AccountRoute.js');
const customerAccountRoute = require('./app/routes/customer/AccountRoute.js');
const signmentOfAdminRoute = require('./app/routes/admin/AssignmenRoute.js');
const signmentOfEmployeeRoute = require('./app/routes/employee/AssignmenRoute.js');

const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const app = express();

app.use(cors); 

app.use(express.json());

app.use('/api/v1/auth', authRoute);

app.use('/api/v1/management/account', accountManagementRoute);

app.use('/api/v1/management/category', categoryManagementRoute);

app.use('/api/v1/management/product', productManagementRoute);

app.use('/api/v1/management/order', orderManagementRoute);

app.use('/api/v1/customer/account', customerAccountRoute);

app.use('/api/v1/order', customerOrderRoute);

app.use('/api/v1/admin/assignment', signmentOfAdminRoute);

app.use('/api/v1/employee/assignment', signmentOfEmployeeRoute);

app.use('/api/v1/employee/order', employeeOrderRoute);

app.use('/api/v1/public', publicRoute);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const data = error.data;
    const code = error.code;
    const message = error.message;
    res.status(status).json({
        code: code,
        message: message,
        data: data
    });
});

app.listen(port, () => {
    console.log(`Server is running http://${hostname}:${port}`);
});