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
                    if (issue[i].status == 6) {     //seperate completed work into history checking status(0,1) of the issue
                        issue[i].status = "completed"
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
            let issues = await db.get().collection('complaints').find({ userId: userId },{status:{$lt:5}}).toArray()
            let workStatus = []
            var j = 0;
            if (issues.length != 0) {
                for (var i = 0; i < issues.length; i++) {
                    if (issues[i].status > 0 && issues[i].status < 6) {
                        switch (issues[i].status) {
                            case 1:
                                issues[i].status = "Assigned"
                                issues[i].badge = "badge-success"
                                break;
                            case 2:
                                issues[i].status = "Verified"
                                issues[i].badge = "badge-info"
                                break;
                            case 3:
                                issues[i].status = "On road"
                                issues[i].badge = "badge-success"
                                break;
                            case 4:
                                issues[i].status = "Reached"
                                issues[i].badge = "badge-success"
                                break;
                            case 4:
                                issues[i].status = "Solved"
                                issues[i].badge = "badge-danger"
                                break;
                            case 5:
                                issues[i].status = "Completed"
                                issues[i].badge = "badge-danger"
                                break;
                        }
                        workStatus[j] = issues[i]
                        j++
                    }
                    resolve(workStatus)
                }
            } else {
                resolve({check:false})
            }
        })
    }
}