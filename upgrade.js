const router = require('express').Router();

const Razorpay = require('razorpay');

require('dotenv').config();
// const keyid= process.env.razorpaytest_id;
// const keysecret = process.env.razorpaytest_secret;

/* const keyid= "rzp_test_zaUn9ICK4icmNx";
const keysecret ="dU1rZ4G4Fu4egwJfSRzPovi4" ; */

const keyid= "rzp_live_e70DpTn3LMWHM2";
const keysecret ="GRBJfdjJV7T5E3z4muWwdhmt" ;

const crypto = require('crypto')
var db=require('./db');




function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

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
function randomid()
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
  return year +  month +  day  + hours  + minutes + seconds;
    
}


router.route('/order').post(function(req,res){

  var membercode= req.body.membercode;
  var payname=req.body.payname;
  var randomorderid=membercode+randomid();
  // console.log(  
  //   between(10, 200)
  // )
  var instance = new Razorpay({
    key_id: keyid,
    key_secret: keysecret
  })
var options = {
   amount: req.body.amount*100,  // amount in the smallest currency unit
  // amount: 50000,
  currency: "INR",
  receipt: randomorderid,
};
instance.orders.create(options, function(err, order) {
  if(err){
    return res.send(err)}
  else{


    var sql = "INSERT INTO `transaction_history` ( `memberCode`, `pg_name`, `mccorderId`, `orderId`, `transactionAmount`, `status`, `statusCode`, `create_date`, `update_date`) VALUES   ('"+membercode+"', '"+payname+"', '"+randomorderid+"', '"+order.id+"', '"+order.amount/100+"',  '0', '', '"+getdatetime()+"', '"+getdatetime()+"')";
 db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
   return res.json(order)}
});
});

// return
// {"id":"order_IwhdPn5VqA6aF0","entity":"order","amount":50000,"amount_paid":0,"amount_due":50000,"currency":"INR","receipt":"order_rcptid_11","offer_id":null,"status":"created","attempts":0,"notes":[],"created_at":1645019352}

router.route('/payment').post(function(req,res) {

  var sql = "update `transaction_history` set  transactionId='"+req.body.transactionid+"', `update_date`='"+getdatetime()+"',`status`='1', `statusCode`='1' where `orderId`='"+req.body.razorpay_order_id+"'";
  db.query(sql, function (err, result) {
     if (err) throw err;
     console.log("1 record inserted");
   });
  // const generated_signature = crypto.createHmac('sha256',keysecret)
  // generated_signature.update(req.body.razorpay_order_id+"|"+ req.body.transactionid)
  // if ( generated_signature.digest('hex') === req.body.razorpay_signature){
  //         const transaction = new Transaction({
  //           transactionid:req.body.transactionid,
  //           transactionamount:req.body.transactionamount,
  //       });
  //       transaction.save(function(err, savedtransac){
  //         if(err){
  //             console.log(err);
  //             return res.status(500).send("Some Problem Occured");
  //         }
  //         res.send({transaction: savedtransac});

  //     });
  //   // return res.send('success');
  // }
  // else{
  //   return res.send('failed');
  // }

  return res.send('success');
});

module.exports = router;
