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
	
	if(req.query.term){
		var term = req.query.term;
		
		/* if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(term !=''){
			where +=" e.event_name LIKE '%"+term+"%' OR e.event_date_from  LIKE '%"+term+"%' OR e.event_date_to LIKE '%"+term+"%' OR er1.rsvp_status  LIKE '%"+term+"%' OR er1.member_code  LIKE '%"+term+"%'";
		} */
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
  

router.route('/rsvp_detail').get(function(req,res){
var where =' WHERE er1.is_primary=1';
	
	if(req.query.orderId){
		var orderId=req.query.orderId;
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(orderId!=''){
			where +=" er1.rsvp_id='"+orderId+"';";
		}
		
	}
   
    var sql = "select *, (SELECT count(rsvp_id) FROM event_rsvp er2 WHERE er2.is_primary=0 AND er2.`parent_rsvp_id` = er1.rsvp_id ) as totalguest  from event_rsvp er1 "+where+" ;";
	
	
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
			var orderitemssql = "select event_name, (SELECT cat_name from event_category where id=event_category) as eventcategory, venue, event_date_from, event_date_to from events  WHERE id='"+result[0].event_id+"';";
			db.query(orderitemssql, function (erra, resulta) {
				if (erra)  return res.status(401).send({ error: erra.message });
				if (resulta.length >= 0) {
					console.log(result[0].member_code);
					 var customer_detail = "select first_name, last_name, email, mobile_no from members where  member_code='"+result[0].member_code+"' ;";
					db.query(customer_detail, function (errb, resultb) {
						if (errb)  return res.status(401).send({ error: errb.message });
						if (resultb.length >= 0) {
							return  res.status(200).send({ success:1,result: result, resulta:resulta, resultb:resultb });
						}else{ 
							return  res.status(200).send({ success:0, result:result, resulta:resulta, resultb:[],pageCount:1 });
						   }
					}); 
				}else{
					return  res.status(200).send({ success:0, result:[], resulta:[], resultb:[],pageCount:1 });
				   }
			});
		   
		  
      // 
       }else{
        return  res.status(200).send({ success:0, result:[], resulta:[], resultb:[],pageCount:1 });
	   }
});


});

 
router.route('/rsvp_guest_detail').get(function(req,res){
var where ='';
	
	if(req.query.orderId){
		var orderId=req.query.orderId;
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(orderId!=''){
			where +=" parent_rsvp_id='"+orderId+"';";
		}
		
	}
   
    var sql = "select guest_name, guest_email, guest_phone from event_rsvp "+where+" ;";
	
	
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
		
							return  res.status(200).send({ success:1,result: result });
						
		  
      // 
       }else{
        return  res.status(200).send({ success:0, result:[], pageCount:1 });
	   }
});


});


  
  
module.exports = router;