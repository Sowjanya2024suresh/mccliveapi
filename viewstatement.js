const router = require('express').Router();



require('dotenv').config();

const crypto = require('crypto');
const { memoryUsage } = require('process');
var db=require('./db');
function getdatetime()
{
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();
     
  var date = year + "-" + month + "-" + day;
  console.log(date);
      
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();
    
  var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  return dateTime;
}
function getmonthyear()
{
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();
     
  var date = year + "-" + month + "-" + day;
  console.log(date);
      
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();
    
  var dateTime = month + "-" + year;
  return dateTime;
}
router.route('/viewStatments').get(function(req,res){

    var year= req.query.year;
    var member_code= req.query.member_code;
  
    var sql = "select billing_details.opening_balance,billing_details.bill_amount,billing_details.received_amount,billing_details.closing_amount,DATE_FORMAT(bill_date,'%M %Y') AS billdate from billing_details INNER JOIN file_info ON billing_details.file_info_id=file_info.id where YEAR(bill_date)='"+year+"' && member_code='"+member_code+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       console.log("1");
       return  res.status(200).send({ success:1,result: result });
     });
    
    
  });

  router.route('/viewStatementmonth').get(function(req,res){

    var year= req.query.year;
    var month= req.query.month;
    var member_code= req.query.member_code;
  
    var  sql="select billing_details.opening_balance,billing_details.bill_amount,billing_details.received_amount,billing_details.closing_amount,DATE_FORMAT(bill_date,'%M %Y') AS billdate from billing_details INNER JOIN file_info ON billing_details.file_info_id=file_info.id where Month(bill_date)='"+month+"' AND YEAR(bill_date)='"+year+"' AND member_code='"+member_code+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       console.log("1");
       return  res.status(200).send({ success:1,result: result });
     });
    
    
  });


  router.route('/getCurrentMonthTxn').get(function(req,res){

    var member_code= req.query.member_code;
    var currentMonth =getmonthyear();
    var  sql="SELECT DATE_FORMAT(create_date,'%d-%M-%Y %h:%i %p') AS 'Txn_DateTime',orderId,transactionId,transactionAmount,status FROM transaction_history where DATE_FORMAT(create_date,'%m-%Y') = '"+currentMonth+"' AND memberCode = '"+member_code+"' order by Txn_DateTime DESC";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       console.log("1");
       return  res.status(200).send({ success:1,result: result });
     });
    
    
  });

  router.route('/viewYearStatement').get(function(req,res){

    var member_code= req.query.member_code;
    var  sql="SELECT DATE_FORMAT(f.bill_date,'%M-%y') AS bill_month,member_code,opening_balance,bill_amount,received_amount,closing_amount FROM `file_info` f  JOIN billing_details bd ON f.id=bd.file_info_id WHERE (DATE_FORMAT(f.bill_date,'%Y') = YEAR(NOW()) AND (DATE_FORMAT(f.bill_date,'%m')>= 1 AND DATE_FORMAT(f.bill_date,'%m')<= 12)) AND member_code='"+member_code+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       console.log("1");
       return  res.status(200).send({success:1, result: result });
     });
    
    
  });


  module.exports = router;