const { response } = require('express')
const { ObjectId } = require('mongodb')
var db = require('../../config/connection')

module.exports = {
    doCheckIn: (gpsloc,staffId) => {
        let loc ={
            latitude:gpsloc.latitude,
            longitude:gpsloc.longitude
        }
        let checkinObj = {
            checkin:1,
            date:gpsloc.date,
            time:gpsloc.time,
            latitude:gpsloc.latitude,
            longitude:gpsloc.longitude
        }
        return new Promise(async(resolve,reject)=>{
            let currentStaff = await db.get().collection('attendance').findOne({staffId:ObjectId(staffId)});
            if(currentStaff){
                let date = await db.get().collection('attendance').findOne({$and:[{staffId:ObjectId(staffId)},{checkinout:{$elemMatch:{date:gpsloc.date}}}]});
                console.log(date);
                if(date==null){
                    db.get().collection('attendance').updateOne({staffId:ObjectId(staffId)},{
                        $push:{checkinout:checkinObj}
                    }).then((response)=>{
                        resolve()
                    })
                }else{
                    resolve()
                }
            }else{
                let attendance = {
                    staffId : ObjectId(staffId),
                    checkinout:[checkinObj],
                    currentloc:[loc]
                }
                db.get().collection('attendance').insertOne(attendance).then((response)=>{
                    resolve(response)
                })
            }
        })
    },
    doCheckOut: (gpsloc,staffId)=>{
        var status = {}
        let loc ={
            latitude:gpsloc.latitude,
            longitude:gpsloc.longitude
        }
        let checkoutObj = {
            checkout_date:gpsloc.date,
            checkin_time:gpsloc.time,
            latitude:gpsloc.latitude,
            longitude:gpsloc.longitude
        }
        return new Promise(async (resolve,reject)=>{
            let checkin = await db.get().collection('attendance').findOne({$and:[{staffId:ObjectId(staffId)},{checkinout:{$elemMatch:{date:gpsloc.date}}}]});
            if(checkin!=null){
                
            }
        })
    }
}           