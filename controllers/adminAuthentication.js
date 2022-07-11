const db = require('../config/connection')
const bcrypt = require('bcrypt')
module.exports = {
    doLogin: (adminCred) => {
        var Crednt = {
            email: adminCred.email,
            password: adminCred.password
        }
        return new Promise(async (resolve, reject) => {
            let response = {}
            let loginStatus = false
            let user = await db.get().collection('admin').findOne({ email: Crednt.email })

            if (user) {
                bcrypt.compare(adminCred.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            }
        })
    },

    addUser: (adminDetails) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let check = null
            check = await db.get().collection('admin').findOne({ email: adminDetails.email })
            if (check) {
                response.user = true
                resolve(response)
            } else {
                console.log(adminDetails);
                adminDetails.password = await bcrypt.hash(adminDetails.password, 10)
                db.get().collection('admin').insertOne(adminDetails).then((response) => {
                    response.user = false
                    resolve(response)
                })
            }
        })
    }
}