const { ObjectId } = require('mongodb');
const { response } = require('../../app');
var db = require('../../config/connection');

module.exports={
    getUserCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection('users').find().toArray()
            if(users){
                resolve(users.length)
            }else{
                resolve(0)
            }
        })
    }
}