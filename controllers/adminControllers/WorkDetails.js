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
        var currentDate = new Date().getDate()+"/"+new Date().getMonth()+"/"+new Date().getFullYear();
        var currentTime = new Date().getHours()+":"+new Date().getMinutes();
        return new Promise(async (resolve,reject) => {
            let assign = await db.get().collection('complaints').updateOne({_id:ObjectId(data.complaintId)},
            {
                $set:{
                    AssignedStaffId:ObjectId(data.staffId),
                    status:2
                }
            })
            let work = await db.get().collection('attendance').updateOne({
                staffId:ObjectId(data.staffId),
                checkinout:{
                    $elemMatch:{
                        date:currentDate
                    }
                }
            },{
                $set:{
                    "checkinout.$.checkin":1,
                    "checkinout.$.complaintId":data.complaintId,
                    "checkinout.$.last_time":currentTime
                }
            }
            )
                db.get().collection('staff').updateOne({_id:ObjectId(data.staffId)},
                {
                    $set:{checkin:1}
                }).then((response)=>{
                    resolve(response)
                })  
        })
    }
}