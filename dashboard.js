const router = require('express').Router();



require('dotenv').config();

const crypto = require('crypto')
var db=require('./db');


function lastupload()
   {
      var sql="SELECT MONTH(max(bill_date)) as month,YEAR(max(bill_date)) as year FROM file_info ";
 
      db.query(sql, function (err, result) {
        if (err)  return err.message;
        console.log("1");
        return  result;
      });
      
       
  }
function getMonthFromString(mon){

   var d = Date.parse(mon + "1, 2012");
   if(!isNaN(d)){
      return new Date(d).getMonth() + 1;
   }
   return -1;
 }


router.route('/reports').get(function(req,res){


    var sql="SELECT MONTH(max(bill_date)) as month,YEAR(max(bill_date)) as year FROM file_info ";
 
    db.query(sql, function (err, result) {
      if (err)  return err.message;

      var month=result[0].month;
      var year=result[0].year;
      var sql="select ROUND(SUM(opening_balance),2) AS opbs,DATE_FORMAT(uploaded_on,'%d-%b-%Y') AS uploadedon,DATE_FORMAT(bill_date,'%M %Y' ) AS billdate,ROUND(SUM(bill_amount),2) AS billamt,ROUND(SUM(received_amount),2) As receivedamount,ROUND(SUM(closing_amount),2) AS clsamt ,file_info.uploaded_by,file_info.id,COUNT(*) AS count from billing_details INNER JOIN file_info ON billing_details.file_info_id=file_info.id where Month(bill_date)='"+month+"' AND YEAR(bill_date)='"+year+"' GROUP BY bill_date,uploaded_on,uploaded_by,id ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       // console.log("1");
/* const abd = { opbs: "11285650.4", uploadedon: "01-Feb-2022", billdate: "February 2022", billamt: "8618783.53", receivedamount: "8479744.65", clsamt: "11196917.4", uploaded_by: "2", id: "133", count: "1833", } ;
const areult = JSON.stringify(abd) ;
const al = JSON.parse(areult);
	return res.status(200).send({success: 1, result: al } ); */
       return  res.status(200).send({ success:1,result: result });
     });
    
    });   
  });


router.route('/payment_report').get(function(req,res){


	var where ='where member_code=memberCode ';
	var orderby='';
	var sort = '';
	var limit = '';

       if(req.query.monthSelected){
		var monthSelected = req.query.monthSelected;
		var arr = monthSelected.split("-");
		if(where==''){
			  where += "WHERE ";
		}else{
			  where +=' AND ';
		}
		if(monthSelected !=''){
			 where +=" YEAR(create_date) = '"+arr[1].trim()+"' AND MONTH(create_date) = '"+getMonthFromString(arr[0].trim())+"' ";
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
			where +="( member_code LIKE '%"+term+"%' OR first_name LIKE '%"+term+"%' OR last_name LIKE '%"+term+"%' )";
		}
	}
	if(req.query.status){
		var status=req.query.status;
		if(where == ''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(status!=''){
			where +=" status='"+status+"'";
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
			sort +=" ORDER BY "+sortByobj.id;
		}
		if(sortByobj.desc==true){
			sort +=" DESC";
		}else{
			sort +=" ASC";
		}
	}
       
	var sqlTotal = "SELECT COUNT(a.id) as totalcount from `transaction_history` a,members b   "+where+" "+sort+";";
     
    var sql = "SELECT a.id,memberCode ,first_name,last_name,CONCAT(first_name, ' ', last_name) AS name,mccorderId,orderId,transactionId,transactionAmount,status,statusCode,create_date,update_date,YEAR(create_date) FROM `transaction_history` a,members b   "+where+" "+sort+" "+limit+" ;";
 db.query(sql, function (err, result) {
    if (err)  return res.status(401).send({ error: err.message });
    if (result.length >= 0) {
		   db.query(sqlTotal, function (errcount, sqlTotalResult){
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




  router.route('/getUploadedBy').get(function(req,res){

    var file_info_id= req.query.file_info_id;
   
      var sql="SELECT m.first_name,m.last_name FROM members m where m.id='"+file_info_id+"' ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ result: result });
     });
    

  });

  router.route('/lastupload').get(function(req,res){

   
      var sql="SELECT MONTH(max(bill_date)) as month,YEAR(max(bill_date)) as year FROM file_info";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ result: result });
     });
    

  });


  router.route('/getTxnSuccess').get(function(req,res){

   
    var sql="SELECT ROUND(SUM(transactionAmount),2) AS txnSucTotal, COUNT(transactionAmount) AS txnSucCount FROM transaction_history WHERE (status ='Success') AND (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({ success:1,result: result });
   });
  

});


router.route('/getTxnApproved').get(function(req,res){

   
    var sql="SELECT ROUND(SUM(transactionAmount),2) AS txnAprTotal, COUNT(transactionAmount) AS txnAprCount FROM transaction_history WHERE (status ='Approved') AND (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({success:1, result: result });
   });
  

});


router.route('/getTxnFailed').get(function(req,res){

   
    var sql="SELECT ROUND(SUM(transactionAmount),2) AS txnFailTotal, COUNT(transactionAmount) AS txnFailCount FROM transaction_history WHERE (status ='Transaction Failed') AND (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({success:1, result: result });
   });
  

});

router.route('/getTxnPending').get(function(req,res){

   
    var sql="SELECT ROUND(SUM(transactionAmount),2) AS txnPenTotal, COUNT(transactionAmount) AS txnPenCount FROM transaction_history WHERE (status ='Pending') AND (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({ success:1,result: result });
   });
  

});


router.route('/getTxnClosed').get(function(req,res){

   
    var sql="SELECT ROUND(SUM(transactionAmount),2) AS txnCloseTotal, COUNT(transactionAmount) AS txnCloseCount FROM transaction_history WHERE (status ='Closed') AND (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({success:1, result: result });
   });
  

});

router.route('/getTxninfo').get(function(req,res){

   
  var sql="SELECT ROUND(SUM(CASE  WHEN status='Success'  THEN  transactionAmount ELSE NULL END),2) AS txnSucTotal, COUNT(CASE WHEN status='Success'  THEN  transactionAmount ELSE NULL END) AS txnSucCount,ROUND(SUM(CASE WHEN status='Approved'  THEN  transactionAmount ELSE NULL  END),2) AS txnAprTotal,COUNT(CASE    WHEN status='Approved' THEN  transactionAmount ELSE NULL    END) AS txnAprCount,ROUND(SUM(CASE    WHEN status='Transaction Failed' THEN  transactionAmount ELSE NULL          END),2) AS txnFailTotal, COUNT(CASE    WHEN status='Transaction Failed' THEN  transactionAmount ELSE NULL          END) AS txnFailCount, ROUND(SUM(CASE    WHEN status='Pending' THEN  transactionAmount ELSE NULL          END),2) AS txnPenTotal, COUNT(CASE    WHEN status='Pending' THEN  transactionAmount ELSE NULL          END) AS txnPenCount,ROUND(SUM(CASE    WHEN status='Closed' THEN  transactionAmount ELSE NULL          END),2) AS txnCloseTotal, COUNT(CASE    WHEN status='Closed'  THEN  transactionAmount ELSE NULL          END) AS txnCloseCount FROM transaction_history where (DATE_FORMAT(create_date,'%M-%Y') = DATE_FORMAT(NOW(),'%M-%Y'))";
  db.query(sql, function (err, result) {
   if (err)  return res.status(401).send({ error: err.message });
   return  res.status(200).send({success:1, result: result });
 });


});

router.route('/getRequestsCount').get(function(req,res){

   
    var sql="SELECT COUNT(request_status) as cnt, request_status, sum(reservation_amt + ((reservation_tax * reservation_amt) / 100)) as amt FROM `chambers_request` WHERE MONTH(request_date) = MONTH(NOW()) GROUP BY request_status";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({ success:1,result: result });
   });
  

});


router.route('/getOrdersCount').get(function(req,res){

   
    var sql="SELECT COUNT(order_status) as cnt, order_status, sum(order_total) as amt FROM `chambers_orders` WHERE MONTH(order_date) = MONTH(NOW()) GROUP BY order_status";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({success:1, result: result });
   });
  

});

router.route('/lastupload').get(function(req,res){

   
    var sql="SELECT MONTH(max(bill_date)) as month,YEAR(max(bill_date)) as year FROM file_info";
  db.query(sql, function (err, result) {
     if (err)  return res.status(401).send({ error: err.message });
     return  res.status(200).send({ result: result });
   });
  

});
module.exports = router;