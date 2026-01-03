const router = require('express').Router();
// const https = require('node:https');
const multer = require('multer');
const path = require('path');
var nodemailer = require('nodemailer');

require('dotenv').config();

const crypto = require('crypto')
var db = require('./db');
const token='eyJraWQiOiJjdXN0b20tb2F1dGgta2V5aWQiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmcmVzaGNoYXQiLCJzdWIiOiI1MTkzYzRkOS00M2ExLTQ4NjUtOTM4Ny1mMzhkNmQxNjQ2OTIiLCJjbGllbnRJZCI6ImZjLWFmMDc5ZTBlLWQ5OTUtNGNhZS05NDdhLWRmNGRmZjliZjMyMSIsInNjb3BlIjoiYWdlbnQ6cmVhZCBhZ2VudDpjcmVhdGUgYWdlbnQ6dXBkYXRlIGFnZW50OmRlbGV0ZSBjb252ZXJzYXRpb246Y3JlYXRlIGNvbnZlcnNhdGlvbjpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgbWVzc2FnZTpnZXQgYmlsbGluZzp1cGRhdGUgcmVwb3J0czpmZXRjaCByZXBvcnRzOmV4dHJhY3QgcmVwb3J0czpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIGFjY291bnQ6cmVhZCBkYXNoYm9hcmQ6cmVhZCB1c2VyOnJlYWQgdXNlcjpjcmVhdGUgdXNlcjp1cGRhdGUgdXNlcjpkZWxldGUgb3V0Ym91bmRtZXNzYWdlOnNlbmQgb3V0Ym91bmRtZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6bWVzc2FnZTpzZW5kIG1lc3NhZ2luZy1jaGFubmVsczptZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6dGVtcGxhdGU6Y3JlYXRlIG1lc3NhZ2luZy1jaGFubmVsczp0ZW1wbGF0ZTpnZXQgZmlsdGVyaW5ib3g6cmVhZCBmaWx0ZXJpbmJveDpjb3VudDpyZWFkIHJvbGU6cmVhZCBpbWFnZTp1cGxvYWQiLCJpc3MiOiJmcmVzaGNoYXQiLCJ0eXAiOiJCZWFyZXIiLCJleHAiOjE5NzY0NjE5MjIsImlhdCI6MTY2MDg0MjcyMiwianRpIjoiOTAyZjE2ZTUtMzM5Yy00OWEzLTg5ZmYtYTk4MzZjZDgyMDNlIn0.yJ1lkKoouewZF_ONSYInPQNL2iyzZUnAQ3cC1jQWS5c';
const axios = require('axios');

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
router.route('/check_banquet_hall_date').get(function(req, res){
	var member_code= req.query.member_code;
	var selecteddate= req.query.selecteddate;
	var hall= req.query.hall;
	 var sql="SELECT * from banquet_book ";
	 var where = " ";
	
	if(req.query.selecteddate){

	var selecteddate= req.query.selecteddate;
	var subdate=selecteddate.substring(0, 10);
	 sql += " where status <> '0' and DATE(book_date)='"+subdate+"'";
	 if(req.query.hall){
		var hall= req.query.hall;
		 sql += " and  banquet_hall='"+hall+"'";
		
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
	


router.route('/banquet_get').get(function (req, res) {


	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += "( banquet_name LIKE '%" + term + "%' OR capacity  LIKE '%" + term + "%' OR banquet_status  LIKE '%" + term + "%' )";
		}
	}
	if (req.query.banquet_status) {
		var banquet_status = req.query.banquet_status;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (banquet_status != '') {
			where += " banquet_status='" + banquet_status + "'";
		}

	}
	if (req.query.pageSize && req.query.pageIndex) {
		if (limit == '') {
			limit += " Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if (pageIndex != '') {
			limit += "  " + (pageIndex * pageSize) + ", " + pageSize + "";;
		}
	}

	if (req.query.sortBy && Array.isArray(req.query.sortBy)) {
		var sortBy = req.query.sortBy;
		var sortByobj = JSON.parse(sortBy)
		// console.log('sortBy', sortByobj.desc);
		if (sort == "") {
			sort += " ORDER BY " + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}

	var sqlTotal = "SELECT COUNT(banquet_id) as totalcount from banquet " + where + " " + sort + ";";

	var sql = "select * from banquet " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				return res.status(200).send({ success: 1, result: result, pageCount: totalpage });
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});


router.route('/banquet_book_get').get(function (req, res) {


	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += "( banquet_name LIKE '%" + term + "%' OR banquet_menu_name  LIKE '%" + term + "%' OR member_id  LIKE '%" + term + "%' )";
		}
	}
	if(req.query.id)
	{
		var id = req.query.id;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (id != '') {
			where += " A.id='" + id + "'";
		}
	}
	if (req.query.status) {
		var status = req.query.status;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (status != '') {
			where += " status='" + status + "'";
		}

	}
	if (req.query.membercode) {
		var member_id = req.query.membercode;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (member_id != '') {
			where += " member_id='" + member_id + "'";
		}

	}
	if (req.query.pageSize && req.query.pageIndex) {
		if (limit == '') {
			limit += " Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if (pageIndex != '') {
			limit += "  " + (pageIndex * pageSize) + ", " + pageSize + "";;
		}
	}

	if (req.query.sortBy && Array.isArray(req.query.sortBy)) {
		var sortBy = req.query.sortBy;
		var sortByobj = JSON.parse(sortBy)
		// console.log('sortBy', sortByobj.desc);
		if (sort == "") {
			sort += " ORDER BY " + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}

	var sqlTotal = "SELECT COUNT(id) as totalcount FROM `banquet_book` A left join banquet_menu B on banquet_menu_id=menu_id left join banquet on banquet_hall=banquet_id " + where + " " + sort + ";";

	var sql = "SELECT A.id,member_id,first_name,banquet_hall, DATE_FORMAT(book_date,'%Y-%b-%d %h:%i %p') as book_date,banquet_name as banquet_hall_name,no_guest,hours,A.projector,A.music,fish_addon,chicken_biryani,mutton_biryani,menu_id,banquet_menu_name as menu_name,hall_cost,projector_cost,music_cost,menu_cost,A.fish_addon_cost,chicken_biryani_cost,mutton_biryani_cost,total_cost,status,comments,nochicken,nomutton FROM `banquet_book` A left join banquet_menu B on banquet_menu_id=menu_id left join banquet on banquet_hall=banquet_id left join members on member_code=member_id  " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				return res.status(200).send({ success: 1, result: result, pageCount: totalpage });
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});

router.route('/banquet_book_add').post(function (req, res) {

	var member_id = req.body.values.member_code;
	var banquet_hall =  req.body.values.banquethall;
	var no_guest =  req.body.values.noguest;
	var book_date  = req.body.values.banquetdate;
	var hours = req.body.values.banquethour;
	var projector = req.body.values.Projector;
	var music = req.body.values.music;
	var menu_id = req.body.values.menuid;
	var fish_addon = req.body.values.fish;
	var chicken_biryani = req.body.values.cbiryani;
	var mutton_biryani = req.body.values.mbiryani;
	var projector_cost = req.body.projector;
	var hall_cost = req.body.totalhallcost;
	var music_cost = req.body.music;
	var menu_cost = req.body.menucost;
	var fish_addon_cost = req.body.fishadd;
	var chicken_biryani_cost = req.body.cbir;
	var mutton_biryani_cost = req.body.mbir;
	var total_cost = req.body.totalcost;

	var menu_item= req.body.selectedmenulist;
	var nochicken="";
	var nomutton="";
	// if(chicken_biryani==true)
	// nochicken=req.body.values.nochicken;
	// if(mutton_biryani==true)
	// nomutton=req.body.values.nomutton;

	var comments=req.body.values.comments;

	var created_by="";
	if(req.body.currentUser.createdby)
	 created_by=req.body.currentUser.createdby;

	var sql = "INSERT INTO banquet_book ( member_id,banquet_hall, no_guest, book_date, hours, projector, music, menu_id, fish_addon, chicken_biryani,mutton_biryani,projector_cost,hall_cost ,music_cost,menu_cost,fish_addon_cost,chicken_biryani_cost,mutton_biryani_cost,total_cost,nochicken,nomutton,comments,created_by) VALUES   ('" + member_id + "', '" + banquet_hall + "','" + no_guest + "', '" + book_date + "', '" + hours + "', '" + projector + "', '" + music + "', '" + menu_id + "', '" + fish_addon + "', '" + chicken_biryani + "', '" + mutton_biryani + "', '" + projector_cost + "', '" + hall_cost + "', '" + music_cost + "', '" + menu_cost + "', '" + fish_addon_cost + "', '" + chicken_biryani_cost + "', '" + mutton_biryani_cost + "','"+total_cost+"','"+nochicken+"','"+nomutton+"','"+comments+"','"+created_by+"');";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record inserted");
		if (result.insertId) {
			for (i = 0; i < menu_item.length; i++) 
			{
				var sql1 = "INSERT INTO banquet_book_course_item (banquet_book_id,banquet_course_id,banquet_item_id,banquet_item_name) VALUES   ('" + result.insertId + "', '" + menu_item[i].cid + "','" + menu_item[i].itemval.item_id + "', '" + menu_item[i].itemval.item_name + "');";
				db.query(sql1, function (err1, result1) {
					if (err) return res.status(401).send({ error: err1.message });
				});

				
			}

			var sqlde = "SELECT mobile_no,first_name,email,DATE_FORMAT(book_date,'%d-%b-%Y %H:%i') as book_date1,member_id from banquet_book A left join members on member_id=member_code where A.id='" + result.insertId + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var mobile_no = resultde[0].mobile_no;
					var first_name = resultde[0].first_name;
					var book_date1 = resultde[0].book_date1;
					var member_id1 = resultde[0].member_id;
					whatsapp_banquet_book(mobile_no,book_date1,result.insertId,member_id1);
				});

		}
		return res.status(200).json({ success: '1' });
	});


});

async function whatsapp_banquet_book(number,bookdate,bookid,member_code){
    const params = {
        "from": {
          "phone_number": "+919966463000"
        },
        "to": [
          {
            "phone_number": "+91"+number
          }
        ],
        "data": {
          "message_template": {
            "storage": "conversation",
            "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
            "template_name": "banquet_confirm",
            "language": {
              "policy": "deterministic",
              "code": "en"
            },
            "rich_template_data": {
              
              "body": {
                "params": [
                  {
                    "data": bookdate
                  }, 
				  {
                    "data": bookid
                  },
                  {
                    "data": "9710933360"
                  },
                  {
                    "data": member_code
                  },
				  {
                    "data": bookid
                  },
                ]
              }
            }
          }
        }
      };
     await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp',params, {
        // Name: 'Fred',
        // Age: '23' 
        headers: {
          'Access-Control-Allow-Origin' : '*',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      }
      })
      .then(function (response) {
        //   console.log(response);
        // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
    
        
      }).catch((err) => 
      {      
        
      });
}
async function whatsapp_banquet_cancel(number,bookdate,bookid,member_code){
    const params = {
        "from": {
          "phone_number": "+919966463000"
        },
        "to": [
          {
            "phone_number": "+91"+number
          }
        ],
        "data": {
          "message_template": {
            "storage": "conversation",
            "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
            "template_name": "banquet_order_cancelled",
            "language": {
              "policy": "deterministic",
              "code": "en"
            },
            "rich_template_data": {
              
              "body": {
                "params": [
                  {
                    "data": bookdate
                  }, 
				  {
                    "data": bookid
                  },
                  {
                    "data": "9710933360"
                  },
                  {
                    "data": member_code
                  },
				  {
                    "data": bookid
                  },
                ]
              }
            }
          }
        }
      };
     await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp',params, {
        // Name: 'Fred',
        // Age: '23' 
        headers: {
          'Access-Control-Allow-Origin' : '*',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      }
      })
      .then(function (response) {
          console.log(response);
        // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
    
        
      }).catch((err) => 
      {      
        
      });
}

router.route('/banquet_book_update_status').post(function (req, res) {
	var ids = req.body.deleteid;


	var sql = "update  banquet_book set status='0'  where id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");

		var sqlde = "SELECT mobile_no,first_name,email,DATE_FORMAT(book_date,'%d-%b-%Y %H:%i') as book_date,member_id from banquet_book A left join members on member_id=member_code where A.id='" + ids + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var mobile_no = resultde[0].mobile_no;
					var first_name = resultde[0].first_name;
					var book_date1 = resultde[0].book_date;
					var member_id = resultde[0].member_id;
					whatsapp_banquet_cancel(mobile_no,book_date1,ids,member_id);
				});
		return res.status(200).json({ success: '1' });
	});



});
router.route('/banquet_book_delete').post(function (req, res) {
	var ids = req.body.deleteid;


	var sql = "delete from  banquet_book  where id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});

router.route('/banquet_add').post(function (req, res) {

	var banquet_name = req.body.banquet_name;
	var capacity = req.body.capacity;
	var cost_4_hrs = req.body.cost_4_hrs;
	var cost_8_hrs = req.body.cost_8_hrs;
	var electricity_4_hrs = req.body.electricity_4_hrs;
	var electricity_8_hrs = req.body.electricity_8_hrs;
	var projector = req.body.projector;
	var valet_per_driver = req.body.valet_per_driver;
	var banquet_status = req.body.banquet_status;

	var sql = "INSERT INTO banquet ( banquet_name,capacity, cost_4_hrs, cost_8_hrs, electricity_4_hrs, electricity_8_hrs, projector, valet_per_driver, banquet_status  ) VALUES   ('" + banquet_name + "', '" + capacity + "','" + cost_4_hrs + "', '" + cost_8_hrs + "', '" + electricity_4_hrs + "', '" + electricity_8_hrs + "', '" + projector + "', '" + valet_per_driver + "', '" + banquet_status + "');";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record inserted");
		return res.status(200).json({ success: '1' });
	});


});


router.route('/banquet_update').post(function (req, res) {

	var set = "";
	if (req.body.banquet_name != "") {
		var banquet_name = req.body.banquet_name;
		if (set == "") { set += " banquet_name ='" + banquet_name + "' " } else { set += ", banquet_name ='" + banquet_name + "' " }
	}

	if (req.body.capacity != "") {
		var capacity = req.body.capacity;
		if (set == "") { set += " capacity ='" + capacity + "' " } else { set += ", capacity ='" + capacity + "' " }
	}
	if (req.body.cost_4_hrs != "") {
		var cost_4_hrs = req.body.cost_4_hrs;
		if (set == "") { set += " cost_4_hrs ='" + cost_4_hrs + "' " } else { set += ", cost_4_hrs ='" + cost_4_hrs + "' " }
	}
	if (req.body.cost_8_hrs != "") {
		var cost_8_hrs = req.body.cost_8_hrs;
		if (set == "") { set += " cost_8_hrs ='" + cost_8_hrs + "' " } else { set += ", cost_8_hrs ='" + cost_8_hrs + "' " }
	}
	if (req.body.electricity_4_hrs != "") {
		var electricity_4_hrs = req.body.electricity_4_hrs;
		if (set == "") { set += " electricity_4_hrs ='" + electricity_4_hrs + "' " } else { set += ", electricity_4_hrs ='" + electricity_4_hrs + "' " }
	}
	if (req.body.electricity_8_hrs != "") {
		var electricity_8_hrs = req.body.electricity_8_hrs;
		if (set == "") { set += " electricity_8_hrs ='" + electricity_8_hrs + "' " } else { set += ", electricity_8_hrs ='" + electricity_8_hrs + "' " }
	}
	if (req.body.projector != "") {
		var projector = req.body.projector;
		if (set == "") { set += " projector ='" + projector + "' " } else { set += ", projector ='" + projector + "' " }
	}
	if (req.body.valet_per_driver != "") {
		var valet_per_driver = req.body.valet_per_driver;
		if (set == "") { set += " valet_per_driver ='" + valet_per_driver + "' " } else { set += ", valet_per_driver ='" + valet_per_driver + "' " }
	}
	if (req.body.banquet_status != "") {
		var banquet_status = req.body.banquet_status;
		if (set == "") { set += " banquet_status ='" + banquet_status + "' " } else { set += ", banquet_status ='" + banquet_status + "' " }
	}
	var id = req.body.banquet_id;
	var sql = " UPDATE banquet SET " + set + " WHERE banquet_id='" + id + "'";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		return res.status(200).json({ success: '1', response: result });
	});


});



router.route('/banquet_delete').post(function (req, res) {
	var ids = req.body.ids;


	var sql = "delete from  banquet  where banquet_id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});


router.route('/banquet_menu_item_get').get(function (req, res) {


	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += "( item_name LIKE '%" + term + "%' OR banquet_menu_name  LIKE '%" + term + "%' OR banquet_menu_course_name  LIKE '%" + term + "%' OR status  LIKE '%" + term + "%' )";
		}
	}
	if (req.query.status) {
		var status = req.query.status;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (status != '') {
			where += " status='" + status + "'";
		}

	}
	if (req.query.pageSize && req.query.pageIndex) {
		if (limit == '') {
			limit += " Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if (pageIndex != '') {
			limit += "  " + (pageIndex * pageSize) + ", " + pageSize + "";;
		}
	}

	if (req.query.sortBy && Array.isArray(req.query.sortBy)) {
		var sortBy = req.query.sortBy;
		var sortByobj = JSON.parse(sortBy)
		// console.log('sortBy', sortByobj.desc);
		if (sort == "") {
			sort += " ORDER BY " + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}

	var sqlTotal = "SELECT COUNT(banquet_menu_item_map_id) as totalcount from banquet_menu_item_map " + where + " " + sort + ";";

	var sql = "SELECT banquet_menu_item_map_id,food_item_id,item_name,A.banquet_menu_id,banquet_menu_name,menu_course_id,banquet_menu_course_name,A.status  FROM `banquet_menu_item_map` A left join rest_menu_item on food_item_id=item_id  left join banquet_menu_course on banquet_menu_course_id=menu_course_id and banquet_menu_course_status='1'  left join banquet_menu B on A.banquet_menu_id=B.banquet_menu_id " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				// console.log('pageSize', pageSize);
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				return res.status(200).send({ success: 1, result: result, pageCount: totalpage });
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});

router.route('/banquet_book_course_get').get(function (req, res) {

	var id = req.query.id;
	// var sql = "SELECT * FROM `banquet_menu_course` where banquet_menu_course_type='B' or banquet_menu_course_type='"+type+"'";
	var sql = "SELECT distinct banquet_menu_course_name,banquet_menu_course_id FROM `banquet_book_course_item`  left join  `banquet_menu_course` on banquet_menu_course_id= banquet_course_id where banquet_book_id='" + id + "' group by banquet_menu_course_id order by banquet_menu_course_name";
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1'"
	// 	SELECT banquet_menu_course_id,banquet_menu_course_name, (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type=banquet_menu_course_id) as items 
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});
router.route('/banquet_book_course_item_get').get(function (req, res) {

	var id = req.query.id;
	// var sql = "SELECT * FROM `banquet_menu_course` where banquet_menu_course_type='B' or banquet_menu_course_type='"+type+"'";
	var sql = "SELECT  banquet_course_id,banquet_menu_course_name, group_concat(banquet_item_name separator ',') as banquet_menu_course_item_name  FROM `banquet_book_course_item` left join  `banquet_menu_course` on banquet_menu_course_id= banquet_course_id where banquet_book_id='" + id + "' group by banquet_course_id";
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1'"
	// 	SELECT banquet_menu_course_id,banquet_menu_course_name, (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type=banquet_menu_course_id) as items 
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/banquet_menu_course_get').get(function (req, res) {

	var type = req.query.type;
	// var sql = "SELECT * FROM `banquet_menu_course` where banquet_menu_course_type='B' or banquet_menu_course_type='"+type+"'";
	var sql = "SELECT banquet_menu_course_id,banquet_menu_course_name,menu_map_column, (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type=banquet_menu_course_id) as order_items,(SELECT GROUP_CONCAT(banquet_menu_course_name) FROM banquet_menu_course WHERE banquet_menu_course_status='1' and (banquet_menu_course_type = 'B' or banquet_menu_course_type='" + type + "')) as item_comma FROM `banquet_menu_course` where banquet_menu_course_status='1' and (banquet_menu_course_type='B' or banquet_menu_course_type='" + type + "')";
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1'"
	// 	SELECT banquet_menu_course_id,banquet_menu_course_name, (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type=banquet_menu_course_id) as items 
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});
router.route('/banquet_menu_selected_course_get').get(function (req, res) {

	var type = req.query.type;
	var menuid = req.query.menuid;
	// var sql = "SELECT * FROM `banquet_menu_course` where banquet_menu_course_type='B' or banquet_menu_course_type='"+type+"'";
	var sql = "SELECT banquet_menu_course_id,banquet_menu_course_name,menu_map_column, (select JSON_ARRAYAGG(JSON_OBJECT('item_id', test.food_item_id, 'item_name', test.food_item_name,'menu_course_id',test.menu_course_id))  from (SELECT food_item_id,menu_course_id,(select item_name from rest_menu_item where item_id=food_item_id)  as food_item_name FROM `banquet_menu_item_map` where banquet_menu_id='" + menuid + "' ) as test) as order_items,(SELECT GROUP_CONCAT(banquet_menu_course_name) FROM banquet_menu_course WHERE banquet_menu_course_status='1' and (banquet_menu_course_type = 'B' or banquet_menu_course_type='" + type + "')) as item_comma FROM `banquet_menu_course` where banquet_menu_course_status='1' and (banquet_menu_course_type='B' or banquet_menu_course_type='" + type + "')";
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1'"
	// 	SELECT banquet_menu_course_id,banquet_menu_course_name, (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type=banquet_menu_course_id) as items 
	//  FROM `banquet_menu_course` where banquet_menu_course_id='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/banquet_menu_course_get_all').get(function (req, res) {

	
	
	var sql = "SELECT banquet_menu_course_id,banquet_menu_course_name FROM `banquet_menu_course` where banquet_menu_course_status='1'";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});
router.route('/banquet_menu_course_item_get').get(function (req, res) {

	var courseid = req.query.courseid;
	var sql = "SELECT * FROM `rest_menu_item` where banquet_type='" + courseid + "'";
	// SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/banquet_menu_map_record').get(function (req, res) {

	var menu_id = req.query.menuid;
	var sql = "SELECT food_item_id FROM `banquet_menu_item_map` where banquet_menu_id='" + menu_id + "'";
	// SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/banquet_menu_get_items').get(function (req, res) {

	
	var sql = "SELECT banquet_menu_id,banquet_menu_name,banquet_menu_desc,banquet_menu_cost,no_veg_dish,no_non_veg_dish,no_bread,no_rice,no_salad,no_curd_pickle,no_icecream,no_fish,fish_addon_cost,banquet_menu_type,(SELECT GROUP_CONCAT(banquet_menu_course_name) FROM banquet_menu_course WHERE banquet_menu_course_status='1' and (banquet_menu_course_type = 'B' or banquet_menu_course_type=banquet_menu_type)) as item_comma FROM `banquet_menu`";
	// SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type='1';
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1");
		return res.send({ success: 1, result: result });
	});


});

router.route('/banquet_menu_map_record_insert_single').get(function (req, res) {

	var menu_id = req.query.menuid;
	var selected = req.query.selected;
	var banquet_menu_course_id = req.query.banquetmenucourseid;
	var isChecked = req.query.isChecked;
	if (isChecked=="1") {

		db.query("select * from banquet_menu_item_map where banquet_menu_id='" + menu_id + "' and menu_course_id='" + banquet_menu_course_id + "' and food_item_id='" + selected + "'", function (err, result) {
			if (err) return res.status(401).send({ error: err.message });
			// console.log("1");
			else {
				if (result && result.length) {
					console.log('Case row was found!');
					// do something with your row variable
				} else {
					console.log('No case row was found :( !');
					var sql = "insert into `banquet_menu_item_map`(food_item_id,banquet_menu_id,menu_course_id,status) values('" + selected + "','" + menu_id + "','" + banquet_menu_course_id + "','1');";

					db.query(sql, function (err, result) {
						if (err) return res.status(401).send({ error: err.message });


					});
				}
			}
		});

	}
	else {
		db.query("delete from banquet_menu_item_map where banquet_menu_id='" + menu_id + "' and menu_course_id='" + banquet_menu_course_id + "' and food_item_id='" + selected + "'", function (err, result) { });
	}
	return res.send({ success: 1 });
});
router.route('/banquet_menu_map_record_insert').get(function (req, res) {

	var menu_id = req.query.menu_id;
	var selected = req.query.selected;
	var banquet_menu_course_id = req.query.banquet_menu_course_id;
	db.query("delete from banquet_menu_item_map where banquet_menu_id='" + menu_id + "' and menu_course_id='" + banquet_menu_course_id + "'", function (err, result) { });
	for (i = 0; i < selected.length; i++) {


		var sql = "insert into `banquet_menu_item_map`(food_item_id,banquet_menu_id,menu_course_id,status) values('" + selected[i] + "','" + menu_id + "','" + banquet_menu_course_id + "','1');";
		// SELECT JSON_ARRAYAGG(JSON_OBJECT('item_id', item_id, 'item_name', item_name)) from rest_menu_item where banquet_type='1';
		db.query(sql, function (err, result) {
			if (err) return res.status(401).send({ error: err.message });
			// console.log("1");

		});

		console.log("Hello World!" + selected[i]);
	}
	return res.send({ success: 1 });
});

router.route('/banquet_menu_get').get(function (req, res) {


	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += "( banquet_menu_name LIKE '%" + term + "%' OR banquet_menu_cost  LIKE '%" + term + "%' OR banquet_menu_status  LIKE '%" + term + "%' )";
		}
	}
	if (req.query.banquet_menu_status) {
		var banquet_menu_status = req.query.banquet_menu_status;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (banquet_menu_status != '') {
			where += " banquet_menu_status='" + banquet_menu_status + "'";
		}

	}
	if (req.query.pageSize && req.query.pageIndex) {
		if (limit == '') {
			limit += " Limit ";
		}
		var pageSize = req.query.pageSize;
		var pageIndex = req.query.pageIndex;
		if (pageIndex != '') {
			limit += "  " + (pageIndex * pageSize) + ", " + pageSize + "";;
		}
	}

	if (req.query.sortBy && Array.isArray(req.query.sortBy)) {
		var sortBy = req.query.sortBy;
		var sortByobj = JSON.parse(sortBy)
		// console.log('sortBy', sortByobj.desc);
		if (sort == "") {
			sort += " ORDER BY " + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}

	var sqlTotal = "SELECT COUNT(banquet_menu_id) as totalcount from banquet_menu " + where + " " + sort + ";";

	var sql = "select * from banquet_menu " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				// console.log('pageSize', pageSize);
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				return res.status(200).send({ success: 1, result: result, pageCount: totalpage });
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});



router.route('/banquet_menu_add').post(function (req, res) {

	var banquet_menu_name = req.body.banquet_menu_name;
	var banquet_menu_cost = req.body.banquet_menu_cost;
	var no_veg_dish = req.body.no_veg_dish;
	var no_non_veg_dish = req.body.no_non_veg_dish;
	var no_bread = req.body.no_bread;
	var no_rice = req.body.no_rice;
	var no_salad = req.body.no_salad;
	var no_curd_pickle = req.body.no_curd_pickle;
	var no_icecream = req.body.no_icecream;
	var no_fish = req.body.no_fish;
	var fish_addon_cost = req.body.fish_addon_cost;
	var banquet_menu_status = req.body.banquet_menu_status;
	var banquet_menu_desc = req.body.banquet_menu_desc;
	var banquet_menu_type = req.body.banquet_menu_type;

	var sql = "INSERT INTO banquet_menu ( banquet_menu_name,banquet_menu_cost, no_veg_dish, no_non_veg_dish, no_bread, no_rice, no_salad, no_curd_pickle, no_icecream, fish_addon_cost, banquet_menu_status,banquet_menu_desc,banquet_menu_type,no_fish  ) VALUES   ('" + banquet_menu_name + "','" + banquet_menu_cost + "', '" + no_veg_dish + "', '" + no_non_veg_dish + "', '" + no_bread + "', '" + no_rice + "', '" + no_salad + "', '" + no_curd_pickle + "', '" + no_icecream + "', '" + fish_addon_cost + "', '" + banquet_menu_status + "', '" + banquet_menu_desc + "', '" + banquet_menu_type + "', '" + no_fish + "');";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record inserted");
		return res.status(200).json({ success: '1' });
	});


});


router.route('/banquet_menu_update').post(function (req, res) {

	var set = "";
	if (req.body.banquet_menu_name != "") {
		var banquet_menu_name = req.body.banquet_menu_name;
		if (set == "") { set += " banquet_menu_name ='" + banquet_menu_name + "' " } else { set += ", banquet_menu_name ='" + banquet_menu_name + "' " }
	}

	if (req.body.banquet_menu_cost != "") {
		var banquet_menu_cost = req.body.banquet_menu_cost;
		if (set == "") { set += " banquet_menu_cost ='" + banquet_menu_cost + "' " } else { set += ", banquet_menu_cost ='" + banquet_menu_cost + "' " }
	}
	if (req.body.no_veg_dish != "") {
		var no_veg_dish = req.body.no_veg_dish;
		if (set == "") { set += " no_veg_dish ='" + no_veg_dish + "' " } else { set += ", no_veg_dish ='" + no_veg_dish + "' " }
	}
	if (req.body.no_non_veg_dish != "") {
		var no_non_veg_dish = req.body.no_non_veg_dish;
		if (set == "") { set += " no_non_veg_dish ='" + no_non_veg_dish + "' " } else { set += ", no_non_veg_dish ='" + no_non_veg_dish + "' " }
	}
	if (req.body.no_bread != "") {
		var no_bread = req.body.no_bread;
		if (set == "") { set += " no_bread ='" + no_bread + "' " } else { set += ", no_bread ='" + no_bread + "' " }
	}
	if (req.body.no_rice != "") {
		var no_rice = req.body.no_rice;
		if (set == "") { set += " no_rice ='" + no_rice + "' " } else { set += ", no_rice ='" + no_rice + "' " }
	}
	if (req.body.no_salad != "") {
		var no_salad = req.body.no_salad;
		if (set == "") { set += " no_salad ='" + no_salad + "' " } else { set += ", no_salad ='" + no_salad + "' " }
	}
	if (req.body.no_curd_pickle != "") {
		var no_curd_pickle = req.body.no_curd_pickle;
		if (set == "") { set += " no_curd_pickle ='" + no_curd_pickle + "' " } else { set += ", no_curd_pickle ='" + no_curd_pickle + "' " }
	}
	if (req.body.no_icecream != "") {
		var no_icecream = req.body.no_icecream;
		if (set == "") { set += " no_icecream ='" + no_icecream + "' " } else { set += ", no_icecream ='" + no_icecream + "' " }
	}
	if (req.body.fish_addon_cost != "") {
		var fish_addon_cost = req.body.fish_addon_cost;
		if (set == "") { set += " fish_addon_cost ='" + fish_addon_cost + "' " } else { set += ", fish_addon_cost ='" + fish_addon_cost + "' " }
	}
	if (req.body.banquet_menu_status != "") {
		var banquet_menu_status = req.body.banquet_menu_status;
		if (set == "") { set += " banquet_menu_status ='" + banquet_menu_status + "' " } else { set += ", banquet_menu_status ='" + banquet_menu_status + "' " }
	}

	

	if (req.body.banquet_menu_desc != "") {
		var banquet_menu_desc = req.body.banquet_menu_desc;
		if (set == "") { set += " banquet_menu_desc ='" + banquet_menu_desc + "' " } else { set += ", banquet_menu_desc ='" + banquet_menu_desc + "' " }
	}

	if (req.body.banquet_menu_type != "") {
		var banquet_menu_type = req.body.banquet_menu_type;
		if (set == "") { set += " banquet_menu_type ='" + banquet_menu_type + "' " } else { set += ", banquet_menu_type ='" + banquet_menu_type + "' " }
	}

	if (req.body.no_fish != "") {
		var no_fish = req.body.no_fish;
		if (set == "") { set += " no_fish ='" + no_fish + "' " } else { set += ", no_fish ='" + no_fish + "' " }
	}

	var id = req.body.banquet_menu_id;
	var sql = " UPDATE banquet_menu SET " + set + " WHERE banquet_menu_id='" + id + "'";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		return res.status(200).json({ success: '1', response: result });
	});


});



router.route('/banquet_menu_delete').post(function (req, res) {
	var ids = req.body.ids;


	var sql = "delete from  banquet_menu  where banquet_menu_id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});

/*
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


if(!req.body.clubPickup && req.body.clubPickup!=1){
var clubPickup = 0;
var delivery_address= req.body.delivery_address;
}else{
	var clubPickup = req.body.clubPickup;
}

if(req.body.clubPickup===1){
	 var pickup_time = req.body.selectedTime;
	var sql = "INSERT INTO rest_order ( member_code,is_club_pickup,pickup_time, order_status,order_time,total_items, final_price, price) VALUES   ('"+member_code+"','"+clubPickup+"', '"+pickup_time+"', '"+order_status+"','"+order_time+"','"+cartTotalQuantity+"','"+cartTotalAmount+"','"+cartTotalAmount+"');";
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

	return res.status(200).json({ success: '1' });

  }else{
	 return res.status(401).json({ success: '0', error:'Unbale to Add' });
  }

});
}


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

*/
module.exports = router;
