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
                    })
                    db.get().collection('staff').updateOne({_id:ObjectId(staffId)},{
                        $set:{
                            checkin:1,
                            checkin_date:gpsloc.date,
                            checkin_time:gpsloc.time,
                            checkout_time:"live",
                            latitude:gpsloc.latitude,
                            longitude:gpsloc.longitude
                            }
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
                    db.get().collection('staff').updateOne({_id:ObjectId(staffId)},{
                        $set:{
                            checkin:1,
                            checkin_date:gpsloc.date,
                            checkin_time:gpsloc.time,
                            checkout_time:"live",
                            latitude:gpsloc.latitude,
                            longitude:gpsloc.longitude
                            }
                    })
                    resolve(response)
                })
            }
        })
    },
    doCheckOut: (gpsloc,staffId)=>{
        var status = {}
        return new Promise(async (resolve,reject)=>{
            let checkin = await db.get().collection('attendance').findOne({$and:[{staffId:ObjectId(staffId)},{checkinout:{$elemMatch:{date:gpsloc.date}}}]});
            if(checkin!=null){
                db.get().collection('attendance').updateOne({
                    staffId:ObjectId(staffId),
                    checkinout:{
                        $elemMatch:{
                            date:gpsloc.date
                        }
                    }
                },{
                    $set:{
                        "checkinout.$.checkin":0,
                        "checkinout.$.checkout_date":gpsloc.date,
                        "checkinout.$.checkout_time":gpsloc.time,
                        "checkinout.$.checkout_latitude":gpsloc.latitude,
                        "checkinout.$.checkout_longitude":gpsloc.longitude
                    }
                }
                )
                db.get().collection('staff').updateOne({_id:ObjectId(staffId)},{
                    $set:{
                        latitude:gpsloc.latitude,
                        longitude:gpsloc.longitude,
                        checkout_time:gpsloc.time,
                        checkin:0
                    }
                }).then((response)=>{

                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
        })
    },
    
}           