const router = require('express').Router();
const https = require('node:https');
const multer = require('multer');
const path = require('path');
var nodemailer = require('nodemailer');

require('dotenv').config();

const crypto = require('crypto')
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
function randomid()
{
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();
     
  var date = year + "-" + month + "-" + day;
  // console.log(date);
      
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();
  return year +  month +  day  + hours  + minutes + seconds;
    
}
function smsOrdertoMember(orderID, MemberId, number){

https.request('https://7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com/dev/sendsms_orderto_member?memberid='+MemberId+'&orderid='+orderID+'&to='+number+'', function(res) {
  console.log('SMS STATUS: ' + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
     console.log('Sms BODY: ' + chunk); 
  });
}).end(); 
 
}
function smstoFandB(orderID, MemberId){

https.request('https://7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com/dev/sendsms?name=Dear F and B Manager&type=Online&memberid='+MemberId+'&orderid='+orderID+'&to=9710933353,9710933311,9710744221', function(res) {
  console.log('SMS STATUS: ' + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
     console.log('Sms BODY: ' + chunk); 
  });
}).end(); 
 
}

function smstoFandBWhatsup(orderID, MemberId, number){

const data = JSON.stringify({
        'number': number,
	// 'number': '9787128371',
	 'member_code':MemberId,
	  'orderid': orderID 
    });
console.log(data);
const options = {
  hostname:'7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com',
  port:443, 
  path: '/dev/mcc/send_orderdetail_to_fb',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  
}

const req = https.request(options, (res) => {
  console.log(`whatsup statusCode: ${res.statusCode}`)
  // console.log('headers:', res.headers);
   res.setEncoding('utf8');
  res.on('data', (d) => {
    process.stdout.write(d)
console.log('Whatsup BODY: ' + d);
  })

})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()



}


function ordersendemail()
{
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
		to: 'banquets@madrascricketclub.org', 
		subject: 'New Order...!',
		cc: 'raghav@lokas.in',
		// text: 'Your password is ',
	   // html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
	   html: 'New order received from portal..!!'
	
	  };
	
	  transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/itemimg/')
  },
  filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
  /* filename: (req, file, cb) => {
    cb(null, file.originalname)
  }, */
})

const upload = multer({ storage: storage });

const catstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/itemcatimg/')
  },
  filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
  /* filename: (req, file, cb) => {
    cb(null, file.originalname)
  }, */
})

const catupload = multer({ storage: catstorage });

router.route('/category_get').get(function(req,res){


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
			where +="( name LIKE '%"+term+"%' OR description  LIKE '%"+term+"%' OR active  LIKE '%"+term+"%' )";
		}
	}
	if(req.query.active){
		var active=req.query.active;
		if(where == ''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(active!=''){
			where +=" active='"+active+"'";
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
       
	var sqlTotal = "SELECT COUNT(id) as totalcount from rest_category "+where+" "+sort+";";
     
    var sql = "select * from rest_category "+where+" "+sort+" "+limit+" ;";
 db.query(sql, function (err, result) {
    if (err)  return res.status(401).send({ error: err.message });
    if (result.length >= 0) {
		   db.query(sqlTotal, function (errcount, sqlTotalResult){
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

router.route('/category_add').post(catupload.single('file'), function(req,res){
	// console.log('request', req.body);
// /////////////////////////////////////////// console.log("Request file ---", req.file);
	var item = req.body.item;
  var name= req.body.name;
  var description= req.body.description;
  var active	= req.body.active;
  if(req.file){
	var filename = req.file.filename;	
	 var sql = "INSERT INTO rest_category ( name, image, description, active) VALUES ('"+name+"', '"+filename+"','"+description+"','"+active+"');";
}else{
	 var sql = "INSERT INTO rest_category ( name,description, active) VALUES   ('"+name+"', '"+description+"','"+active+"');";
}

   
 db.query(sql, function (err, result) {
    if (err)  return res.status(401).send({ error: err.message });
   // console.log("1 record inserted");
    return res.status(200).json({ success: '1'});
  });
  
  
});


router.route('/category_update').post(catupload.single('file'), function(req,res) {

// var item = req.body.item;
// console.log('request', req.body);
  var name= req.body.name;
  var description= req.body.description;
  var active	= req.body.active;
  var id= req.body.id;
  if(req.file){
var filename = req.file.filename;	
var sql = "update rest_category set  name='"+name+"', image='"+filename+"', description='"+description+"', active='"+active+"' where id='"+id+"'";
}else{
	var sql = "update rest_category set  name='"+name+"', description='"+description+"', active='"+active+"' where id='"+id+"'";
}
  
  db.query(sql, function (err, result) {
     if (err) return res.status(401).send({ error: err.message });
     // console.log("1 record updated");
     return res.status(200).json({ success: '1', response:result });
   });
  

  
});



router.route('/category_delete').post(function(req,res) {
 var ids= req.body.ids;


  var sql = "delete from  rest_category  where id IN ("+ids+")";
  db.query(sql, function (err, result) {
     if (err) return res.status(401).send({ error: err.message });
    // console.log("1 record deleted");
     return res.status(200).json({ success: '1' });
   });
  

  
});


router.route('/sub_category_get').get(function(req,res){

var catid = req.query.catid
var where ="";
if(catid && catid!=""){
	where +="where cat_id='"+catid+"'";
}
  var sql = "select * from rest_sub_category "+where+" ";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
 // console.log("1");
  return  res.send({success:1, result: result });
});


});

router.route('/sub_category_add').post(function(req,res){

	var item = req.body.item;
	var name= item.sub_name;
	var description= item.sub_desc;
	var active	= item.active;
	var catid= item.cat_id;

  var sql = "INSERT INTO rest_sub_category ( sub_name,sub_desc,cat_id, active) VALUES   ('"+name+"', '"+description+"','"+catid+"','"+active+"')";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
 // console.log("1 record inserted");
  return res.status(200).json({ success: '1' });
});


});


router.route('/sub_category_update').post(function(req,res) {

	var item = req.body.item;
	var name= item.sub_name;
	var description= item.sub_desc;
	var active	= item.active;
	var catid= item.cat_id;
	var sub_id = item.sub_id
var sql = "update rest_sub_category set  sub_name='"+name+"', sub_desc='"+description+"', cat_id='"+cat_id+"', active='"+active+"' where sub_id='"+sub_id+"'";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record updated");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/sub_category_delete').post(function(req,res) {
var ids= req.body.ids;



var sql = "delete from  rest_sub_category  where sub_id IN ("+ids+")";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record deleted");
   return res.status(200).json({ success: '1' });
 });



});

router.route('/address_get').get(function(req,res){

var member_code = req.query.member_code;
var where ="";
if(member_code && member_code!=""){
	where +="where member_code='"+member_code+"'";
}
  var sql = "select * from rest_delivery_address "+where+"  ORDER BY id DESC";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message});
 // console.log("1");
  return  res.send({success:1, result: result });
});


});

router.route('/address_add').post(function(req,res){

	var item = req.body.item;
	var first_name= item.first_name;
	var last_name= item.last_name;
	var member_code= item.member_code;
	var phone= item.phone;
	var state= item.state;
	var zipcode= item.zipcode;
	var city= item.city;
	var address= item.address;

  var sql = "INSERT INTO rest_delivery_address ( first_name,last_name,member_code, phone, state, city, address,  zipcode ) VALUES   ('"+first_name+"', '"+last_name+"','"+member_code+"','"+phone+"','"+state+"','"+city+"','"+address+"','"+zipcode+"')";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
 // console.log("1 record inserted");
  return res.status(200).json({ success: '1', insetedid: result.insertId });
});


});


router.route('/address_update').post(function(req,res) {

	var item = req.body.item;
	var first_name= item.first_name;
	var last_name= item.last_name;
	var member_code= item.member_code;
	var phone= item.phone;
	var state= item.state;
	var zipcode= item.zipcode;
	var city= item.city;
	var address= item.address;
	var id = item.id;
var sql = "update rest_delivery_address set  first_name='"+first_name+"', last_name='"+last_name+"', phone='"+phone+"', state='"+state+"', city='"+city+"', address='"+address+"', zipcode='"+zipcode+"' where id='"+id+"'";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record updated");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/address_delete').post(function(req,res) {
var ids= req.body.ids;



var sql = "delete from  rest_delivery_address  where id IN ("+ids+")";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
   // console.log("1 record deleted");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/status_get').get(function(req,res){


  var sql = "select * from rest_order_status where active=1";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
  // console.log("1");
  return  res.send({ success:1,result: result });
});


});

router.route('/status_add').get(function(req,res){

var name= req.query.name;

  var sql = "INSERT INTO rest_order_status ( status_name) VALUES   ('"+name+"')";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
  // console.log("1 record inserted");
  return res.status(200).json({ success: '1' });
});


});


router.route('/status_update').get(function(req,res) {


var sql = "update rest_order_status set  status_name='"+req.query.name+"', active='"+req.query.active+"' where status_id='"+req.query.id+"'";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record updated");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/status_delete').get(function(req,res) {


var sql = "delete from  rest_order_status  where status_id='"+req.query.id+"'";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record deleted");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/item_get').get(function(req,res){
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
			where +=" ( item_name LIKE '%"+term+"%' OR varient  LIKE '%"+term+"%' OR description  LIKE '%"+term+"%' OR price  LIKE '%"+term+"%' OR active  LIKE '%"+term+"%' )";
		}
	}
	if(req.query.currentCat){
		var currentCat=req.query.currentCat;
		if(where == ''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(currentCat!=''){
			where +=" cat_id='"+currentCat+"'";
		}
		
	}
	if(req.query.active){
		var active=req.query.active;
		if(where == ''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(active!=''){
			where +=" active='"+active+"'";
		}
		
	}
	if(req.query.foodType){
		var foodType=req.query.foodType;
		if(where == ''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(foodType!=''){
			where +=" varient='"+foodType+"'";
		}
		
	}
	if(req.query.pageSize && req.query.pageIndex){
		if(limit==''){
			limit +=" Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if(pageIndex !=''){
			limit +="  "+(pageIndex*pageSize)+", "+pageSize+"";
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
	var sqlTotal = "SELECT COUNT(item_id) as totalcount from rest_menu_item "+where+" "+sort+";";
     
    var sql = "select * from rest_menu_item "+where+" "+sort+" "+limit+" ;";
	// return sql;
	// console.log(sql);

db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
     if (result.length >= 0) {
		   db.query(sqlTotal, function (errcount, sqlTotalResult){
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

router.route('/item_add').post(upload.single('file'), function(req,res){
// console.log('request', req.body);
// console.log("Request file ---", req.file);
var name= req.body.item_name;
var cat_id= req.body.cat_id;
// var sub_cat_id= req.query.sub_cat_id;
var description= req.body.description;
var varient= req.body.varient;
// var ingredients= req.query.ingredients;
var price= req.body.price;
// var filename = req.file.filename;
var active = req.body.active;
var availability_time = req.body.availability_time;
var banquet_type = req.body.banquet_type;
var kitchen ='';
if(req.file){
var filename = req.file.filename;	
var sql = "INSERT INTO rest_menu_item ( item_name,cat_id,description,varient,price, active, item_image, item_kitchen,availability_time,banquet_type) VALUES   ('"+name+"','"+cat_id+"','"+description+"','"+varient+"','"+price+"', '"+active+"','"+filename+"','"+kitchen+"','"+availability_time+"','" + banquet_type + "')";
}else{
	var sql = "INSERT INTO rest_menu_item ( item_name,cat_id,description,varient,price, active,  item_kitchen,availability_time,banquet_type) VALUES   ('"+name+"','"+cat_id+"','"+description+"','"+varient+"','"+price+"', '"+active+"','"+kitchen+"','"+availability_time+"','" + banquet_type + "')";
}

db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
//  console.log("1 record inserted");
  return res.status(200).json({ success: '1' });
}); 
 // return res.status(200).send({ error: 'error' });

});


router.route('/item_update').post(upload.single('file'), function(req,res) {
// console.log('request', req.body);
// console.log("Request file ---", req.file);
var id= req.body.item_id;
var name= req.body.item_name;
var cat_id= req.body.cat_id;
// var sub_cat_id= req.query.sub_cat_id;
var description= req.body.description;
var varient= req.body.varient;
// var ingredients= req.query.ingredients;
var price= req.body.price;
var active = req.body.active;
var availability_time = req.body.availability_time;
var banquet_type = req.body.banquet_type;
var kitchen ='';
if(req.file){
var filename = req.file.filename;	
var sql = "update rest_menu_item set  item_name='"+name+"',item_image='"+filename+"',item_kitchen='"+kitchen+"', cat_id='"+cat_id+"',description='"+description+"',varient='"+varient+"',price='"+price+"', active='"+active+"',availability_time='"+availability_time+"',banquet_type='" + banquet_type + "' where item_id='"+id+"'";
}else{
	var sql = "update rest_menu_item set  item_name='"+name+"',item_kitchen='"+kitchen+"', cat_id='"+cat_id+"',description='"+description+"',varient='"+varient+"',price='"+price+"', active='"+active+"',availability_time='"+availability_time+"',banquet_type='" + banquet_type + "' where item_id='"+id+"'";
}

// console.log('sql', sql);


db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message});
//   console.log("1 record updated");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/item_delete').post(function(req,res) {

var ids= req.body.ids;
var sql = "delete from  rest_menu_item  where item_id IN ("+ids+")";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
//   console.log("1 record deleted");
   return res.status(200).json({ success: '1' });
 });



});



router.route('/order_get').get(function(req,res){
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
			if(req.query.CurrentUserId){
			where +=" member_code LIKE '%"+term+"%' OR order_id  LIKE '%"+term+"%' OR order_status  LIKE '%"+term+"%'";
			}else{
			where +=" ( order_id  LIKE '%"+term+"%' OR order_status  LIKE '%"+term+"%' )";	
			}
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
	var sqlTotal = "SELECT COUNT(order_id) as totalcount from rest_order "+where+" "+sort+";";
     
    var sql = "select * from rest_order "+where+" "+sort+" "+limit+" ;";
	// console.log(sql);
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
		   db.query(sqlTotal, function (errcount, sqlTotalResult){
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



router.route('/orderdetail_get').get(function(req,res){
var where ='';
	
	if(req.query.orderId){
		var orderId=req.query.orderId;
		if(where==''){
			where += "WHERE ";
		}else{
			where +=' AND ';
		}
		if(orderId!=''){
			where +=" order_id='"+orderId+"';";
		}
		
	}
   
    var sql = "select * from rest_order "+where+" ;";
	
	
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
       if (result.length >= 0) {
			var orderitemssql = "select * from rest_in_order "+where+" ;";
			db.query(orderitemssql, function (erra, resulta) {
				if (erra)  return res.status(401).send({ error: erra.message });
				if (resulta.length >= 0) {
					// console.log(result[0].member_code);
					 var customer_detail = "select * from members where  member_code='"+result[0].member_code+"' ;";
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


router.route('/order_add').post(function(req,res){
var cart = req.body.cart;
var user = req.body.currentUser;
var member_phone = user.mobile_no;
var member_code= user.membercode;
var cartTotalAmount = cart.cartTotalAmount;
var cartTotalQuantity=cart.cartTotalQuantity;
var order_status= "1";
var order_time= getdatetime();
var cartItems = cart.cartItems;

if(req.body.clubPickup == 2)
	{
	var clubPickup = req.body.clubPickup;
	var delivery_address = req.body.delivery_address;
	}
else
if(!req.body.clubPickup && req.body.clubPickup!=1){
var clubPickup = 0;
var delivery_address= req.body.delivery_address;
}else{
	var clubPickup = req.body.clubPickup;
}

if(req.body.clubPickup===1){
 var pickup_time = req.body.selectedTime;
 if(req.body.clubPickup == 2)
		pickup_time="";
	var sql = "INSERT INTO rest_order ( member_code,is_club_pickup, pickup_time, order_status,order_time,total_items, final_price, price) VALUES   ('"+member_code+"','"+clubPickup+"','"+pickup_time+"','"+order_status+"','"+order_time+"','"+cartTotalQuantity+"','"+cartTotalAmount+"','"+cartTotalAmount+"');";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
   // console.log("inserted");
  if(result.insertId){
  var lastid = result.insertId;
   for (cartItem of cartItems) {  
  // console.log(`cartitem ${cartItem.item_id}`);
  var cartitemid= cartItem.item_id;
  var cartquantity = cartItem.cartQuantity;
  var price = cartItem.price;
  var itemTotal = cartquantity*price;
  var jsoncart = JSON.stringify(cartItem);
  var itemsql = "INSERT INTO rest_in_order (order_id, item_id, member_code,quantity,item_price,price,detalis) VALUES   ('"+lastid+"', '"+cartitemid+"','"+member_code+"','"+cartquantity+"','"+price+"','"+itemTotal+"','"+jsoncart+"');";
	db.query(itemsql, function (erra, resulta) {
  if (erra)  return res.status(401).send({ error: erra.message });
  
   
	});
  }
ordersendemail();
smstoFandB(lastid, member_code); 
smsOrdertoMember(lastid, member_code, member_phone);
smstoFandBWhatsup(lastid, member_code, '9710933353');
smstoFandBWhatsup(lastid, member_code, '9710933311');
smstoFandBWhatsup(lastid, member_code,  '9710744221');
  return res.status(200).json({ success: '1' });
  }else{
	    return res.status(401).json({ success: '0', error:'Unbale to Add' });
  }
 

});
}
else{
	var sql = "INSERT INTO rest_order ( member_code,delivery_address,order_status,order_time,total_items, final_price, price) VALUES   ('"+member_code+"','"+delivery_address+"','"+order_status+"','"+order_time+"','"+cartTotalQuantity+"','"+cartTotalAmount+"','"+cartTotalAmount+"');";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
  // console.log("1 record inserted");
  if(result.insertId){
  var lastid = result.insertId;
   for (cartItem of cartItems) {  
 // console.log(`cartitem ${cartItem.item_id}`);
  var cartitemid= cartItem.item_id;
  var cartquantity = cartItem.cartQuantity;
  var price = cartItem.price;
  var itemTotal = cartquantity*price;
    var jsoncart = JSON.stringify(cartItem);
  var itemsql = "INSERT INTO rest_in_order (order_id, item_id, member_code,quantity,item_price,price,detalis) VALUES   ('"+lastid+"', '"+cartitemid+"','"+member_code+"','"+cartquantity+"','"+price+"','"+itemTotal+"','"+jsoncart+"');";
	db.query(itemsql, function (erra, resulta) {
  if (erra)  return res.status(401).send({ error: erra.message });
  
   
	});
	}
ordersendemail();
smstoFandB(lastid, member_code);
smsOrdertoMember(lastid, member_code, member_phone);
smstoFandBWhatsup(lastid, member_code, '9710933353');
smstoFandBWhatsup(lastid, member_code, '9710933311'); 
smstoFandBWhatsup(lastid, member_code,  '9710744221');
	return res.status(200).json({ success: '1' });

  }else{
	 return res.status(401).json({ success: '0', error:'Unbale to Add' });
  }

});
}

/* 
  var sql = "INSERT INTO rest_order ( member_code,delivery_address,order_status,order_time,comment) VALUES   ('"+member_code+"','"+delivery_address+"','"+order_status+"','"+order_time+"','"+comment+"')";
db.query(sql, function (err, result) {
  if (err)  return res.status(401).send({ error: err.message });
  // console.log("1 record inserted");
  
  return res.status(200).json({ success: '1' });
});
*/
 // return res.status(200).json({ success: '1' });
});


router.route('/order_update').get(function(req,res) {


var sql = "update rest_order set price='"+req.query.price+"',discount='"+req.query.discount+"',final_price='"+req.query.final_price+"',comment='"+req.query.comment+"' where order_id='"+req.query.order_id+"'";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
  // console.log("1 record updated");
   return res.status(200).json({ success: '1' });
 });

});

 router.route('/order_status_update').post(function(req,res) {
var ids= req.body.ids;
var orderstatus= req.body.orderstatus;

  var sql = "update rest_order set order_status='"+orderstatus+"' where order_id IN("+ids+")";
  db.query(sql, function (err, result) {
     if (err) return res.status(401).send({ error: err.message });
    // console.log("1 record updated");
     return res.status(200).json({ success: '1' });
   });

});

router.route('/order_delete').post(function(req,res) {

var ids= req.body.ids;
var sql = "delete from  rest_order  where order_id IN ("+ids+")";
db.query(sql, function (err, result) {
   if (err) return res.status(401).send({ error: err.message });
    var itemsql  = "delete from rest_in_order  where  order_id IN ("+ids+")";
	db.query(itemsql, function (err, result) {
   		if (err) return res.status(401).send({ error: err.message });
   		// console.log("1 record updated");
   		return res.status(200).json({ success: '1' });
 	});    		
 });



});

router.route('/feedback').post(function(req,res) {
 

var event_name= req.body.event_name;
	var order_id= req.body.order_id;
	var member_code = req.body.member_code;
	var member_email = req.body.member_email;
	var member_name = req.body.member_name;
	var member_phone = req.body.member_phone;
	var feedback_cat = req.body.feedback_cat;
	var feedback_message = req.body.feedback_message;


  var sql = "INSERT INTO feedback ( member_code,feedback_category, ref_id, feedback_text) VALUES ('"+member_code+"', '"+feedback_cat+"', '"+order_id+"','"+feedback_message+"');";;
  db.query(sql, function (err, result) {
     if (err) return res.status(401).send({ error: err.message }); 
     // console.log("1 record deleted");
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
	  to: 'banquets@madrascricketclub.org',
          subject: 'Feedback for F&B Order, Order Id: '+order_id,
         html : '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt"> <tbody><tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black"><img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear Admin &nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">A Member is Sent Feedback for F&B Order, Order Id: '+order_id+'. Details are as Follows </p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Name: <span style="color:red">'+member_name+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">'+member_code+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Email: <span style="color:red">'+member_email+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Phone: <span style="color:red">'+member_phone+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Feedback: <span style="color:red">'+feedback_message+'</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '
  
        };
      
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
			// return res.status(401).send({ error: error }); 
          } 
        });
     return res.status(200).json({ success: '1' });
    });
  

  
});

router.route('/order_remove_single_item').post(function(req,res) {

	var itemId = req.body.itemId;
	var itemData = req.body.itemData;
	 var picked = itemData.findIndex(o => o.in_order_id === itemId);
	var order_id = itemData[picked].order_id;
        filteredArray = itemData.filter(item => item.in_order_id !== itemId); 
        // delete itemData[picked];
	// console.log(is_array(itemData));
	var sql = "delete from  rest_in_order  where  in_order_id = '"+itemId+"'";
  	db.query(sql, function (err, result) {
     	if (err) return res.status(401).send({ error: err.message });
 	var cartquantity = 0;
  	var price = 0;
	var discount =0;
	var final_price = 0;
	if(filteredArray.length > 0){
     		for (cartitem of filteredArray) {  
  			// console.log(`cartitem ${cartitem}`);
			cartquantity = cartquantity+cartitem.quantity;
			discount = discount+cartitem.discount;
 			price  = price+cartitem.item_price;
			var quanitprice = cartitem.item_price * cartitem.quantity;
			final_price = final_price+quanitprice; 
		}
	 
	 	var itemsql  = "update rest_order set price='"+price+"',discount='"+discount+"',final_price='"+final_price+"',total_items='"+cartquantity+"' where order_id='"+order_id+"'";
		db.query(itemsql, function (err, result) {
   			if (err) return res.status(401).send({ error: err.message });
   			// console.log("1 record updated");
   			return res.status(200).json({ success: '1', noItem: false  });
 		}); 
	}else{
		var itemsql  = "Update rest_order set order_status='6', price='0',discount='0',final_price='0',total_items='0'  where order_id='"+order_id+"'";
		db.query(itemsql, function (err, result) {
   			if (err) return res.status(401).send({ error: err.message });
   			// console.log("1 record updated");
   			return res.status(200).json({ success: '1', noItem: true });
 		});
	}
      // return res.status(200).json({ success: '1' });
   });
    //  return res.status(200).json({ success: '1', filteredArray : filteredArray , itemId: itemId });
  

   
});



module.exports = router;
