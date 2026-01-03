const router = require('express').Router();
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto')
var db=require('./db');

var nodemailer = require('nodemailer');
// get all events with pagination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/magazine/')
  },
  filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
  /* filename: (req, file, cb) => {
    cb(null, file.originalname)
  }, */
})
const upload = multer({ storage: storage });
router.route('/get_magazines').get(function(req,res) {
	var where ='';
	var orderby='';
	var sort = '';
	var limit = '';
	if(req.query.term){
		var term = req.query.term;
		
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(term !=''){
			where +=" issue_no LIKE '%"+term+"%' OR  issue_date  LIKE '%"+term+"%'";
		}
	}
	if(req.query.pageSize && req.query.pageIndex){
		if(limit==''){
			limit +=" Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if(pageIndex !=''){
			limit +="  "+(pageIndex*pageSize)+", "+pageSize+"";;
		}
	}
	
	if(req.query.sortBy && Array.isArray(req.query.sortBy)){
		var sortBy = req.query.sortBy;
		var sortByobj = JSON.parse(sortBy)
		// console.log('sortBy', sortByobj.desc);
		if(sort ==""){
			sort +="ORDER BY "+sortByobj.id;
		}
		if(sortByobj.desc== true){
			sort +=" DESC";
		}else{
			sort +=" ASC";
		}
	}
	var sqlTotal = "SELECT COUNT(id) as totalcount from clubman_magazine "+where+" "+sort+";";
    
    var sql = "select  id, issue_no, issue_date, pdf_document, issue_status from clubman_magazine "+where+"  "+sort+"   "+limit+" ;";
	// exit;
	// console.log('sql', sql);
	db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
		   db.query(sqlTotal, function (err, sqlTotalResult){
			    // console.log('sqlTotalResult', sqlTotalResult[0]);
				const totalpage =  Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				 return  res.status(200).send({ success:1,result: result,pageCount:totalpage });
		   });
		  
      // 
       }else{
        return  res.status(200).send({ success:0, result:[],pageCount:1 });
	   }
     });
	
});

router.route('/create_magazine').post(upload.single('issue_file'), function(req,res) {
	
	var issue_no = req.body.issue_no;
   var issue_date = req.body.issue_date;
  var issue_date2 = new Date(issue_date);
  var year = issue_date2.getFullYear();
  var month = issue_date2.getMonth() + 1;
  var issueDate = year+'-'+month;
  // console.log('file', req.file);
  if(req.file){
	var filename = req.file.filename;	
	 
	 var sql = "INSERT INTO clubman_magazine ( issue_no, issue_date, pdf_document, issue_status) VALUES ('"+issue_no+"', '"+issueDate+"','"+filename+"','1');";
}else{
	 var sql = "INSERT INTO clubman_magazine ( issue_no, issue_date, issue_status) VALUES   ('"+issue_no+"', '"+issueDate+"','1');";
}

   
 db.query(sql, function (err, result) {
    if (err)  return res.status(401).send({ error: err.message });
   // console.log("1 record inserted");
    return res.status(200).json({ success: '1'});
  });
  
  
	
});

router.route('/update_magazine').post(upload.single('issue_file'), function(req,res) {
	
	var issue_no = req.body.issue_no;
	var issue_date = req.body.issue_date;
	var issue_date2 = new Date(issue_date);
	var year = issue_date2.getFullYear();
	var month = issue_date2.getMonth() + 1;
	var issueDate = year+'-'+month;
	var id= req.body.id;
	if(req.file){
		var filename = req.file.filename;	
		var sql = "UPDATE clubman_magazine SET issue_no='"+issue_no+"', issue_date='"+issueDate+"', pdf_document='"+filename+"', issue_status =1 WHERE  id='"+id+"';";
	}else{
		 var sql = "UPDATE clubman_magazine SET issue_no = '"+issue_no+"', issue_date= '"+issueDate+"', issue_status ='1' WHERE  id='"+id+"' ;";
	}

   
 db.query(sql, function (err, result) {
    if (err)  return res.status(401).send({ error: err.message });
   // console.log("1 record inserted");
    return res.status(200).json({ success: '1'});
  });
  
  
	
});

router.route('/magazine_delete').post(function(req,res) {
 var ids= req.body.ids;


  var sql = "delete from  clubman_magazine  where id IN ("+ids+")";
  // console.log('sql', sql);
  db.query(sql, function (err, result) {
     if (err) return res.status(401).send({ error: err.message });
     // console.log("1 record deleted");
     return res.status(200).json({ success: '1' });
   });
  

  
});

module.exports = router;