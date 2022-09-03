const db = require('../config/connection')
var bcrypt = require('bcrypt')

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
            for(var i=0;i<staff.length;i++){
                switch(staff[i].checkin,staff[i].leave){
                    case 0:
                        staff[i].checkin="Not available"
                        staff[i].leave=""
                        break;
                    case 1:
                        staff[i].checkin="Available"
                        staff[i].leave="Requested"
                        break;
                    case 2:
                        staff[i].checkin="On work"
                        staff[i].leave="Granted"
                        break;
                    case 3:
                        staff[i].leave="Rejected"
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
    getLeaveRequest:()=>{
        return new Promise(async(resolve,reject)=>{
            let leavereq = await db.get().collection('attendance').aggregate([
                {
                    $match:{
                        leave:{$eq:1}
                    }
                },{
                    $lookup:{
                        from:'staff',
                        localField:'staffId',
                        foreignField:'_id',
                        as:'staff'
                    }
                },{
                    $project:{
                        _id:0,date:1,type:1,reason:1,staff:{$arrayElemAt:['$staff',0]}
                    }
                 }
            ]).toArray()
            resolve(leavereq)
        })
    }
}