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
    cb(null, 'uploads/eventsimg/')
  },
  filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
  /* filename: (req, file, cb) => {
    cb(null, file.originalname)
  }, */
})
function getMonthFromString(mon){

   var d = Date.parse(mon + "1, 2012");
   if(!isNaN(d)){
      return new Date(d).getMonth() + 1;
   }
   return -1;
 }
const upload = multer({ storage: storage });



router.route('/feedback_get').get(function(req,res){
	var where ='';
	var orderby='';
	var sort = '';
	var limit = '';
	if(req.query.CurrentUserId){
		var CurrentUserId=req.query.CurrentUserId;
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(CurrentUserId!=''){
			where +=" member_code='"+CurrentUserId+"' ";
		}
		
	}
	if(req.query.term){
		var term = req.query.term;
		
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(term !=''){
			where +=" member_code LIKE '%"+term+"%' OR feedback_category LIKE '%"+term+"%' OR feedback_text  LIKE '%"+term+"%' ";
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
		if(sortByobj.desc==true){
			sort +=" DESC";
		}else{
			sort +=" ASC";
		}
	}
	var sqlTotal = "SELECT COUNT(feedback_id) as totalcount from feedback  "+where+" "+sort+";";
     var sql="SELECT * FROM feedback  "+where+" "+sort+" "+limit+" ;";
    // exit;
	console.log('sqlTotal', sqlTotal);
	  // return  res.status(200).send({ success:0, result:[],pageCount:1 , sql:sql});
	db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
		   db.query(sqlTotal, function (err, sqlTotalResult){
			    // console.log('sqlTotalResult', sqlTotalResult[0]);
				const totalpage =  Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				 return  res.status(200).send({ success:1,result: result,pageCount:totalpage, sql:sql });
		   });
		  
      // 
       }else{
        return  res.status(200).send({ success:0, result:[],pageCount:1 });
	   }
     });
    

  });
  

  
  
module.exports = router;