# Work-Control-System
SMART WORK CONTROL SYSTEM is a web-based application, this web-app can be useful for the employees, owners and clients of the company. 
Our system provides GPS tracking facility , at the time of check in & out and the time when the employees are handling with the client’s issue .
Our web app also gives the facility to raise a complaint of the product through our system. Admin or company lead can assign work to current available 
employee. A report generation facility is supported in our web-app, that allows the employee and admin to analyze effort spent by employees to assigned
work. We are going to code this on node.js and store data in mongoDB .



***************************************
Admin login Credentials
{"email":"admin@scws.com","password":"$2b$10$GujuPTDYftvBi.IEiBggMOwxazRqus/clOMq/682TEAMbojB0ygFi","username":"admin"}

##############################
Admin collection creation and push data into DB
''''db.admin.insertOne({"email":"admin@scws.com","password":"$2b$10$GujuPTDYftvBi.IEiBggMOwxazRqus/clOMq/682TEAMbojB0ygFi","username":"admin"})''''
