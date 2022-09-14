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
                date: currentDate
            }, {
                $set: {
                    checkin: 2,
                    complaintId: data.complaintId,
                    last_time: currentTime
                }
            }
            )
            db.get().collection('staff').updateOne({ _id: ObjectId(data.staffId) },
                {
                    $set: { checkin: 2 }
                }).then((response) => {
                    resolve({ assign: true })
                })
        })
    },
    getWorkDetails: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection('complaints').aggregate([
                {
                    $match: {
                        status: {
                            $gt: 1,
                            $lte: 6
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'staff',
                        localField: 'AssignedStaffId',
                        foreignField: '_id',
                        as: 'staff'
                    }
                }, {
                    $project: {
                        complaint_topic: 1, phone: 1, status: 1, staff: { $arrayElemAt: ['$staff', 0] }
                    }
                }
            ]).toArray()
            resolve(data)
        })
    },
    getLocOfStaff: () => {
        return new Promise(async (resolve, reject) => {
            let location = await db.get().collection('staff').find(/*{checkin:{$gt:0}}*/).toArray();
            let latestloc = []
            if (location != null) {
                for (var i = 0; i < location.length; i++) {
                    latestloc[i] = {
                        coords: {
                            lat: location[i].latitude,
                            lng: location[i].longitude
                        },
                        content: '<h1>' + location[i].name + '</h1><br>' + '<p>' + location[i].ctime + '</p>'
                    }
                }
                resolve(latestloc)
            }else {
                resolve()
            }
        })
    },
    getAssignedWork: () => {
        return new Promise(async (resolve, reject) => {
            let pendingWorks = await db.get().collection('complaints').find({ status: { $gt: 1 , $lt: 7} }).toArray();
            console.log(pendingWorks);
            resolve(pendingWorks)
        })
    },
}