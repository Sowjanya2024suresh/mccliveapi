const router = require('express').Router();
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto')
var db=require('./db');
const https = require('node:https');
var nodemailer = require('nodemailer');
// https://wigw8x2psi.execute-api.ap-northeast-1.amazonaws.com/dev/sendsms_orderto_member?memberid=member123&orderid=order123&to=9841200531
function smstoFandBWhatsup(orderID, MemberId){
  
const data = JSON.stringify({
        // 'number': '9841200531',
	'number': '9787128371',
	 'member_code':MemberId,
	  'orderid': orderID 
    })

const options = {
  hostname:'wigw8x2psi.execute-api.ap-northeast-1.amazonaws.com',
  port:443, 
  path: '/dev/mcc/send_orderdetail_to_fb',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
console.log('BODY: ' + d);
  })

})

req.on('error', (error) => {
  console.error(error)
})
console.log('Request headers', req.headers);
req.write(data) 
req.end()



}
function forgotpinWhatsup(name, member_code,pin, number){

const data = JSON.stringify({
	'number': number,
	'name': name,
	'member_code':member_code,
	'pin':pin 
    })

const options = {
  hostname:'wigw8x2psi.execute-api.ap-northeast-1.amazonaws.com',
  port:443, 
  path: '/dev/mcc/sendpin',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
console.log('BODY: ' + d);
  })

})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()



}

router.route('/testemailtest').post(function(req,res) {
 /*
 var transporter = nodemailer.createTransport({
          pool: true,
          host: "madrascricketclub.org", 
	  port: 465,
	  secure: true, // use TLS
	  auth: {
		 user: "social@madrascricketclub.org",
		 pass: "m%b9mL082",
		},
        });
        mailOptions = {
          from: 'social@madrascricketclub.org',
          // to: email,
	  to: 'raghav@lokas.in',
          subject: 'Smtp Testing Email',
         html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt"> <tbody><tr><td>This is test email</td></tr></tbody></table> '
  
        };
      
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
			 return res.status(401).send({ error: error }); 
          } 
        }); */
smstoFandBWhatsup('OrderA123', 'RL01');
// forgotpinWhatsup('Prakash', 'RL01','987456', '9787128371');
return res.status(200).send({ message: 'email sent' }); 

  
});


module.exports = router;