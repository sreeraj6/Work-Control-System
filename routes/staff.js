var express = require('express');
const { response } = require('../app');
var router = express.Router();
var staffAuth = require('../controllers/Staffcontrollers/staffAuthentication')
var staffAttend = require('../controllers/Staffcontrollers/staffAttendance')
var staffWork = require('../controllers/Staffcontrollers/AboutWork')

//This constant will verify that staff is logged in 
const verifystaff = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  } else {
    res.redirect('/staff/login')
  }
}


//GET   /staff
//@DESC   staff dashboard
router.get('/', verifystaff,(req, res) => {
  console.log(req.session.user._id);
  staffWork.getAssignedWork(req.session.user._id).then((currentwork)=>{
    res.render('staff/home',{currentwork})
  })
});

//GET   /staff/login
//@DESC staff login page
router.get('/login', (req, res) => {
  res.render('staff/login', { staffhead: true, 'logError': req.session.loginErr })
  req.session.loginErr = false
})

//POST  /staff/login
//@DESC   post data info into server and match the info into db and give valid response
router.post('/login', (req, res) => {
  staffAuth.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/staff')
    } else {
      req.session.loginErr = true
      res.redirect('/staff/login')
    }
  })
})

//GET   /staff/logout
//@DESC   logout staff
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

//POST  /staff/checkin
//@DESC staff checkin fetch location and time
router.post('/checkin',(req,res)=>{
  staffAttend.doCheckIn(req.body,req.session.user._id).then((response)=>{
    console.log(response);
  })
})

//POST  /staff/checkout
//@DESC  staff checkout
router.post('/checkout',(req,res)=>{
  staffAttend.doCheckOut(req.body,req.session.user._id).then((response)=>{
    console.log(response);
  })
})

//GET   /staff/checkinout
//@DESC   staff checkin checkout page
router.get('/checkinout',(req,res)=>{
  console.log(req.session.user._id);
})
module.exports = router;
