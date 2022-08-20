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
    res.render('admin/login',{'logErr':req.session.loginError})
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
    res.render('admin/add-staff',{'staffexist':req.session.staff})
    req.session.staff=false
})

//POST      /admin/adduser
//@DESC     add staff into company
router.post('/addstaff',(req,res)=>{
    admincontrol.addStaff(req.body).then((response)=>{
        console.log(response);
        if(response.user){
            req.session.staff = true
            res.redirect('/admin/addstaff')
        }else{
            res.redirect('/admin')
        }
    })
})

//POST  /admin/workdetails
//@DESC     get work status and details
router.get('/workdetails',(req,res)=>{
    workDetails.newWorks().then((works)=>{
        res.render('admin/workassign',{works})
    })
})



module.exports = router