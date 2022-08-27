const { ObjectId } = require('mongodb');
const { response } = require('../../app');
var db = require('../../config/connection');

module.exports = {

    //get assigned work of the stafff
    getAssignedWork: (staffId) => {
        return new Promise((resolve,reject) => {
            db.get().collection('complaints').findOne({
                $and:[
                    {
                        AssignedStaffId:ObjectId(staffId)
                    },
                    {
                        status:{$gt:1}
                    }
                ]
            }).then((response)=>{
                resolve(response)
            })
        })
    },
}