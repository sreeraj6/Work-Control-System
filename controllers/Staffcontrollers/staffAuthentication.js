const db = require('../../config/connection');
var bcrypt = require('bcrypt');


module.exports = {
    doLogin: (staffData) => {
        var Crednt = {
            email: staffData.email,
            password: staffData.password
        }
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection('staff').findOne({ email: staffData.email })
            if (user) {
                bcrypt.compare(staffData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    }
}