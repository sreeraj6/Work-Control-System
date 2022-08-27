const { response } = require('express');
var express = require('express');
var router = express.Router();
var userAuth = require('../controllers/usercontrollers/userAuth')
var issueModule = require('../controllers/usercontrollers/complaintRaise');

//This constant will verify that userer is logged in 
const verifyUser = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', (req, res, next) => {
  if(req.session.loggedIn){
    issueModule.getIssueStatus(req.session.user._id).then((currentStatus) => {
      console.log(currentStatus);
      res.render('user/home',{user:true,currentStatus,work:true,home:'active'})
    })
  }else{
    res.render('user/home',{home:'active'})
  }
});
//GET   /signup
//@DESC   get signup form for take user data
router.get('/signup', (req, res) => {
  res.render('user/signup', { 'alreadyExist': req.session.alreadyExist });
  req.session.alreadyExist = false
})

//POST /signup
router.post('/signup', (req, res) => {
  userAuth.addUser(req.body).then((response) => {
    if (response.user) {
      req.session.alreadyExist = true
      res.redirect('/signup')
    } else {
      console.log(response);
      res.redirect('/login')
    }
  })
})

//GET   /login
//@DESC   get login form
router.get('/login', (req, res) => {
  res.render('user/login', { 'loginError': req.session.loginError })
  req.session.loginError = false
})

//POST  /login
//@DESC post data to the server and validate
router.post('/login', (req, res) => {
  userAuth.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginError = true
      res.redirect('/login')
    }
  })
})
//GET   /logout
//@DESC   erase datas from the session 
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
//GET   /complaint
//@DESC   get complaint form
router.get('/complaint', verifyUser, (req, res) => {
  res.render('user/complaint',{user:true,complaint:'active'})
})

//POST   /complaint
//@DESC   insert data to the db
router.post('/complaint', (req, res) => {
  let userId = req.session.user._id
  issueModule.raiseComplaint(req.body, userId).then(() => {
    res.redirect('/')
  })
})

//GET   /history
//@DESC  get complaint history 
router.get('/history', verifyUser, (req, res) => {
  let userId = req.session.user._id
  issueModule.getIssueHistory(userId).then((history) => {
    console.log(history);
    if (history.status) {
      res.render('user/history', { 'notExist': true,user:true,histry:'active' })
    } else {
      res.render('user/history', {history,user:true,histry:'active'})
    }
  })
})

//GET   /status
//@DESC   get work status
router.get('/status', verifyUser, (req, res) => {
  let userId = req.session.user._id
  issueModule.getIssueStatus(userId).then((currentStatus) => {
    console.log(currentStatus);
    res.render('user/status',{currentStatus,user:true,status:'active'})
  })
})

router.get('/statusbar',verifyUser,(req,res) => {
  issueModule.getIssueStatus(req.session.user._id).then((currentStatus) => {
    console.log(currentStatus);
    res.render('user/progress',{currentStatus})
  })
})
module.exports = router;
