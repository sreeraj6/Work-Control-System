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
    getWorkcount:(staffId) => {
        return new Promise(async(resolve,reject) => {
            let work = await db.get().collection('complaints').find({AssignedStaffId:ObjectId(staffId)}).toArray()
            work = work.length;
            resolve(work)
        })
    },
    getTotalWorkingHours:(staffId) =>{
        return new Promise(async(resolve,reject) => {
            let present = await db.get().collection('attendance').find({$and:[{staffId:ObjectId(staffId)}]}).toArray()
            var total = 0;
            for (let i = 0; i < present.length; i++) {
                if(present[i].checkin_time && present[i].checkout_time!='live'){
                present[i].checkin_time = parseFloat(present[i].checkin_time);
                present[i].checkout_time = parseFloat(present[i].checkout_time);
                present[i].worktime = (present[i].checkout_time - present[i].checkin_time);
                total = total + present[i].worktime;
                }
                
            }
            resolve(total)
        })
    }
}