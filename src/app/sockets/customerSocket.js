const namespace = require('../constants/NamespaseSocket')


module.exports = (io) => {
    io.of(namespace.CUSTOMER).on('connection', (socket) => {
        console.log("A customer connect");
    })
}
