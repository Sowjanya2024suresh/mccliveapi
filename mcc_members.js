const router = require('express').Router();

require('dotenv').config();
// const keyid= process.env.razorpaytest_id;
// const keysecret = process.env.razorpaytest_secret;


const crypto = require('crypto')
var db = require('./db');
var nodemailer = require('nodemailer');
const https = require('node:https'); 



function between(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

function getdatetime() {
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
function randomid() {
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();

  var date = year + "-" + month + "-" + day;
  console.log(date);

  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();
  return year + month + day + hours + minutes + seconds;

}

function randomchar(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}
function randomnumber(n) {
  var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

  if ( n > max ) {
          return generate(max) + generate(n - max);
  }

  max        = Math.pow(10, n+add);
  var min    = max/10; // Math.pow(10, n) basically
  var number = Math.floor( Math.random() * (max - min + 1) ) + min;

  return ("" + number).substring(add); 
}

function forgotpinWhatsup(name, member_code,pin, number){

const data = JSON.stringify({
	'number': number,
	'name': name,
	'member_code':member_code,
	'pin':pin 
    })

const options = {
  hostname:'7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com',
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


router.route('/membercodeavailable').post(function (req, res) {

  var mcode = req.body.mcode; 
  var admincode=req.body.admincode;
  var query="SELECT * FROM members where member_code='" + mcode + "'";
  

  db.query("SELECT * FROM members where member_code='" + mcode + "'", function (err, result1, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
   
  
      if (result1.length == 1) {

        const clientname = result1[0].first_name;
		    var strToDate = result1[0].last_login?result1[0].last_login.toString():'';
        return res.status(200).json({ query: query,success: '1',name: clientname, membercode: result1[0].member_code,createdby:admincode,access:'yes',  email : result1[0].email , mobile_no : result1[0].mobile_no ,postal_address : result1[0].postal_address ,last_login : strToDate ,type: result1[0].type });
	
	     }
       else
		return  res.status(200).json({  query: query,success: '0' });
	

  

    });

});

router.route('/adminmemberlogin').post(function (req, res) {

  var membercode = req.body.membercode;  
  var pin = req.body.pin;
  var admincode=req.body.admincode;
  var password_string = "";

  db.query("SELECT * FROM members where member_code='" + admincode + "' and pin='" + pin + "'", function (err, result, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
   
    if(result.length == 1){
    

    var sql = "SELECT * FROM `members` where member_code='" + membercode + "' ";

    var query = db.query(sql, function (err1, result1) {

      if (err1) return res.status(401).send({ error: err1.message });
      if (result1.length == 1) {
		
		const clientname = result1[0].first_name;
		var strToDate = result1[0].last_login?result1[0].last_login.toString():'';
        return res.status(200).json({ success: '1',name: clientname, membercode: result1[0].member_code,createdby:admincode,access:'yes',  email : result1[0].email , mobile_no : result1[0].mobile_no ,postal_address : result1[0].postal_address ,last_login : strToDate ,type: result1[0].type })
        //    return res.send('success');
      }
      else
        return res.status(200).json({ success: '2' })
      //    return res.send('fail');
    });
	}else{
		return  res.status(200).json({ success: '0' });
	}

  });



});





router.route('/login').post(function (req, res) {

  var membercode = req.body.membercode;
  var password = req.body.password;
  var pin = req.body.pin;

  var password_string = "";

  db.query("SELECT password_string FROM members where member_code='" + membercode + "'", function (err, result, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
    // console.log(result);
    if(result.length == 1){
    // console.log(result);
    password_string = result[0].password_string;
    var name = password + password_string;
    var hash = crypto.createHash('md5').update(name).digest('hex');

    var sql = "SELECT * FROM `members` where member_code='" + membercode + "' and password='" + hash + "' and pin='" + pin + "'";

    var query = db.query(sql, function (err1, result1) {

      if (err1) return res.status(401).send({ error: err1.message });
      if (result1.length == 1) {
		
		const clientname = result1[0].first_name;
		var strToDate = result1[0].last_login?result1[0].last_login.toString():'';
        return res.status(200).json({ success: '1',name: clientname, membercode: result1[0].member_code,createdby:membercode,access:'no',  email : result1[0].email , mobile_no : result1[0].mobile_no ,postal_address : result1[0].postal_address ,last_login : strToDate ,type: result1[0].type })
        //    return res.send('success');
      }
      else
        return res.status(200).json({ success: '0' })
      //    return res.send('fail');
    });
	}else{
		return  res.status(200).json({ success: '0' });
	}

  });



});

router.route('/loginwithpin').post(function (req, res) {

  var membercode = req.body.membercode;
  // var password = req.body.password;
  var pin = req.body.pin;

  var password_string = "";

  db.query("SELECT password_string FROM members where member_code='" + membercode + "'", function (err, result, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
    // console.log(result);
    if(result.length == 1){
    // console.log(result);
    // password_string = result[0].password_string;
    // var name = password + password_string;
    // var hash = crypto.createHash('md5').update(name).digest('hex');

    var sql = "SELECT * FROM `members` where member_code='" + membercode + "' and pin='" + pin + "'";

    var query = db.query(sql, function (err1, result1) {

      if (err1) return res.status(401).send({ error: err1.message });
      if (result1.length == 1) {
		
		const clientname = result1[0].first_name;
		var strToDate = result1[0].last_login?result1[0].last_login.toString():'';
        return res.status(200).json({ success: '1',name: clientname, membercode: result1[0].member_code,createdby:membercode,access:'no',  email : result1[0].email , mobile_no : result1[0].mobile_no ,postal_address : result1[0].postal_address ,last_login : strToDate ,type: result1[0].type })
        //    return res.send('success');
      }
      else
        return res.status(200).json({ success: '0' })
      //    return res.send('fail');
    });
	}else{
		return  res.status(200).json({ success: '0' });
	}

  });



});

router.route('/forgotpassword').post(function (req, res) {


  var membercode = req.body.membercode;
  var email = req.body.email;
  var state = req.body.state;


  var sql = "SELECT * FROM `members` where member_code='" + membercode + "' and email='" + email + "'";

  var query = db.query(sql, function (err, resultmain) {


    if (resultmain.length == 1) {


      var pass=randomchar(6);
      var passtr=randomchar(2);
      var hash = crypto.createHash('md5').update(pass+passtr).digest('hex');
      var sql = "UPDATE members SET password = '" + hash + "' , password_string= '" + passtr + "'  where member_code='" + membercode + "'";
      db.query(sql, function (err, result) {
        if (err) throw err;
        // console.log(result.affectedRows + " record(s) updated");
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
          to: email,
          subject: 'Your Password for MCC website.',
          // text: 'Your password is ',
         // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
         html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+resultmain[0].first_name+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Your Login Password is as follows</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+resultmain[0].member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Password: <span style="color:red">'+pass+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '
  
        };
      
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
  
        return res.json({ success: '1', membercode: membercode })

      });
     
    }
    //    return res.send('success');

    else
      return res.json({ success: '0' })
    //    return res.send('fail');
  });


});
router.route('/forgotpin').post(function (req, res) {

  var membercode = req.body.membercode;
  var email = req.body.email;
  var state = req.body.state;


  var sql = "SELECT * FROM `members` where member_code='" + membercode + "' and email='" + email + "'";

  var query = db.query(sql, function (err, result) {


    if (result.length == 1) {

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
        to: email,
        subject: 'Your PIN Number for MCC website.',
        // text: 'Your password is ',
       // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
       html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+result[0].first_name+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Your Login Pin is as follows</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+result[0].member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Pin: <span style="color:red">'+result[0].pin+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '

      };
     
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      forgotpinWhatsup(result[0].first_name, membercode,result[0].pin, result[0].mobile_no); 
      return res.json({ success: '1', membercode: result[0].member_code, pin: result[0].pin })
    }
    //    return res.send('success');

    else
      return res.json({ success: '0' })
    //    return res.send('fail');
  });

});

router.route('/loginTrouble').post(function (req, res) {

  var membercode = req.body.membercode;
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;
   var state = req.body.state;



     var contents="<html>      <head> </head>      <style>  body   {     font-family:  Verdana, Helvetica, sans-serif;       align:center;        color:555555;       }      .docTxt{        font-family:  Verdana, Helvetica, sans-serif;        font-size:12px;      }      .docTxt1{        font-family:  Verdana, Helvetica, sans-serif;        font-size:11px;      }      p{      padding:2px;      margin:0px;      }            </style>           <body topmargin='15' bottommargin='0' rightmargin='0' leftmargin='10'>            <table width='800' height='300' cellpadding='5' cellspacing='0' style='border:1px solid #999;'>      <tr  style='background-color:#f6f6f6;'>        <td style='border-bottom:1px solid #999;'>        <img src='https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png' alt='Madras Cricket Club' width='200' height='45' border='0'>        </td>        <td width='488' style='border-bottom:1px solid #999;'>&nbsp;</td>      </tr>      <tr>        <td colspan='2'>Dear Admin,</td>              </tr>            <tr>        <td colspan='2' class='docTxt'>Member code: "+membercode+" is troubled login. </td>              </tr>      <tr>        <td colspan='2' class='docTxt'>Registered email: "+email+"</td>              </tr>      <tr>              <td colspan='2' class='docTxt'>Message :<br/>"+message+" </td>              </tr>            <tr>        <td colspan='2' class='docTxt'>Have a nice day.</td>              </tr>            </table>      </body>      </html>            ";


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
        to: email,
        subject: 'MCC - Trouble login : '+membercode,
        // cc: 'sowjanya@lokas.in',
        // text: 'Your password is ',
       // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
       html : contents

      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
		  return res.json({ success: '0'});
        } else {
          console.log('Email sent: ' + info.response);
		  return res.json({ success: '1'});
        }
      });
      
   
    //    return res.send('fail');
  
});

router.route('/changePassword').post(function (req, res){
	
  var membercode = req.body.membercode;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  var confirmpassword = req.body.confirmpassword;
  db.query("SELECT password_string, password, pin, first_name,email FROM members where member_code='" + membercode + "'", function (err, result, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
    // console.log(result);
    if(result.length == 1){
    // console.log(result);
    password_string = result[0].password_string;
	var firstname = result[0].first_name;
	var pin = result[0].pin;
	var member_code = membercode;
  var email = result[0].email ;
	var currentpass = result[0].password ;
    // var name = result[0].password + password_string;
    // var hash = crypto.createHash('md5').update(name).digest('hex');
	var oldname = oldpassword + password_string;
	var oldhash = crypto.createHash('md5').update(oldname).digest('hex');
	// console.log('currentpass',currentpass);
	// console.log('oldname', oldname);
	if(currentpass == oldhash){
		if(newpassword == confirmpassword){
			    var passtr=randomchar(2);
				var newhash = crypto.createHash('md5').update(newpassword+passtr).digest('hex');
				
			 var sql = "UPDATE `members` set password='"+newhash+"', password_string='"+passtr+"'   where member_code='" + membercode + "' and password='" + oldhash + "'";

    var query = db.query(sql, function (err1, result1) {

      if (err1) return res.status(401).send({ error: err1.message });
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
					 to: email,
					//to:'prakash@lokas.info',
					subject: 'MCC - Password Updated',
					// text: 'Your password is ',
					// html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
					html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+firstname+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Your password has been updated successfully. Your new login details are as follows</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Password: <span style="color:red">'+newpassword+'</span></p></td></tr>'+
					'<tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Pin: <span style="color:red">'+pin+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table>'

				};

				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});



		return res.status(200).json({ success: '1'});
		});
 
		}else{
		return  res.status(200).json({ success: '0', error:'confirm password not matching' });
		}
		
	}else{
		return  res.status(200).json({ success: '0', error:'Please enter correct current password' });
	}
	}
  });
});

router.route('/resetpassword').post(function (req, res) {


  var membercode = req.body.passid;
 


  var sql = "SELECT * FROM `members` where member_code='" + membercode + "'";

  var query = db.query(sql, function (err, resultmain) {


    if (resultmain.length == 1) {


      var pass=randomchar(6);
      var passtr=randomchar(2);
      var hash = crypto.createHash('md5').update(pass+passtr).digest('hex');
      var sql = "UPDATE members SET password = '" + hash + "' , password_string= '" + passtr + "'  where member_code='" + membercode + "'";
      db.query(sql, function (err, result) {
        if (err) throw err;
        // console.log(result.affectedRows + " record(s) updated");
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
          to: 'sysadmin@madrascricketclub.org',
          // to: 'sowjanya@lokas.in',
          subject: 'Password reset for MCC member '+membercode,
          // text: 'Your password is ',
         // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
         html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+resultmain[0].first_name+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Your Login Password is as follows</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+resultmain[0].member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Password: <span style="color:red">'+pass+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '
  
        };
      
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
  
        return res.json({ success: '1', membercode: membercode })

      });
     
    }
    //    return res.send('success');

    else
      return res.json({ success: '0' })
    //    return res.send('fail');
  });


});

router.route('/changePin').post(function (req, res){
	
  var membercode = req.body.membercode;
  var oldpin = req.body.oldpin;
  var newpin = req.body.newpin;
  var confirmpin = req.body.confirmpin;
  db.query("SELECT password_string, password, pin, first_name,email FROM members where member_code='" + membercode + "'", function (err, result, fields) {
    if (err) { return res.status(401).send({ error: err.message }); }
    // console.log(result);
    if(result.length == 1){
    // console.log(result);
    password_string = result[0].password_string;
	var firstname = result[0].first_name;
	var pin = result[0].pin;
	var member_code = membercode;
  var email = result[0].email ;
	var currentpass = result[0].password ;
    

		if(oldpin == pin){
			   
				
			 var sql = "UPDATE `members` set pin='"+confirmpin+"'  where member_code='" + membercode + "' and pin='" + oldpin + "'";

    var query = db.query(sql, function (err1, result1) {

      if (err1) return res.status(401).send({ error: err1.message });
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
					 to: email,
					//to:'prakash@lokas.info',
					subject: 'MCC - Pin Updated',
					// text: 'Your password is ',
					// html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
					html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+firstname+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Your pin has been updated successfully. Your new login details are as follows</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+member_code+'</span></p></td></tr>'+
					'<tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Pin: <span style="color:red">'+confirmpin+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table>'

				};

				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});



		return res.status(200).json({ success: '1'});
		});
 
		}else{
		return  res.status(200).json({ success: '0', error:'Old pin not matching' });
		}
		
	
	}
  });
});

module.exports = router;
