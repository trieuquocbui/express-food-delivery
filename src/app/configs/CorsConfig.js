require('dotenv').config();
var cors = require('cors')

const corsOptions = {
    origin:  process.env.PORT_CLIENT
};

module.exports =  cors(corsOptions)