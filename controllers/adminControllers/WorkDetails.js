const { ObjectId } = require('mongodb');
const { response } = require('../../app');
var db = require('../../config/connection');

module.exports = {
    //get new works
    newWorks: () => {
        return new Promise(async (resolve, reject) => {
            let pendingWorks = await db.get().collection('complaints').find({ status: { $eq: 1 } }).toArray();
            resolve(pendingWorks)
        })
    },

    //Assign work to staff
    assignWork: (data) => {
        var currentDate = new Date().getDate() + "/" + new Date().getMonth() + "/" + new Date().getFullYear();
        var currentTime = new Date().getHours() + ":" + new Date().getMinutes();
        return new Promise(async (resolve, reject) => {
            let assign = await db.get().collection('complaints').updateOne({ _id: ObjectId(data.complaintId) },
                {
                    $set: {
                        AssignedStaffId: ObjectId(data.staffId),
                        status: 2
                    }
                })
            let work = await db.get().collection('attendance').updateOne({
                staffId: ObjectId(data.staffId),
                checkinout: {
                    $elemMatch: {
                        date: currentDate
                    }
                }
            }, {
                $set: {
                    "checkinout.$.checkin": 2,
                    "checkinout.$.complaintId": data.complaintId,
                    "checkinout.$.last_time": currentTime
                }
            }
            )
            db.get().collection('staff').updateOne({ _id: ObjectId(data.staffId) },
                {
                    $set: { checkin: 2 }
                }).then((response) => {
                    resolve({assign:true})
                })
        })
    },
    getWorkDetails: () => {
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection('complaints').aggregate([
                {
                    $match:{
                        status:{
                            $gte:1,
                            $lt:6
                        }
                    }
                },
                {
                    $lookup:{
                        from:'staff',
                        localField:'AssignedStaffId',
                        foreignField:'_id',
                        as:'staff'
                    }
                },{
                    $project:{
                        complaint_topic:1,phone:1,status:1,staff:{$arrayElemAt:['$staff',0]}
                    }
                }
            ]).toArray()
            resolve(data)
        })
    }
}