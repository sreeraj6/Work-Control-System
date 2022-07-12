var express = require('express');
const { response } = require('../app');
var router = express.Router();
var staffAuth = require('../controllers/Staffcontrollers/staffAuthentication')

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
  res.send('Staff portal is here');
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

//GET   /staff/checkinout
//@DESC   staff checkin checkout page
router.get('/checkinout',(req,res)=>{

})
module.exports = router;
