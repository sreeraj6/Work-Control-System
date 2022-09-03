const express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminauth = require('../controllers/adminAuthentication');
var admincontrol = require('../controllers/adminStaffManage');
var workDetails = require('../controllers/adminControllers/WorkDetails');
var adminUser = require('../controllers/adminControllers/userAccess')
var username;
//Verfiy admin is logged in or not
const verifyadmin = (req, res, next) => {
    if (req.session.loggedIn) {
        username = req.session.user.username ,
        next()
    } else {
        res.redirect('/admin/login')
    }
}
//GET       /admin
//@DESC     admin dashboard
router.get('/',verifyadmin, async(req, res) => {
    let staffStatus = await admincontrol.getStaff()
    let workdata = await workDetails.getWorkDetails();
    let pendingworks = await workDetails.newWorks();
    let availStaff = await admincontrol.getAvailableStaff();
    let usercount = await adminUser.getUserCount();
    for (var i = 0; i < workdata.length; i++) {
        switch (workdata[i].status) {
            case 1:
                workdata[i].status = "Assigned"
                break;
            case 2:
                workdata[i].status = "Verified"
                break;
            case 3:
                workdata[i].status = "On road"
                break;
            case 4:
                workdata[i].status = "Reached"
                break;
            case 4:
                workdata[i].status = "Solved"
                break;
            case 5:
                workdata[i].status = "Completed"
                break;
        }
    }
    let pending = pendingworks.length;
    res.render('admin/dashboard',{staffStatus,workdata,admin:true,pending,usercount,progress:workdata.length,avail:availStaff.length,username})
})
//GET  /admin/staff
//@DESC     staff checkin/out and leave details
router.get('/staff', verifyadmin, (req, res) => {
    admincontrol.getStaff().then((staff) => {
        res.render('admin/staffmanagement', { staff, admin: true, username: req.session.user.username })
    })
})

//GET      /admin/login
//@DESC     admin login page get
router.get('/login', (req, res) => {
    res.render('admin/login', { admin: true, 'logErr': req.session.loginError })
    req.session.loginError = false
})

//POST      /admin/login
//@DESC     post credentials from admin and validate
router.post('/login', (req, res) => {
    adminauth.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true
            req.session.user = response.user
            res.redirect('/admin')
        } else {
            req.session.loginError = true
            res.redirect('/admin/login')
        }
    })
})

//GET   /staff/logout
//@DESC   logout staff
router.get('/logout',verifyadmin,(req,res)=>{
    req.session.destroy()
    res.redirect('/admin')
  })
//GET      /admin/adduser
//@DESC     load add-staff page into browser
router.get('/addstaff', (req, res) => {
    res.render('admin/add-staff', { admin: true, 'staffexist': req.session.staff })
    req.session.staff = false
})

//POST      /admin/adduser
//@DESC     add staff into company
router.post('/addstaff', (req, res) => {
    admincontrol.addStaff(req.body).then((response) => {
        if (response.user) {
            req.session.staff = true
            res.redirect('/admin/addstaff')
        } else {
            res.redirect('/admin')
        }
    })
})

//GET  /admin/pending works
//@DESC     assign pending works to the available staff
router.get('/pendingworks',verifyadmin, async (req, res) => {
    let availStaff = await admincontrol.getAvailableStaff()
    workDetails.newWorks().then((works) => {
        res.render('admin/workassign', { admin: true, works, availStaff,username })
    })
})

//GET   /admin/workdetails
//@DESC current work deatils
router.get('/workdetails',verifyadmin, (req, res) => {
    workDetails.getWorkDetails().then((workdata) => {
        for (var i = 0; i < workdata.length; i++) {
            switch (workdata[i].status) {
                case 1:
                    workdata[i].status = "Searching for staff"
                    break;
                case 2:
                    workdata[i].status = "Assigned"
                    break;
                case 3:
                    workdata[i].status = "Verified"
                    break;
                case 4:
                    workdata[i].status = "On road"
                    break;
                case 5:
                    workdata[i].status = "Reached"
                    break;
                case 6:
                    workdata[i].status = "Solved"
                    break;
                case 7:
                    workdata[i].status = "Completed"
                    break;
            }
        }
        res.render('admin/works', { admin: true, workdata ,username})
    })
})

//POST  /admin/assign
//@DESC assign work to the avilable employ
router.post('/assign', (req, res) => {
    workDetails.assignWork(req.body).then((response) => {
        res.json(response)
    })
})

router.get('/map', (req, res) => {
    workDetails.getLocOfStaff().then((location) => {
        res.render('admin/map', { location })
    })
})
router.get('/getloc', (req, res) => {
    workDetails.getLocOfStaff().then((response) => {
        res.json(response)
    })
})

router.get('/leave',(req,res)=>{
    admincontrol.getLeaveRequest().then((leavereq)=>{
        res.render('admin/leave',{leavereq,admin:true})
    })
})


module.exports = router