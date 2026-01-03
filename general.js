const router = require('express').Router();
// const https = require('node:https');
const multer = require('multer');
const path = require('path');
var nodemailer = require('nodemailer');

require('dotenv').config();

const crypto = require('crypto')
var db = require('./db');
const token = 'eyJraWQiOiJjdXN0b20tb2F1dGgta2V5aWQiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmcmVzaGNoYXQiLCJzdWIiOiI1MTkzYzRkOS00M2ExLTQ4NjUtOTM4Ny1mMzhkNmQxNjQ2OTIiLCJjbGllbnRJZCI6ImZjLWFmMDc5ZTBlLWQ5OTUtNGNhZS05NDdhLWRmNGRmZjliZjMyMSIsInNjb3BlIjoiYWdlbnQ6cmVhZCBhZ2VudDpjcmVhdGUgYWdlbnQ6dXBkYXRlIGFnZW50OmRlbGV0ZSBjb252ZXJzYXRpb246Y3JlYXRlIGNvbnZlcnNhdGlvbjpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgbWVzc2FnZTpnZXQgYmlsbGluZzp1cGRhdGUgcmVwb3J0czpmZXRjaCByZXBvcnRzOmV4dHJhY3QgcmVwb3J0czpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIGFjY291bnQ6cmVhZCBkYXNoYm9hcmQ6cmVhZCB1c2VyOnJlYWQgdXNlcjpjcmVhdGUgdXNlcjp1cGRhdGUgdXNlcjpkZWxldGUgb3V0Ym91bmRtZXNzYWdlOnNlbmQgb3V0Ym91bmRtZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6bWVzc2FnZTpzZW5kIG1lc3NhZ2luZy1jaGFubmVsczptZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6dGVtcGxhdGU6Y3JlYXRlIG1lc3NhZ2luZy1jaGFubmVsczp0ZW1wbGF0ZTpnZXQgZmlsdGVyaW5ib3g6cmVhZCBmaWx0ZXJpbmJveDpjb3VudDpyZWFkIHJvbGU6cmVhZCBpbWFnZTp1cGxvYWQiLCJpc3MiOiJmcmVzaGNoYXQiLCJ0eXAiOiJCZWFyZXIiLCJleHAiOjE5NzY0NjE5MjIsImlhdCI6MTY2MDg0MjcyMiwianRpIjoiOTAyZjE2ZTUtMzM5Yy00OWEzLTg5ZmYtYTk4MzZjZDgyMDNlIn0.yJ1lkKoouewZF_ONSYInPQNL2iyzZUnAQ3cC1jQWS5c';
const axios = require('axios');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/imageupload/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
    /* filename: (req, file, cb) => {
      cb(null, file.originalname)
    }, */
})
const upload = multer({ storage: storage });
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
	// console.log(date);

	var hours = date_ob.getHours();
	var minutes = date_ob.getMinutes();
	var seconds = date_ob.getSeconds();
	return year + month + day + hours + minutes + seconds;

}





router.route('/general_update').post(function (req, res) {

	var phone = req.body.phone;
	var email = req.body.email;
	var address = req.body.address;


	// var obj = JSON.parse(req.body);
	var obj = req.body;
	var keys = Object.keys(req.body);
	for (var i = 0; i < keys.length; i++) {
		//   console.log(obj[keys[i]]);
		//   db.query("SELECT * FROM setting where name='" + keys[i] + "'", function (err, result, fields) {
		// 	if (err) { return res.status(401).send({ error: err.message }); }
		// 	if (result.length == 1) {
		// 		var query="update  setting set value='" + obj[keys[i]] + "'  where name='" + keys[i] + "'"
		// 		db.query(query, function (err, result) {
		// 			if (err) return res.status(401).send({ error: err.message });
					
		// 		});

		// 	} else {
		// 		var query="insert into  setting(name,value) VALUES set ('" + keys[i] + "','" + obj[keys[i]] + "')";
		// 		db.query(query, function (err, result) {
		// 			if (err) return res.status(401).send({ error: err.message });
					
		// 		});
		// 	}
		// }
		// );
		var query="update  setting set value='" + obj[keys[i]] + "'  where name='" + keys[i] + "'"
				db.query(query, function (err, result) {
					if (err) return res.status(401).send({ error: err.message });
					
				});
	}

	return res.status(200).json({ success: '1' });
		// var sql = "update  setting set value='" + phone + "'  where name='phone'";

		// db.query(sql, function (err, result) {
		// 	if (err) return res.status(401).send({ error: err.message });
		// 	// console.log("1 record inserted");
		// 	// return res.status(200).json({ success: '1' });
		// });

		// sql = "update  setting set value='" + email + "'  where name='email'";

		// db.query(sql, function (err, result) {
		// 	if (err) return res.status(401).send({ error: err.message });
		// 	// console.log("1 record inserted");
		// 	// return res.status(200).json({ success: '1' });
		// });

		// sql = "update  setting set value='" + address + "'  where name='address'";

		// db.query(sql, function (err, result) {
		// 	if (err) return res.status(401).send({ error: err.message });
		// 	// console.log("1 record inserted");
		// 	return res.status(200).json({ success: '1' });
		// });


	});







router.route('/general_get').get(function (req, res) {

	var sql = "select max(case when name = 'phone' then value end) phone,max(case when name = 'email' then value end) email,    max(case when name = 'address' then value end) address,max(case when name = 'year' then value end) year,max(case when name = 'clubtime' then value end) clubtime,max(case when name = 'officetime' then value end) officetime  from setting";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});


router.route('/get_committee_members').get(function(req,res){
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
			where +="name LIKE '%"+term+"%' OR designation  LIKE '%"+term+"%' OR address  LIKE '%"+term+"%' OR email LIKE '%"+term+"%' "
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
	var sqlTotal = "SELECT COUNT(mid) as totalcount from mcc_board_members "+where+" "+sort+";";
     var sql="select  mid, name, designation,address,email,photo from mcc_board_members "+where+" "+sort+" "+limit+" ;";
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

  router.route('/create_committee_member').post(function(req,res){

   
	var name = req.body.item.name;
	var designation = req.body.item.designation;
	var address = req.body.item.address;
	var email = req.body.item.email;
      var sql="INSERT INTO mcc_board_members(name, designation,address,email) values('"+name+"','"+designation+"','"+address+"', '"+email+"')";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message});

       return  res.status(200).send({success:1 });
     });
    

  });


  router.route('/update_committee_member').post(function(req,res){
	var name = req.body.item.name;
	var designation = req.body.item.designation;
	var address = req.body.item.address;
	var email = req.body.item.email;
	var mid=req.body.item.mid;
	

      var sql="UPDATE mcc_board_members SET name='"+name+"',designation='"+designation+"',address='"+address+"', email='"+email+"' where mid='"+mid+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ success:1 });
     });
    

  });

  router.route('/delete_committee_member').post(function(req,res){

    var ids= req.body.ids;

      var sql="delete from mcc_board_members where mid IN ("+ids+") ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ success:1 });
     });
    

  });



  router.route('/get_affiliate_club_detail').get(function (req, res) {
	
	var sql = "select * from Affiliate_club where active='1' order by club_name";


	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {

			return res.status(200).send({ success: 1, result: result });


			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}
	});


});


router.route('/get_affiliate_club').get(function(req,res){
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
			where +="club_name LIKE '%"+term+"%' OR club_type  LIKE '%"+term+"%'  OR contact_person  LIKE '%"+term+"%' OR phone  LIKE '%"+term+"%' OR address  LIKE '%"+term+"%' OR email LIKE '%"+term+"%' "
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
	var sqlTotal = "SELECT COUNT(id) as totalcount from Affiliate_club "+where+" "+sort+";";
     var sql="select  * from Affiliate_club "+where+" "+sort+" "+limit+" ;";
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


router.route('/create_affiliate_club').post(function(req,res){

   
	var club_name = req.body.item.club_name;
	var club_type = req.body.item.club_type;
	var contact_person = req.body.item.contact_person;
	var phone = req.body.item.phone;
	var address = req.body.item.address;
	var email = req.body.item.email;
      var sql="INSERT INTO Affiliate_club(club_name, club_type,contact_person,phone,address,email) values('"+club_name+"','"+club_type+"','"+contact_person+"','"+phone+"','"+address+"', '"+email+"')";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message});

       return  res.status(200).send({success:1 });
     });
    

  });


  router.route('/update_affiliate_club').post(function(req,res){
	var club_name = req.body.item.club_name;
	var club_type = req.body.item.club_type;
	var contact_person = req.body.item.contact_person;
	var phone = req.body.item.phone;
	var address = req.body.item.address;
	var email = req.body.item.email;
	var id=req.body.item.id;
	

      var sql="UPDATE Affiliate_club SET club_name='"+club_name+"',club_type='"+club_type+"',contact_person='"+contact_person+"',phone='"+phone+"',address='"+address+"', email='"+email+"' where id='"+id+"'";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ success:1 });
     });
    

  });

  router.route('/delete_affiliate_club').post(function(req,res){

    var ids= req.body.ids;

      var sql="delete from Affiliate_club where id IN ("+ids+") ";
    db.query(sql, function (err, result) {
       if (err)  return res.status(401).send({ error: err.message });
       return  res.status(200).send({ success:1 });
     });
    

  });


  router.route('/image_category_get').get(function (req, res) {

	
	var sql = "select * from image_category where flag=1";
	// console.log('sql', sql);
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/get_image_upload').get(function (req, res) {

	
	
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
				where +="B.name LIKE '%"+term+"%' OR A.name  LIKE '%"+term+"%' "
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
		var sqlTotal = "SELECT COUNT(A.id) as totalcount from  `image_upload` A left join  image_category B on category=B.id "+where+" "+sort+";";
		 var sql="SELECT A.id,A.category as category,B.name as catname,CONCAT(B.name, ' (', B.size,')') as categoryname,A.name as name FROM `image_upload` A left join  image_category B on category=B.id "+where+" "+sort+" "+limit+" ;";
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

router.route('/image_upload').post(upload.fields([{
    name: 'name_file', maxCount: 1
}]), function (req, res) {
    // console.log('request', req.body);
    // console.log("Request file ---", req.files.file[0].filename);

    var category = req.body.category;
    

    var sql = " INSERT INTO image_upload (category,status,flag) VALUES ('" + category + "','1','1')";
    db.query(sql, function (err, result) {
        if (err) return res.status(401).send({ error: err.message });
        // console.log('insertId', result.insertId);
        if (result.insertId) {
            
            var lastid = result.insertId;
            if (req.files.name_file) {
                var name_image = req.files.name_file[0].filename;
                var sql1 = "UPDATE image_upload SET name='" + name_image + "' WHERE id='" + lastid + "'"
                db.query(sql1, function (err1, result1) {
                    if (err1) return res.status(401).send({ error: err1.message });
                });
            }
            


            return res.status(200).json({ success: '1' });
        } else {
            return res.status(401).json({ success: '0', error: 'Unbale to Add' });
        }
    });
});



router.route('/image_upload_delete').post(function (req, res) {
    var ids = req.body.ids;


    var sql = "delete from  image_upload where id IN (" + ids + ")";
    db.query(sql, function (err, result) {
        if (err) return res.status(401).send({ error: err.message });
        // console.log("1 record deleted");
        return res.status(200).json({ success: '1' });
    });



});


router.route('/image_upload_update').post(upload.fields([{
    name: 'name_file', maxCount: 1
}]), function (req, res) {

    var set = "";
    if (req.body.category != "") {
        var category = req.body.category;
        if (set == "") { set += " category ='" + category + "' " } else { set += ", category ='" + category + "' " }
    }

    


   

    if (req.files.name_file) {
        var name_file = req.files.name_file[0].filename;
        if (set == "") { set += " name ='" + name_file + "' " } else { set += ", name ='" + name_file + "' " }
    }
    
    var id = req.body.id;
    var sql = " UPDATE image_upload  SET " + set + " WHERE id='" + id + "'";
    db.query(sql, function (err, result) {
        if (err) return res.status(401).send({ error: err.message });
        
        return res.status(200).json({ success: '1', response: result, sql: sql });
    });

});

router.route('/check_image_category_count').get(function (req, res) {

	var category=req.query.category;
	var type=req.query.type;
	if(type==0 && category !='')
	{

	var sql = "SELECT  * FROM `image_upload` A left join image_category B on A.category=B.id where category='"+category+"';";
	// console.log('sql', sql);
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		if (result.length==0)
		return res.send({ success: 0 });
		else
		if(result.length==result[0].count)
		return res.send({ success: 1 });
		else
		return res.send({ success: 0 });
	});

	}
	else{
		return res.send({ success: 0 });
	}
});

module.exports = router;
