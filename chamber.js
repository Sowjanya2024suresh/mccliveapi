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


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/chamber/')
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
function convert(str) {
	var date = new Date(str),
		mnth = ("0" + (date.getMonth() + 1)).slice(-2),
		day = ("0" + date.getDate()).slice(-2);
	hours = ("0" + date.getHours()).slice(-2);
	minutes = ("0" + date.getMinutes()).slice(-2);
	seconds = ("0" + date.getSeconds()).slice(-2);
	// return [ date.getFullYear(), mnth, day, hours, minutes ].join("-");
	return [date.getFullYear(), mnth, day].join("-") + " " + [hours, minutes, seconds].join(":");
}
	


router.route('/chamber_get').get(function (req, res) {


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
			where += "( member_id LIKE '%" + term + "%' OR member_name  LIKE '%" + term + "%' OR guest_name  LIKE '%" + term + "%' OR club_name  LIKE '%" + term + "%' )";
		}
	}

	if(req.query.id)
	{
		var chamber_book_id = req.query.id;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (req.query.id != '') {
			where += " chamber_book_id='" + chamber_book_id + "'";
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

	var sqlTotal = "SELECT COUNT(chamber_book_id) as totalcount from chamber_book " + where + " " + sort + ";";

	var sql = "select  chamber_book_id,member_id,member_name, email, phone, no_room, no_occupancy, guest_name, nationality, DATE_FORMAT(check_in_date,'%d-%b-%Y %H:%i') as check_in_date,DATE_FORMAT(check_out_date,'%d-%b-%Y %H:%i') as check_out_date, no_days,type,status,flag,id_proof, (select club_name from Affiliate_club B where A.club_name=B.id) as club_name,verify_status from chamber_book A " + where + " " + sort + " " + limit + " ;";
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




router.route('/chamber_book_add').post(upload.fields([{
	name: 'idprooffile', maxCount: 1
}]), function (req, res) {

	var member_id = req.body.member_id;
	var member_name =  req.body.member_name;
	var email =  req.body.email;
	var phone  = req.body.phone;
	var no_room = req.body.no_room;
	var no_occupancy = req.body.no_occupancy;
	var guest_name = req.body.guest_name;
	var nationality = req.body.nationality;
	var check_in_date = convert(req.body.checkindate);
	var check_out_date = convert(req.body.checkoutdate);
	var no_days = req.body.no_days;
	var type = req.body.type;
	var club_name = req.body.club_name;
	var status = '1';
	var flag = '1';

	// var created_by=req.body.created_by;
	var created_by="";
	if(req.body.created_by)
	 created_by=req.body.created_by;
	

	var sql = "INSERT INTO chamber_book ( member_id,member_name, email, phone, no_room, no_occupancy, guest_name, nationality, check_in_date,check_out_date, no_days,type,club_name,status,flag,created_by) VALUES       ('" + member_id + "', '" + member_name + "','" + email + "', '" + phone + "', '" + no_room + "',      '" + no_occupancy + "', '" + guest_name + "', '" + nationality + "', '" + check_in_date + "', '" + check_out_date + "',       '" + no_days + "', '" + type + "', '" + club_name + "', '" + status + "', '" + flag + "', '" + created_by + "');";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record inserted");
		if (result.insertId) {
            var lastid = result.insertId;
			if (req.files.idprooffile) {
				var id_proof_file = req.files.idprooffile[0].filename;
				var sql1 = "UPDATE chamber_book SET id_proof='" + id_proof_file + "' WHERE chamber_book_id='" + lastid + "'"
				db.query(sql1, function (err1, result1) {
					if (err1) return res.status(401).send({ error: err1.message });


					if(type=="Affiliate")
					{
						var sqlde = "SELECT A.club_name as club_id,B.club_name as club_name,B.email,B.phone FROM `chamber_book` A left join Affiliate_club B on A.club_name=B.id WHERE chamber_book_id='" + lastid + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var club_id = resultde[0].club_id;
					var club_name = resultde[0].club_name;
					var email = resultde[0].email;
					var phone = resultde[0].phone;
					sendlinktoverify(lastid,club_name,"sowjanya@lokas.in",member_id,member_name);
				});
						
					}
				});
			}
        }
		return res.status(200).json({ success: '1' });
	});


});

async function whatsapp_chamber_book(number,bookdate,bookid,member_code){
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
async function whatsapp_chamber_cancel(number,bookdate,bookid,member_code){
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

function sendlinktoverify(bookid,name,email,member_id,member_name) {
	var approvelink="https://webapistaging.madrascricketclub.org/chamber/verifymember?id="+bookid;
	var cancellink="https://webapistaging.madrascricketclub.org/chamber/cancelmember?id="+bookid;
	var transporter = nodemailer.createTransport({
		pool: true,
		host: "madrascricketclub.org",
		port: 465,
		secure: true, // use TLS
		auth: {
			// user: "social@madrascricketclub.org",
			// pass: "m%b9mL082",
			user: "chambers@madrascricketclub.org",
			pass: "8z*8Os04o",
		},
	});
	mailOptions = {
		from: 'chambers@madrascricketclub.org',
		to: email,
		subject: 'Verify the member...!',
		cc: 'contact.raghav@gmail.com',
		// text: 'Your password is ',
		// html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
		// html: "https://webapistaging.madrascricketclub.org/chamber/verifymember?id="+bookid
		html:'<table><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td></tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;"><br><br>Dear Sir / Madam,</td> </tr> <tr> <td style="height: 20px;"></td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;"><strong>Member Name:</strong> '+member_name+' </td> </tr> <tr> <td style="height: 5px;"></td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;"><strong>Member ID: </strong> '+member_id+'</td> </tr> <tr> <td style="height: 20px;"></td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;">This Member from your Club has requested for accommodation at The Chambers in Madras Cricket Club (MCC), Chennai.</td> </tr> <tr> <td style="height: 5px;"></td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;">We request that this Member information be validated, and the Room booking authorised, by selecting the "Approve" button below.</td> </tr> <tr> <td style="height: 20px;"></td> </tr> <tr> <td><a href="'+cancellink+'" style="padding: 8px 25px;background: #D4403A !important;font-size: 16px;color: #ffffff !important;text-decoration: none;text-align: center;border-radius: 10px;font-family: Arimo, sans-serif;" target="">Cancel</a> <a href="'+approvelink+'" style="padding: 8px 25px;background: #3A833A !important;font-size: 16px;color: #ffffff !important;text-decoration: none;text-align: center;border-radius: 10px;font-family: Arimo, sans-serif;" target="">Approve</a> </td> <td></td> </tr> <tr> <td style="height: 25px;"></td> </tr> <tr> <td style="font-size: 18px;font-family: Arimo, sans-serif;"><strong>Contact Us:</strong></td> </tr> <tr> <td style="height: 10px;"></td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;line-height: 24px;">Address: Madras Cricket Club,<br /> #1 Bells Road, Chepauk, Chennai - 600005.</td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;">Phone: 044 - 28523976</td> </tr> <tr> <td style="font-size: 16px;font-family: Arimo, sans-serif;">Email: contact@madrascricketclub.org</td> </tr> </table>'

	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}
router.route('/verifymember').get(function (req, res) {
	var ids = req.query.id;


	var sql = "update  chamber_book set verify_status=1  where chamber_book_id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");

		var sqlde = "SELECT phone,member_name,email,DATE_FORMAT(book_date,'%d-%b-%Y %H:%i') as book_date,member_id from chamber_book A where A.chamber_book_id='" + ids + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var phone = resultde[0].phone;
					var member_name = resultde[0].member_name;
					var book_date1 = resultde[0].book_date;
					var member_id = resultde[0].member_id;
					// whatsapp_chamber_book(phone,book_date1,ids,member_id);
				});
		// return res.status(200).json({ Status: 'Approved' });
		return res.send('<html> <head> <script> function close_window() { if (confirm("Close Window?")) { window.close(); } }</script> </head> <body> <div style="align-items:center;"> <table> <tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"> <p class="MsoNormal"> <span style="color:black"> <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p> </td> </tr> <tr> <td> <br> <h2>Thanks for your Response</h2> </td> </tr> <tr> <td><a href="javascript:close_window();" style="padding: 8px 25px;background: #D4403A !important;font-size: 16px;color: #ffffff !important;text-decoration: none;text-align: center;border-radius: 10px;font-family: Arimo, sans-serif;" target="">Close</a> </td> </tr> <table> </div> </body> </html>');
	});



});

router.route('/cancelmember').get(function (req, res) {
	var ids = req.query.id;


	var sql = "update  chamber_book set verify_status=2  where chamber_book_id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");

		var sqlde = "SELECT phone,member_name,email,DATE_FORMAT(book_date,'%d-%b-%Y %H:%i') as book_date,member_id from chamber_book A where A.chamber_book_id='" + ids + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var phone = resultde[0].phone;
					var member_name = resultde[0].member_name;
					var book_date1 = resultde[0].book_date;
					var member_id = resultde[0].member_id;
					// whatsapp_chamber_book(phone,book_date1,ids,member_id);
				});
		// return res.status(200).json({ Status: 'Cancelled' });
		return res.send('<html> <head> <script> function close_window() { if (confirm("Close Window?")) { window.close(); } }</script> </head> <body> <div style="align-items:center;"> <table> <tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"> <p class="MsoNormal"> <span style="color:black"> <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p> </td> </tr> <tr> <td> <br> <h2>Thanks for your Response</h2> </td> </tr> <tr> <td><a href="javascript:close_window();" style="padding: 8px 25px;background: #D4403A !important;font-size: 16px;color: #ffffff !important;text-decoration: none;text-align: center;border-radius: 10px;font-family: Arimo, sans-serif;" target="">Close</a> </td> </tr> <table> </div> </body> </html>');
	});



});

router.route('/chamber_book_update_status').post(function (req, res) {
	var ids = req.body.id;
	var status=req.body.status;


	var sql = "update  chamber_book set status='"+status+"'  where chamber_book_id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");

		var sqlde = "SELECT phone,member_name,email,DATE_FORMAT(book_date,'%d-%b-%Y %H:%i') as book_date,member_id from chamber_book A where A.chamber_book_id='" + ids + "'";
				db.query(sqlde, function (err, resultde) {
					if (err) return res.status(401).send({ error: err.message });
					var phone = resultde[0].phone;
					var member_name = resultde[0].member_name;
					var book_date1 = resultde[0].book_date;
					var member_id = resultde[0].member_id;
					// whatsapp_banquet_cancel(phone,book_date1,ids,member_id);
				});
		return res.status(200).json({ success: '1' });
	});



});
router.route('/chamber_book_delete').post(function (req, res) {
	var ids = req.body.deleteid;


	var sql = "delete from  chamber_book  where chamber_book_id IN ("+ids+")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message, sql: sql });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});

router.route('/get_affiliate_club').get(function (req, res) {
	
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


module.exports = router;
