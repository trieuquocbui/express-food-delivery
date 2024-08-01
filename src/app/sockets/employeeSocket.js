const namespace = require('../constants/NamespaseSocket')
const User = require('../models/User')
const Account = require('../models/Account.js')
const Location = require('../models/Location.js')
const AccountStatus = require('../constants/AccountStatus.js')
const onlineEMployees = require('./employeeOnline.js')


module.exports = (io) => {
    io.of(namespace.EMPLOYEE).on('connection', (socket) => {
        // console.log("A employee connect " + socket.id);
        
        let userId = null;
        let accountId = null;

        socket.on('employee-online', async (data) => {
          console.log("employee-online",data)
            accountId = data._id
            userId = data.user._id;
            onlineEMployees.set(userId, socket);
            await Account.findByIdAndUpdate(accountId, { status: AccountStatus.ONLINE });
        })
        
        socket.on('update-location', async (data) => {
            if (data.userId) {
              const location = new Location({
                employee: data.userId,
                location: {
                  type: "Point",
                  coordinates: [data.longitude, data.latitude]
                },
              });
              await location.save();
            }
          });


          socket.on('shipping-account', async (data) => {
            await Account.findByIdAndUpdate(accountId, { status: AccountStatus.SHIPPING });
          });

          socket.on('online-account', async (data) => {
            await Account.findByIdAndUpdate(accountId, { status: AccountStatus.ONLINE });
          });


    
          socket.on('disconnect', async () => {
            if (userId) {
              onlineEMployees.delete(userId)
              await Account.findByIdAndUpdate(accountId, { status: AccountStatus.OFFLINE });
              
            }
          });
    }) 
}
