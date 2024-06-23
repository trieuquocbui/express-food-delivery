require('dotenv').config();
require('./app/configs/DatabaseConfig.js');
const express = require('express');

const authRoute = require('./app/routes/auth/Auth.js');
const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const app = express();

app.use(express.json());

app.use('/api/v1/', authRoute);

app.listen(port, () => {
    console.log(`Server is running http://${hostname}:${port}`);
});