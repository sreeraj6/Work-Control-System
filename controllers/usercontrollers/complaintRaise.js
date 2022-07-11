const { response } = require('express')
const { ObjectId } = require('mongodb')
var db = require('../../config/connection')


module.exports = {
    raiseComplaint: (raisedData, userId) => {
        var raisedComplaint = {
            userId: userId,
            complaint_topic: raisedData.complaint,
            complaint_brief: raisedData.issue_brief,
            phone: raisedData.mobile,
            address: raisedData.address,
            landmark: raisedData.landmark,
            country: raisedData.country,
            state: raisedData.state,
            pincode: raisedData.pin,
            createdAt: new Date(),
            status: 1
        }
        return new Promise((resolve, reject) => {
            db.get().collection('complaints').insertOne(raisedComplaint).then((response) => {
                resolve(response)
            })
        })

    },
    getIssueHistory: (userId) => {
        return new Promise(async (resolve, reject) => {
            let status = null
            let issue = await db.get().collection('complaints').find({ userId: userId }).toArray()      //initialise all complaint into the issue
            let history = [];
            var j = 0;
            if (issue.length != 0) {
                for (var i = 0; i < issue.length; i++) {
                    if (issue[i].status == 0) {     //seperate completed work into history checking status(0,1) of the issue
                        history[j] = issue[i]
                        j++;
                    }
                }
                resolve(history)
            } else {
                resolve({ status: true })
            }
        })
    },
    getIssueStatus: (userId) => {
        return new Promise(async (resolve, reject) => {
            let issues = await db.get().collection('complaints').find({ userId: userId }).toArray()
            let workStatus = null
            if (issues.length != 0) {
                for (var i = 0; i < issues.length; i++) {
                    if (issues[i].status != 0) {
                        workStatus = issues[i]
                        workStatus.check = true
                        resolve(workStatus)
                    }
                }
            } else {
                resolve({check:false})
            }
        })
    }
}