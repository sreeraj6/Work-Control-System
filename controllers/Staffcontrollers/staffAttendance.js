const { response } = require('express')
const { ObjectId } = require('mongodb')
var db = require('../../config/connection')

module.exports = {
    doCheckIn: (gpsloc, staffId) => {
        return new Promise(async (resolve, reject) => {
            let checkinObj = {
                staffId: ObjectId(staffId),
                checkin: 1,
                date: gpsloc.date,
                checkin_date: gpsloc.date,
                checkin_time: gpsloc.time,
                checkout_time: "live",
                latitude: gpsloc.latitude,
                longitude: gpsloc.longitude,
                leave: 0
            }
            let date = await db.get().collection('attendance').findOne({ $and: [{ staffId: ObjectId(staffId) }, { date: gpsloc.date }] });
            if (date == null) {
                db.get().collection('attendance').insertOne(checkinObj)
                db.get().collection('staff').updateOne({ _id: ObjectId(staffId) }, {
                    $set: {
                        checkin: 1,
                        checkin_date: gpsloc.date,
                        checkin_time: gpsloc.time,
                        checkout_time: "live",
                        latitude: gpsloc.latitude,
                        longitude: gpsloc.longitude,
                        ctime: gpsloc.time,
                        cdate: gpsloc.date,
                        leave: 0
                    }
                }).then((response) => {
                    resolve({ checkin: true })
                })
            } else {
                resolve({ checkin: false })
            }
        })
    },
    doCheckOut: (gpsloc, staffId) => {
        var status = {}
        return new Promise(async (resolve, reject) => {
            let checkin = await db.get().collection('attendance').findOne({ $and: [{ staffId: ObjectId(staffId) }, { date: gpsloc.date }] });
            if (checkin != null) {
                db.get().collection('attendance').updateOne({
                    staffId: ObjectId(staffId),
                    date: gpsloc.date
                }, {
                    $set: {
                        checkin: 0,
                        checkout_date: gpsloc.date,
                        checkout_time: gpsloc.time,
                        checkout_latitude: gpsloc.latitude,
                        checkout_longitude: gpsloc.longitude
                    }
                }
                )
                db.get().collection('staff').updateOne({ _id: ObjectId(staffId) }, {
                    $set: {
                        latitude: gpsloc.latitude,
                        longitude: gpsloc.longitude,
                        checkout_time: gpsloc.time,
                        checkin: 0
                    }
                }).then((response) => {

                    resolve({ checkout: true })
                })
            } else {
                resolve({ checkout: false })
            }
        })
    },
    staffStatus: (staffId) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection('staff').findOne({ $and: [{ _id: ObjectId(staffId) }, { checkin: { $gt: 0 } }] })
            console.log(check);
            if (check != null) {
                resolve({ status: true })
            } else {
                resolve({ status: false })
            }
        })
    },
    requestLeave: (staffId, leave) => {
        let leaveObj = {
            staffId: ObjectId(staffId),
            date: leave.date,
            time: leave.time,
            type: leave.leavetype,
            reason: leave.reason,
            leave: 1
        }
        return new Promise(async (resolve, reject) => {
            let date = await db.get().collection('attendance').findOne({ $and: [{ staffId: ObjectId(staffId) }, { date: leave.date }] });
            if (date != null) {
                resolve({ status: false })
            } else {
                db.get().collection('attendance').insertOne(leaveObj)
                db.get().collection('staff').updateOne({ _id: ObjectId(staffId) }, {
                    $set: {
                        leavedate: leave.date,
                        leave: 1
                    }
                }).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    leaveStatus: (staffId) => {
        return new Promise(async (resolve, reject) => {
            let leave = await db.get().collection('attendance').find({
                $and:
                    [
                        { staffId: ObjectId(staffId) },
                        { leave: { $gte: 1 } }
                    ]
            }).toArray()
            if (leave.length > 0) {
                //assign value to the each level of status
                for (var i = 0; i < leave.length; i++) {
                    switch (leave[i].leave) {
                        case 1:
                            leave[i].leave = "Under review"
                            leave[i].badge = "badge-info"
                            break;
                        case 2:
                            leave[i].leave = "Leave Granted"
                            leave[i].badge = "badge-success"
                            leave[i].attribur= "disabled"
                            break;
                        case 3:
                            leave[i].leave = "Leave rejected"
                            leave[i].badge = "badge-danger"
                            leave[i].attribur= "disabled"
                            break;
                    }
                }
                resolve(leave)
            } else {
                resolve({notExist:true})
            }

        })
    },
    cancelLeave:(leaveId) => {
        return new Promise((resolve,reject) => {
            db.get().collection('attendance').deleteOne({_id:ObjectId(leaveId)}).then((response)=>{
                resolve(response)
            })
        })
    }

}           