require('dotenv').config();
require('./app/configs/DatabaseConfig.js');
const express = require('express');

const authRoute = require('./app/routes/auth/Auth.js');



const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoute);

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