var express = require('express');
const { response } = require('../app');
var router = express.Router();
var staffAuth = require('../controllers/Staffcontrollers/staffAuthentication')
var staffAttend = require('../controllers/Staffcontrollers/staffAttendance')
var staffWork = require('../controllers/Staffcontrollers/AboutWork');
const { route } = require('./user');

//This constant will verify that staff is logged in 
const verifystaff = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  } else {
    res.redirect('/staff/login')
  }
}




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
  res.redirect('/staff')
})

//GET   /staff
//@DESC   staff dashboard
router.get('/', verifystaff,async(req, res) => {
  let resp = await staffAttend.staffStatus(req.session.user._id)
  let checkin_stat;
  if(resp.status){
    checkin_stat = true
  }else{
    checkin_stat = false
  }
  staffWork.getAssignedWork(req.session.user._id).then((currentwork)=>{
    if(currentwork){
      switch (currentwork.status) {
        case 1:
          currentwork.status = "Searching for staff"
          break;
        case 2:
          currentwork.status = "Assigned"
          break;
        case 3:
          currentwork.status = "Verified"
          break;
        case 4:
          currentwork.status = "On road"
          break;
        case 5:
          currentwork.status = "Reached"
          break;
        case 6:
          currentwork.status = "Solved"
          break;
        case 7:
          currentwork.status = "Completed"
          break;
      }
      res.render('staff/home',{staffhead: true,currentwork,checkin_stat})
    }
    else {
      res.render('staff/home',{staffhead: true,nowork: true,checkin_stat})
    }
  })
});

//POST  /staff/checkin
//@DESC staff checkin fetch location and time
router.post('/checkin',(req,res)=>{
  staffAttend.doCheckIn(req.body,req.session.user._id).then((response)=>{
    console.log(response);
    res.json(response)
  })
})

//POST  /staff/checkout
//@DESC  staff checkout
router.post('/checkout',(req,res)=>{
  staffAttend.doCheckOut(req.body,req.session.user._id).then((response)=>{
    console.log(response);
  })
})

//GET   /staff/updatestatus
//@DESC work status update as per the staff side
router.post('/updatestatus',(req,res) => {
   staffWork.statusUpdate(req.body).then((response)=>{
     res.json(response)
   })
})

//GET /staff/updateloc
//@DESC update staff loc in each stage of work 
router.post('/updateloc',(req,res) => {
  console.log(req.body);
  staffWork.updateStaffLoc(req.body,req.session.user._id).then((response)=>{
    res.json(response)
  })
})


//POST   /staff/ready
//@DESC   staff checkin checkout page
router.post('/ready',verifystaff,(req,res)=>{
  console.log(req.body,req.session.user._id);
  staffWork.readyToWork(req.body,req.session.user._id).then((response)=>{
    console.log(response);
    res.json(response);
  })
})

//GET   /staff/leave
//@DESC  get leave form for request
router.get('/leave',verifystaff,(req,res)=>{
  if(req.session.leave){
    res.render('staff/leaveform',{staffhead: true,error:true})
    req.session.leave = false
  }else{
    res.render('staff/leaveform',{staffhead:true})
  }
  
})
//POST  /staff/leave
//@DESC post leave from with data
router.post('/leave',verifystaff,(req,res) => {
  var time = new Date().getHours()+":"+new Date().getMinutes();
  req.body.time=time
  staffAttend.requestLeave(req.session.user._id,req.body).then((response)=>{
  if(response.status!=false){
    res.redirect('/staff/leavestatus')
  }else{
    req.session.leave = true
    res.redirect('/staff/leave')
  }
  })
})

//GET   /staff/leavestatus
//@DESC get leave status granted or rejected
router.get('/leavestatus',verifystaff,(req,res)=>{
  staffAttend.leaveStatus(req.session.user._id).then((leavestat)=>{
    console.log(leavestat);
    res.render('staff/leavestatus',{staffhead:true,leavestat})
  })
})
module.exports = router;
