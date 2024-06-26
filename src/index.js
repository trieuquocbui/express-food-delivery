require('dotenv').config();
require('./app/configs/DatabaseConfig.js');
const express = require('express');

const authRoute = require('./app/routes/auth/AuthRoute.js');
const productManagementRoute = require('./app/routes/admin/ProductRoute.js');
const categoryManagementRoute = require('./app/routes/admin/CategoryRoute.js');
const publicRoute = require('./app/routes/public/PublicRoute.js');
const CustomerOrderRoute = require('./app/routes/user/OrderRoute.js');
const EmployeeOrderRoute = require('./app/routes/employee/OrderRoute.js');

const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoute);

app.use('/api/v1/management/category', categoryManagementRoute);

app.use('/api/v1/management/product', productManagementRoute);

app.use('/api/v1/:username/order', CustomerOrderRoute);

app.use('/api/v1/order', EmployeeOrderRoute);

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