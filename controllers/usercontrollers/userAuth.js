const db = require('../../config/connection');
var bcrypt = require('bcrypt')

module.exports = {

    addUser: (Data) => {
        var userData = {
            email: Data.email,
            password: Data.password,
            name: Data.name,
            phone: parseInt(Data.phone),
            address: Data.address,
            landmark: Data.landmark,
            city: parseInt(Data.city),
            state: parseInt(Data.state),
            zip: parseInt(Data.zip),
            date: new Date()
        }
        return new Promise(async (resolve, reject) => {
            let response = {}
            let checkExist = null
            checkExist = await db.get().collection('users').findOne({ email: userData.email })
            if (checkExist) {
                response.user = true;
                resolve(response);
            } else {
                userData.password = await bcrypt.hash(userData.password, 10);
                userData.state = 'kerala'
                if (userData.city == 1) {
                    userData.city = 'Kollam'
                } else {
                    userData.city = 'Trivandrum'
                }
                db.get().collection('users').insertOne(userData).then((response) => {
                    response.user = false
                    resolve(response)
                })
            }
        })
    },

    doLogin: (userCredential) => {
        var credential = {
            email: userCredential.email,
            password: userCredential.password
        }
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection('users').findOne({ email: credential.email })
            if (user) {
                bcrypt.compare(credential.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }

        })
    },
}