const db = require('../config/connection')
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('../app')

module.exports = {
    //Add new staff into company
    addStaff: (staffData) => {
        var data = {
            name: staffData.name,
            email: staffData.email,
            password: staffData.name + '@scws', //Generate default password
            gender: parseInt(staffData.gender), //String to integer type casting
            phone: parseInt(staffData.phone),   //String to integer type casting
            date: new Date() //Generate current date and time
        }
        return new Promise(async (resolve, reject) => {
            let response = {}
            let check = null
            check = await db.get().collection('staff').findOne({ email: data.email }) //check the email is already existing on DB
            if (check) {
                response.user = true
                resolve(response);
            } else {
                data.password = await bcrypt.hash(data.password, 10); //hashing password into encrypted (not human readable)
                if (data.gender == 1) {
                    data.gender = 'male'
                } else {
                    data.gender = 'female'
                }
                db.get().collection('staff').insertOne(data).then((response) => {   //insert Data into DB
                    response.user = false
                    resolve(response)
                })
            }
        })
    },

    //Show all userinfo to admin
    getStaff: () => {
        return new Promise(async (resolve, reject) => {
            let staff = await db.get().collection('staff').find().toArray()
            for (var i = 0; i < staff.length; i++) {
                switch (staff[i].checkin) {
                    case 0:
                        staff[i].checkin = "Not available"
                        break;
                    case 1:
                        staff[i].checkin = "Available"
                        break;
                    case 2:
                        staff[i].checkin = "On work"
                        break;
                }
            }
            for (var i = 0; i < staff.length; i++) {
                switch (staff[i].leave) {
                    case 0:
                        staff[i].leave = " "
                        break;
                    case 1:
                        staff[i].leave = "requested"
                        break;
                    case 2:
                        staff[i].leave = "Leave"
                        break;
                    case 3:
                        staff[i].leave = "Rejected"
                        break;
                }
            }
            resolve(staff);
        })
    },

    //staff current details
    getStaffCheckinout: () => {
        return new Promise(async (resolve, reject) => {
            let staffData = await db.get().collection('attendance')
        })
    },

    //available staff
    getAvailableStaff: () => {
        return new Promise(async (resolve, reject) => {
            let availStaff = await db.get().collection('staff').find({ checkin: 1 }).toArray()
            resolve(availStaff)
        })
    },
    getLeaveRequest: () => {
        return new Promise(async (resolve, reject) => {
            let leavereq = await db.get().collection('attendance').aggregate([
                {
                    $match: {
                        leave: { $eq: 1 }
                    }
                }, {
                    $lookup: {
                        from: 'staff',
                        localField: 'staffId',
                        foreignField: '_id',
                        as: 'staff'
                    }
                }, {
                    $project: {
                        _id: 0, date: 1, type: 1, reason: 1, staff: { $arrayElemAt: ['$staff', 0] }
                    }
                }
            ]).toArray()
            resolve(leavereq)
        })
    },
    validateLeave: (data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            db.get().collection('attendance').updateOne({
                $and:[ { staffId:ObjectId(data.staffId) } , { leave: { $eq: 1 } } ]
            },{
                $set:{ leave: data.value }
            })
            db.get().collection('staff').updateOne({_id:ObjectId(data.staffId)},{
                $set:{ leave: data.value }
            }).then((response)=>{
                if(data.value == 2){
                    resolve({grant:true})
                } else {
                    resolve({grant:false})
                }
            })
        })
    },
    getLeaveCount: ()=>{
        return new Promise(async(resolve,reject) => {
            var today = new Date().getDate()+"/0"+new Date().getMonth()+"/"+new Date().getFullYear();
            console.log(today);
            let leave = await db.get().collection('attendance').find({$and:[{leave:{$eq:2}},{date:today}]}).toArray()
            console.log(leave);
            resolve(leave.length)
        })
    },
    getCurrentStaff:(staffId) =>{
        return new Promise((resolve,reject) => {
             db.get().collection('staff').findOne({_id:ObjectId(staffId)}).then((response)=>{
                resolve(response)
             })
            
        })
    },
    updateStaffData:(staffData) =>{
        return new Promise(async(resolve,reject) => {
            staffData.password = await bcrypt.hash(staffData.password, 10);
            db.get().collection('staff').updateOne(
                {_id:ObjectId(staffData.staffId)},
                {
                    $set:{
                        name:staffData.name,
                        email:staffData.email,
                        phone:staffData.phone,
                        password:staffData.password
                    }
                }
                ).then((response)=>{
                    resolve(response)
                })
        })
    },
    getPerformance:(staffId) => {
        return new Promise(async(resolve,reject) => {
            let present = await db.get().collection('attendance').find({$and:[{staffId:ObjectId(staffId)}]}).toArray()
            let work = await db.get().collection('complaints').find({AssignedStaffId:ObjectId(staffId)}).toArray()
            console.log(present);
            var total = 0;
            for (let i = 0; i < present.length; i++) {
                if(present[i].checkin_time && present[i].checkout_time!='live'){
                present[i].checkin_time = parseFloat(present[i].checkin_time);
                present[i].checkout_time = parseFloat(present[i].checkout_time);
                present[i].worktime = (present[i].checkout_time - present[i].checkin_time);
                total = total + present[i].worktime;
                } else if(present[i].checkout_time=='live'){
                    present[i].worktime = present[i].checkout_time;
                }
                 else{
                    present[i].worktime = 'Leave'
                }
                
            }
            resolve(present,work)
        })
    },
    getStaffData:(staffId) => {
        return new Promise((resolve,reject)=>{
            db.get().collection('attendance').find({staffId:ObjectId(staffId)}).toArray().then((response)=>{
                resolve(response)
            })
        })
    }
}