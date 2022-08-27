const express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminauth = require('../controllers/adminAuthentication');
var admincontrol = require('../controllers/adminStaffManage');
var workDetails = require('../controllers/adminControllers/WorkDetails')

//Verfiy admin is logged in or not
const verifyadmin = (req,res,next)=>{
    if(req.session.loggedIn){
        next()
    }else{
        res.redirect('/admin/login')
    }
}
//GET  /admin
//@DESC     admin dashboard
router.get('/',verifyadmin,(req,res)=>{
    
    admincontrol.getStaff().then((staff)=>{
        res.render('admin/staffmanagement',{staff,admin: true,username: req.session.user.username})
    })
})

//GET      /admin/login
//@DESC     admin login page get
router.get('/login',(req,res)=>{
    res.render('admin/login',{admin: true,'logErr':req.session.loginError})
    req.session.loginError=false
})

//POST      /admin/login
//@DESC     post credentials from admin and validate
router.post('/login',(req,res)=>{
    adminauth.doLogin(req.body).then((response)=>{
        if(response.status){
            req.session.loggedIn = true
            req.session.user = response.user
            res.redirect('/admin')
        } else {
            req.session.loginError = true
            res.redirect('/admin/login')
        }
    })
})

//GET      /admin/adduser
//@DESC     load add-staff page into browser
router.get('/addstaff',(req,res)=>{
    res.render('admin/add-staff',{admin: true,'staffexist':req.session.staff})
    req.session.staff=false
})

//POST      /admin/adduser
//@DESC     add staff into company
router.post('/addstaff',(req,res)=>{
    admincontrol.addStaff(req.body).then((response)=>{
        if(response.user){
            req.session.staff = true
            res.redirect('/admin/addstaff')
        }else{
            res.redirect('/admin')
        }
    })
})

//GET  /admin/pending works
//@DESC     assign pending works to the available staff
router.get('/pendingworks',async (req,res)=>{
    let availStaff = await admincontrol.getAvailableStaff()
    workDetails.newWorks().then((works)=>{
        res.render('admin/workassign',{admin: true,works,availStaff})
    })
})

//GET   /admin/workdetails
//@DESC current work deatils
router.get('/workdetails',(req,res)=>{
    workDetails.getWorkDetails().then((workdata)=>{
        for(var i=0;i<workdata.length;i++){
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
        res.render('admin/works',{admin: true,workdata})
    })
})

//POST  /admin/assign
//@DESC assign work to the avilable employ
router.post('/assign',(req,res)=>{
    workDetails.assignWork(req.body).then((response)=>{
        res.json(response)
    })
})

router.get('/map',(req,res)=>{
    res.render('admin/map')
})
module.exports = router