const namespace = require('../constants/NamespaseSocket')


module.exports = (io) => {
    io.of(namespace.ADMIN).on('connection', (socket) => {
        console.log("A admin connect");
    })
}
