const { ObjectId } = require('mongodb');
const { response } = require('../../app');
var db = require('../../config/connection');

module.exports = {

    //get assigned work of the stafff
    getAssignedWork: (staffId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('complaints').findOne({
                $and: [
                    {
                        AssignedStaffId: ObjectId(staffId)
                    },
                    {
                        status: { $lt: 7 }
                    }
                ]
            }).then((response) => {
                resolve(response)
            })
        })
    },
    statusUpdate: (data) => {
        console.log(data);
        return new Promise(async(resolve, reject) => {
            let check = await db.get().collection('complaints').findOne({_id: ObjectId(data.complaintId)})
            if(check.status <6){
                db.get().collection('complaints').updateOne(
                    {
                        _id: ObjectId(data.complaintId)
                    },{
                        $inc:{status:1}
                    }
                ).then((response) => {
                    resolve(response)
                })
            } else {
                resolve({check:true})
            }
        })
    },

    updateStaffLoc: (loc, staffId) => {
        console.log(loc);
        return new Promise((resolve,reject) => {
            db.get().collection('staff').updateOne({
                _id:ObjectId(staffId)
            },{
                $set:{
                    ctime:loc.time,
                    cdate:loc.date,
                    latitude:loc.latitude,
                    longitude:loc.longitude
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    readyToWork:(data,staffId) =>{
        return new Promise(async(resolve,reject)=>{
            console.log(staffId,data.date);
            let date = await db.get().collection('attendance').findOne({$and:[{staffId:ObjectId(staffId)},{date:data.date}]});
            console.log(date);
                if(date){
                    db.get().collection('attendance').updateOne({
                        staffId:ObjectId(staffId),
                        date:data.date
                         
                    },{
                        $set:{
                            checkin:1,
                            cdate:data.date,
                            ctime:data.time,
                            latitude:data.latitude,
                            longitude:data.longitude
                        }
                    }
                    )
                    db.get().collection('staff').updateOne({_id:ObjectId(staffId)},{
                        $set:{
                            checkin:1,
                            cdate:data.date,
                            ctime:data.time,
                            latitude:data.latitude,
                            longitude:data.longitude
                            }
                    })
                    db.get().collection('complaints').updateOne({
                        $and:
                        [
                            { AssignedStaffId : ObjectId(staffId) },
                            { status: 6}
                        ]
                    },{
                        $set:{status:7}
                    })
                    .then((response)=>{
                        resolve(response)
                    })
                }else{
                    resolve({res:true})
                }
        })
    },
}