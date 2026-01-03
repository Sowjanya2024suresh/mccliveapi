const router = require('express').Router();



require('dotenv').config();

const crypto = require('crypto')
var db=require('./db');
var nodemailer = require('nodemailer');



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

router.route('/create_memberold').post(function(req,res){

    var pass=randomchar(6);
    var passtr=randomchar(2);
    var hash = crypto.createHash('md5').update(pass+passtr).digest('hex');
    var pin =randomnumber(4);
	var item = req.body.item;
	var member_code= item.member_code;
    var firstname= item.first_name;
    var lastname= item.last_name;
    var sex= item.sex;
    var email= item.email;
    var mobile_no= item.mobile_no;
    var postal_address= item.postal_address;
	var doj= item.doj;
	var type="U";
	var login_check="f";
      var sql="INSERT INTO members(member_code,password,password_string,type,first_name,last_name, email,sex, date_of_join,mobile_no,postal_address,login_check,pin) values('"+member_code+"','"+hash+"','"+passtr+"', '"+type+"', '"+firstname+"','"+lastname+"','"+email+"','"+sex+"','"+doj+"','"+mobile_no+"', '"+postal_address+"', '"+login_check+"','"+pin+"')";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message});

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

      var mailOptions = "";
  
        mailOptions = {
          from: 'social@madrascricketclub.org',
          to: req.body.email,
          subject: 'Email from MCC',
          text: 'Your password is ' + pass + "\n Your pin is "+pin,

        };
      

      
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

       return  res.status(200).send({success:1 });
     });
    

  });
router.route('/create_member').post(function(req,res){

    var pass=randomchar(6);
    var passtr=randomchar(2);
    var hash = crypto.createHash('md5').update(pass+passtr).digest('hex');
    var pin =randomnumber(4);
	var item = req.body.item;
	var member_code= item.member_code;
    var firstname= item.first_name;
    var lastname= item.last_name;
    var sex= item.sex;
    var email= item.email;
    var mobile_no= item.mobile_no;
    var postal_address= item.postal_address;
	var doj= item.doj;
	var type="U";
	var login_check="f";
      var sql="INSERT INTO members(member_code,password,password_string,type,first_name,last_name, email,sex, date_of_join,mobile_no,postal_address,login_check,pin) values('"+member_code+"','"+hash+"','"+passtr+"', '"+type+"', '"+firstname+"','"+lastname+"','"+email+"','"+sex+"','"+doj+"','"+mobile_no+"', '"+postal_address+"', '"+login_check+"','"+pin+"')";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message});
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
        subject: 'MCC - Password Info.',
        // text: 'Your password is ',
       // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
       html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear '+firstname+'&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">First time member login</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Password: <span style="color:red">'+pass+'</span></p></td></tr>'+
'<tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Pin: <span style="color:red">'+pin+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table>'

      };
      
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

       return  res.status(200).send({success:1 });
     });
    

  });
  router.route('/select_member').get(function(req,res){

    var member_code= req.query.member_code;

      var sql="select member_code,first_name,DATE_FORMAT(date_of_join,'%d-%b-%Y') AS doj,type from members where member_code='"+member_code+"' ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length == 1) {
        return  res.status(200).send({ success:1,result: result });
       }
       return  res.status(200).send({ success:0,result: result  });
     });
    

  });

  router.route('/delete_member').post(function(req,res){

    var ids= req.body.ids;

      var sql="delete from members where id IN ("+ids+") ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ success:1 });
     });
    

  });

  router.route('/check_member').get(function(req,res){

    var member_code= req.query.member_code;

      var sql="select member_code from members where member_code='"+member_code+"' ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length == 1) {
       return  res.status(200).send({ success:"1" });
       }
       return  res.status(200).send({ success:"0" });
     });
    

  });

router.route('/check_member_email_unique').get(function(req, res){
var member_id= req.query.memberid;
 var sql="SELECT id from members ";
 var where = " ";


if(req.query.email){
var email= req.query.email;
 sql += " where email ='"+email+"'";
if(member_id!=''){
	 sql += " AND id !='"+member_id+"'";
}
}


    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length > 0 ) {
       return  res.status(200).send({ success:"1" });
       }
       return  res.status(200).send({ success:"0" });
     });
    
});
router.route('/check_member_code_unique').get(function(req, res){
var member_id= req.query.memberid;
 var sql="SELECT id from members ";
 var where = " ";

if(req.query.member_code){
var member_code= req.query.member_code;
 sql += " where member_code='"+member_code+"'";
if(member_id!=''){
	 sql += " AND id !='"+member_id+"'";
}
}


    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length > 0 ) {
       return  res.status(200).send({ success:"1" });
       }
       return  res.status(200).send({ success:"0" });
     });
    
});
  router.route('/get_current_month_close_bal').get(function(req,res){

    var member_code= req.query.member_code;

      var sql="SELECT b.closing_amount FROM billing_details b INNER JOIN file_info f On f.id=b.file_info_id where MONTH(f.bill_date) = MONTH(CURDATE()) AND member_code = '"+member_code+"' ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ result: result });
     });
    

  });


  router.route('/member_detail').get(function(req,res){

    var member_code= req.query.member_code;

      var sql="select member_code,first_name,last_name,email,sex,DATE_FORMAT(date_of_join,'%d-%b-%Y') AS doj,last_login,ip_address,mobile_no,postal_address from members where member_code='"+member_code+"' OR first_name='"+member_code+"' ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       if (result.length == 1) {
       return  res.status(200).send({ success:1,result: result });
       }
       return  res.status(200).send({ success:0,result: result });
     });
    

  });
  router.route('/update_member').post(function(req,res){
	var item = req.body.item;
    var member_code= item.member_code;
    var firstname= item.first_name;
    var lastname= item.last_name;
    var sex= item.sex;
    var email= item.email;
    var mobile_no= item.mobile_no;
    var postal_address= item.postal_address;
var doj= item.doj;
    var id= item.id;

      var sql="UPDATE members SET first_name='"+firstname+"',last_name='"+lastname+"',sex='"+sex+"', email='"+email+"',mobile_no='"+mobile_no+"',postal_address="+db.escape(postal_address)+", member_code='"+member_code+"', date_of_join='"+doj+"' where id='"+id+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message, sql:sql });
       return  res.status(200).send({ success:1 });
     });
    

  });

	router.route('/get_members').get(function(req,res){
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
			where +="member_code LIKE '%"+term+"%' OR member_code  LIKE '%"+term+"%' OR first_name  LIKE '%"+term+"%' OR last_name LIKE '%"+term+"%' OR email  LIKE '%"+term+"%' OR  mobile_no  LIKE '%"+term+"%'"
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
	var sqlTotal = "SELECT COUNT(id) as totalcount from members "+where+" "+sort+";";
     var sql="select  id, pin, member_code,first_name,last_name,email,sex,DATE_FORMAT(date_of_join,'%Y-%m-%d') AS doj, last_login,ip_address,mobile_no,postal_address from members "+where+" "+sort+" "+limit+" ;";
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
  

module.exports = router;
