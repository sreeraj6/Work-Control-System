const db = require('../../config/connection');
const { ObjectId } = require('mongodb')
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
    },
    getProfile:(staffId) =>{
        return new Promise((resolve,reject) => {
             db.get().collection('staff').findOne({_id:ObjectId(staffId)}).then((response)=>{
                switch(response.checkin){
                    case 0:
                        response.checkin = "Not available"
                        break;
                    case 1:
                        response.checkin = "Available"
                        break;
                    case 2:
                        response.checkin = "On duty"
                        break;
                }
                resolve(response)
             })
            
        })
    },
    
}