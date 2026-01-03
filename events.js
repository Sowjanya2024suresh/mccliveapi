const router = require('express').Router();
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto')
var db = require('./db');
var nodemailer = require('nodemailer');
const https = require('node:https');
const token = 'eyJraWQiOiJjdXN0b20tb2F1dGgta2V5aWQiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmcmVzaGNoYXQiLCJzdWIiOiI1MTkzYzRkOS00M2ExLTQ4NjUtOTM4Ny1mMzhkNmQxNjQ2OTIiLCJjbGllbnRJZCI6ImZjLWFmMDc5ZTBlLWQ5OTUtNGNhZS05NDdhLWRmNGRmZjliZjMyMSIsInNjb3BlIjoiYWdlbnQ6cmVhZCBhZ2VudDpjcmVhdGUgYWdlbnQ6dXBkYXRlIGFnZW50OmRlbGV0ZSBjb252ZXJzYXRpb246Y3JlYXRlIGNvbnZlcnNhdGlvbjpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgbWVzc2FnZTpnZXQgYmlsbGluZzp1cGRhdGUgcmVwb3J0czpmZXRjaCByZXBvcnRzOmV4dHJhY3QgcmVwb3J0czpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIGFjY291bnQ6cmVhZCBkYXNoYm9hcmQ6cmVhZCB1c2VyOnJlYWQgdXNlcjpjcmVhdGUgdXNlcjp1cGRhdGUgdXNlcjpkZWxldGUgb3V0Ym91bmRtZXNzYWdlOnNlbmQgb3V0Ym91bmRtZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6bWVzc2FnZTpzZW5kIG1lc3NhZ2luZy1jaGFubmVsczptZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6dGVtcGxhdGU6Y3JlYXRlIG1lc3NhZ2luZy1jaGFubmVsczp0ZW1wbGF0ZTpnZXQgZmlsdGVyaW5ib3g6cmVhZCBmaWx0ZXJpbmJveDpjb3VudDpyZWFkIHJvbGU6cmVhZCBpbWFnZTp1cGxvYWQiLCJpc3MiOiJmcmVzaGNoYXQiLCJ0eXAiOiJCZWFyZXIiLCJleHAiOjE5NzY0NjE5MjIsImlhdCI6MTY2MDg0MjcyMiwianRpIjoiOTAyZjE2ZTUtMzM5Yy00OWEzLTg5ZmYtYTk4MzZjZDgyMDNlIn0.yJ1lkKoouewZF_ONSYInPQNL2iyzZUnAQ3cC1jQWS5c';
const axios = require('axios');
// get all events with pagination
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/eventsimg/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	},
	/* filename: (req, file, cb) => {
	  cb(null, file.originalname)
	}, */
})
function getMonthFromString(mon) {

	var d = Date.parse(mon + "1, 2012");
	if (!isNaN(d)) {
		return new Date(d).getMonth() + 1;
	}
	return -1;
}
const upload = multer({ storage: storage });

router.route('/get_events').get(function (req, res) {
	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.selectedCatId) {
		var selectedCatId = req.query.selectedCatId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (selectedCatId != '') {
			where += " event_category = '" + selectedCatId + "' ";
		}
	}

	if (req.query.monthSelected) {
		var monthSelected = req.query.monthSelected;
		var arr = monthSelected.split("-");
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (monthSelected != '') {
			where += " YEAR(event_date_from) = '" + arr[1].trim() + "' AND MONTH(event_date_from) = '" + getMonthFromString(arr[0].trim()) + "' ";
		}
	}
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += " event_name LIKE '%" + term + "%' OR event_description  LIKE '%" + term + "%' OR event_date_from  LIKE '%" + term + "%' OR event_date_to  LIKE '%" + term + "%' OR event_status  LIKE '%" + term + "%' OR venue  LIKE '%" + term + "%'";
		}
	}
	if (req.query.currentCat) {
		var currentCat = req.query.currentCat;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (currentCat != '') {
			where += " event_category='" + currentCat + "'";
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
			sort += "ORDER BY events." + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}
	var sqlTotal = "SELECT COUNT(id) as totalcount from events " + where + " " + sort + ";";
	// var sql="select  id, event_name,event_image,event_description,is_guest_allowed,total_guest_tickets,ticket_price_per_guest, ticket_per_member, is_dependent_allowed, is_member_charged, food_served, buffet_total, buffet_vprice, buffet_nvprice,is_dependent_charged, price_for_dependent, price_for_member, tournament_type, invitation_attachment, DATE_FORMAT(event_date_from,'%Y-%m-%d %H:%i:%s') AS event_date_from, DATE_FORMAT(event_date_to,'%Y-%m-%d %H:%i:%s') AS event_date_to,  event_status,venue,event_category,image1, image2, image3, image4,image5,image6 from events "+where+" "+sort+"  "+limit+" ;";
	var sql = "select  events.id, event_name,event_image,event_description,is_guest_allowed,total_guest_tickets,ticket_price_per_guest, ticket_per_member, is_dependent_allowed, is_member_charged, food_served, buffet_total, buffet_vprice, buffet_nvprice,is_dependent_charged, price_for_dependent, price_for_member, tournament_type, invitation_attachment, DATE_FORMAT(event_date_from,'%Y-%m-%d %H:%i:%s') AS event_date_from, DATE_FORMAT(event_date_to,'%Y-%m-%d %H:%i:%s') AS event_date_to,  event_status,venue,event_category,image1, image2, image3, image4,image5,image6, SUM(`totaldependents`) as totaldependents,SUM(`totalbuffet`) as totalbuffet, SUM(`totalguest`) as totalguest,highdesc,gvideopath,table_book_available,is_seat_book_open,seat_2,seat_4,seat_6,seat_8,table_book_detail  from events   Left JOIN event_rsvp ON event_rsvp.event_id = events.id LEFT JOIN event_rsvp_entertainment ON event_rsvp_entertainment.rsvp_id=event_rsvp.rsvp_id  " + where + " GROUP BY events.id " + sort + "   " + limit + " ;";
	// exit;
	// console.log('sql', sql);
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (err, sqlTotalResult) {
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


router.route('/get_lastoneyear_events').get(function (req, res) {

	var condition = "";

	if (req.query.msgtemp) {

		condition = "where event_status='" + req.query.msgtemp.trim() + "'";
		// if(req.query.event_status==2)
		// condition="where event_status=2";
		// else
		// condition="where event_status < 2"
	}

	var sql = "SELECT id,CONCAT(event_name, ' - ', DATE_FORMAT(event_date_from,'%M %Y')) as event_name,event_date_from,YEAR(event_date_from),month(event_date_from),DATE_FORMAT(event_date_from,'%M %Y') FROM `events` " + condition + " order by event_date_from desc";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {

			return res.status(200).send({ success: 1, result: result });

		} else {
			return res.status(200).send({ success: 0, result: [] });
		}
	});
});
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

router.route('/create_event').post(upload.fields([{
	name: 'invitation_attachment_file', maxCount: 1
}, {
	name: 'file', maxCount: 1
}, {
	name: 'image1_file', maxCount: 1
}, {
	name: 'image2_file', maxCount: 1
}, {
	name: 'image3_file', maxCount: 1
}, {
	name: 'image4_file', maxCount: 1
}, {
	name: 'image5_file', maxCount: 1
}, {
	name: 'image6_file', maxCount: 1
}]), function (req, res) {
	// console.log('request', req.body);
	// console.log("Request file ---", req.files.file[0].filename);

	var event_name = req.body.event_name;
	var event_category = req.body.event_category;
	var event_date_from1 = req.body.event_date_from;
	var event_date_from = convert(event_date_from1);
	//var event_date_from2 = new Date(event_date_from1).toISOString();
	//var event_date_from = event_date_from2.slice(0, 19).replace('T', ' ');
	// console.log('event_date_from', event_date_from);
	var event_date_to1 = req.body.event_date_to;
	var event_date_to = convert(event_date_to1);
	//var event_date_to2 = new Date(event_date_to1).toISOString();
	//var event_date_to = event_date_to2.slice(0, 19).replace('T', ' ');
	var event_description = req.body.event_description;
	var is_guest_allowed = req.body.is_guest_allowed;
	var is_dependent_allowed = req.body.is_dependent_allowed;
	var is_member_charged = req.body.is_member_charged;
	var food_served = req.body.food_served;
	var buffet_total = req.body.buffet_total;
	var buffet_vprice = req.body.buffet_vprice;
	var buffet_nvprice = req.body.buffet_nvprice;
	var is_dependent_charged = req.body.is_dependent_charged;
	var price_for_dependent = req.body.price_for_dependent;
	var price_for_member = req.body.price_for_member;
	var tournament_type = req.body.tournament_type;
	var venue = req.body.venue;
	// var filename = req.file.filename;
	var event_status = req.body.event_status;
	var total_guest_tickets = req.body.total_guest_tickets;
	var ticket_price_per_guest = req.body.ticket_price_per_guest;
	var ticket_per_member = req.body.ticket_per_member;
	var parentCat = req.body.parentCat;
	var table_book_available = req.body.table_book_available;
	var is_seat_book_open = req.body.is_seat_book_open;
	var seat_2 = req.body.seat_2;
	var seat_4 = req.body.seat_4;
	var seat_6 = req.body.seat_6;
	var seat_8 = req.body.seat_8;

	if(is_guest_allowed=="N")
	{
		total_guest_tickets='0';
		ticket_price_per_guest='0';
		ticket_per_member='0';


	}
	if(is_dependent_charged=="N")
	{
		price_for_dependent='0';
	}

	if(is_member_charged=="N")
	{
		price_for_member='0';
	}

	if(food_served=="N")
	{
		buffet_vprice='0';
		buffet_nvprice='0';
		buffet_total='0'
	}

	if (parentCat == 2) {
		var sql = " INSERT INTO events (event_name, event_category, event_description, venue, event_status, event_date_from, event_date_to, is_guest_allowed, is_dependent_allowed, is_member_charged, food_served, buffet_total, buffet_vprice, buffet_nvprice, is_dependent_charged, price_for_dependent, price_for_member,table_book_available,is_seat_book_open,seat_2,seat_4,seat_6,seat_8  ) VALUES ('" + event_name + "','" + event_category + "','" + event_description + "','" + venue + "','" + event_status + "','" + event_date_from + "','" + event_date_to + "','" + is_guest_allowed + "','" + is_dependent_allowed + "','" + is_member_charged + "','" + food_served + "','" + buffet_total + "','" + buffet_vprice + "','" + buffet_nvprice + "','" + is_dependent_charged + "','" + price_for_dependent + "','" + price_for_member + "','" + table_book_available + "','" + is_seat_book_open + "','" + seat_2 + "','" + seat_4 + "','" + seat_6 + "','" + seat_8 + "')";
	} else {
		var sql = " INSERT INTO events (event_name, event_category, event_description, venue, event_status, event_date_from, event_date_to, tournament_type,table_book_available,is_seat_book_open,seat_2,seat_4,seat_6,seat_8) VALUES ('" + event_name + "','" + event_category + "','" + event_description + "','" + venue + "','" + event_status + "','" + event_date_from + "','" + event_date_to + "','" + tournament_type + "','','','','','','')";
	}
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log('insertId', result.insertId);
		if (result.insertId) {
			var lastid = result.insertId;
			if (req.files.file) {
				var event_image = req.files.file[0].filename;
				var sql1 = "UPDATE events SET event_image='" + event_image + "' WHERE id='" + lastid + "'"
				db.query(sql1, function (err1, result1) {
					if (err1) return res.status(401).send({ error: err1.message });


				});
			}
			if (req.files.invitation_attachment_file) {
				var invitation_attachment_file = req.files.invitation_attachment_file[0].filename;
				var sql2 = "UPDATE events SET invitation_attachment='" + invitation_attachment_file + "' WHERE id='" + lastid + "'"
				db.query(sql2, function (err2, result2) {
					if (err2) return res.status(401).send({ error: err2.message });
				});
			}
			if (is_guest_allowed == 'Y') {
				var sql3 = "UPDATE events SET total_guest_tickets='" + total_guest_tickets + "', ticket_price_per_guest='" + ticket_price_per_guest + "', ticket_per_member='" + ticket_per_member + "' WHERE id='" + lastid + "'"
				db.query(sql3, function (err3, result3) {
					if (err3) return res.status(401).send({ error: err3.message });
				});
			}
			if (event_status == '2') {
				if (req.files.image1_file) {
					var image1_file = req.files.image1_file[0].filename;
					var sql4 = "UPDATE events SET image1='" + image1_file + "' WHERE id='" + lastid + "'"
					db.query(sql4, function (err4, result4) {
						if (err4) return res.status(401).send({ error: err4.message });
					});
				}
				if (req.files.image2_file) {
					var image2_file = req.files.image2_file[0].filename;
					var sql5 = "UPDATE events SET image2='" + image2_file + "' WHERE id='" + lastid + "'"
					db.query(sql5, function (err5, result5) {
						if (err5) return res.status(401).send({ error: err5.message });
					});
				}
				if (req.files.image3_file) {
					var image3_file = req.files.image3_file[0].filename;
					var sql6 = "UPDATE events SET image3='" + image3_file + "' WHERE id='" + lastid + "'"
					db.query(sql6, function (err6, result6) {
						if (err6) return res.status(401).send({ error: err6.message });
					});
				}
				if (req.files.image4_file) {
					var image4_file = req.files.image4_file[0].filename;
					var sql7 = "UPDATE events SET image4='" + image4_file + "' WHERE id='" + lastid + "'"
					db.query(sql7, function (err7, result7) {
						if (err7) return res.status(401).send({ error: err7.message });
					});
				}

				if (req.files.image5_file) {
					var image5_file = req.files.image5_file[0].filename;
					var sql75 = "UPDATE events SET image5='" + image5_file + "' WHERE id='" + lastid + "'"
					db.query(sql75, function (err75, result75) {
						if (err75) return res.status(401).send({ error: err75.message });
					});
				}

				if (req.files.image6_file) {
					var image6_file = req.files.image6_file[0].filename;
					var sql76 = "UPDATE events SET image6='" + image6_file + "' WHERE id='" + lastid + "'"
					db.query(sql76, function (err76, result76) {
						if (err76) return res.status(401).send({ error: err76.message });
					});
				}


				if (req.body.gvideopath) {

					var sql8 = "UPDATE events SET gvideopath='" + req.body.gvideopath + "' WHERE id='" + lastid + "'"
					db.query(sql8, function (err8, result8) {
						if (err8) return res.status(401).send({ error: err8.message });
					});
				}


				if (req.body.highdesc) {

					var sql9 = "UPDATE events SET highdesc='" + req.body.highdesc + "' WHERE id='" + lastid + "'"
					db.query(sql9, function (err9, result9) {
						if (err9) return res.status(401).send({ error: err9.message });
					});
				}
			}
			return res.status(200).json({ success: '1' });
		} else {
			return res.status(401).json({ success: '0', error: 'Unbale to Add' });
		}
	});
});


router.route('/sendemailtomember').post(function (req, res) {
	
	
var member_code=req.body.member_code;
var event_id=req.body.event_id;
var bookid=req.body.bookid;
var parentCat=req.body.parentCat;
event_sendemail(event_id, bookid, member_code,parentCat);
return res.status(200).send({ success: 1 });


});
router.route('/sendbookedetail').get( function (req, res) {


	// var path1 = "https://webapi.madrascricketclub.org/eventsimg/";
	// var sql = "SELECT * FROM `events` where id='31' ";
	// db.query(sql, function (err, result) {

	// 	var event_image = result[0].event_image;
	// 	const data = JSON.stringify({
	// 		'number': "9841200531",
	// 		'name': "Bar Night",
	// 		'member_code': "RL01",
	// 		'message': " ",
	// 		'imageurl': path1 + event_image,
	// 		'bookid': "36",
	// 	})
	// 	event_sendwhatsapp("31", "36", "Bar Night", "RL01", " ", "/dev/event/confirm");
	// 	event_sendemail("31", "36", "RL01","2");
	// 	setTimeout(() => {
	// 		return res.status(200).send({ success: 1 });
	// 	  }, 1000);
	// });

	
	var member_code=req.query.member_code;
	var event_id=req.query.event_id;
	var bookid=req.query.bookid;
	var event_name=req.query.event_name;
	var parentCat=req.query.parentCat;
	
	  event_sendemail(event_id, bookid, member_code,parentCat);
     event_sendwhatsapp(event_id,bookid,event_name,member_code, " ", "/dev/event/confirm");
	 setTimeout(() => {
	 return res.status(200).send({ success: 1,event_id:event_id,bookid:bookid,event_name: event_name,member_code:member_code,parentCat:parentCat });
	}, 1000);


 	// setTimeout(() => {
	// 			return res.status(200).send({ success: 1 });
	// 		  }, 1000);


});

 function event_sendemail(event_id, bookid, member_code,parentCat) {


	var sql = "SELECT event_name,venue,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y %H:%i') as event_date,mobile_no,email,first_name FROM `events` e left join members m on member_code='" + member_code + "' where e.id='" + event_id + "' ";
	 db.query(sql, function (err, result) {

		var event_name = result[0].event_name;
		var event_image = result[0].event_image;
		var event_date = result[0].event_date;
		var number = result[0].mobile_no;
		var email = result[0].email;
		var member_name = result[0].first_name;
		var venue = result[0].venue;



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
		var ccemail='events@madrascricketclub.org';
		if(parentCat=='1')
		ccemail='sports@madrascricketclub.org';
		
		mailOptions = {
			from: 'social@madrascricketclub.org',
			to: email,
			cc: ccemail,
			subject: 'MCC - Event Booking Info - '+event_name,
			// text: 'Your password is ',
			// html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
			html: '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear ' + member_name + '&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><b>Event Booking Information : </b></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">' + member_code + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Booking Id: <span style="color:red">' + bookid + '</span></p></td></tr>' +
				'<tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Name: <span style="color:red">' + event_name + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Date: <span style="color:red">' + event_date + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Venue: <span style="color:red">' + venue + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table>'

		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

	});
}



function event_sendwhatsapp(event_id, bookid, name, member_code, message, whattype) {


	var path1 = "https://webapi.madrascricketclub.org/eventsimg/";

	// var sql = "SELECT * FROM `events` where id='" + event_id + "' ";
	var sql = "SELECT event_name,event_image,mobile_no FROM `events` e left join members m on member_code='" + member_code + "' where e.id='" + event_id + "' ";
	db.query(sql, function (err, result) {
		var event_name = result[0].event_name;
		var event_image = result[0].event_image;
		var number = result[0].mobile_no;
		// number="9841200531";
		const data = JSON.stringify({
			'number': number,
			'name': event_name,
			'member_code': member_code,
			'message': message,
			'imageurl': path1 + event_image,
			'bookid': bookid,
		})

		const options = {
			hostname: '7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com',
			port: 443,
			//   path: '/dev/broadcast-whatsapp',
			path: whattype,
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

	});

}

router.route('/delete_event').post(function (req, res) {
	var ids = req.body.ids;


	var sql = "delete from  events  where id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});

router.route('/update_event').post(upload.fields([{
	name: 'invitation_attachment_file', maxCount: 1
}, {
	name: 'file', maxCount: 1
}, {
	name: 'image1_file', maxCount: 1
}, {
	name: 'image2_file', maxCount: 1
}, {
	name: 'image3_file', maxCount: 1
}, {
	name: 'image4_file', maxCount: 1
}, {
	name: 'image5_file', maxCount: 1
}, {
	name: 'image6_file', maxCount: 1
}]), function (req, res) {
	var parentCat = req.body.parentCat;

	var set = "";
	if (req.body.event_name != "") {
		var event_name = req.body.event_name;
		if (set == "") { set += " event_name ='" + event_name + "' " } else { set += ", event_name ='" + event_name + "' " }
	}

	if (req.body.event_category != "") {
		var event_category = req.body.event_category;
		if (set == "") { set += " event_category ='" + event_category + "' " } else { set += ", event_category ='" + event_category + "' " }
	}

	if (req.body.event_date_from != "") {
		var event_date_from1 = req.body.event_date_from;
		var event_date_from = convert(event_date_from1);
		//var event_date_from2 = new Date(event_date_from1).toISOString();
		//var event_date_from = event_date_from2.slice(0, 19).replace('T', ' ');
		if (set == "") { set += " event_date_from ='" + event_date_from + "' " } else { set += ", event_date_from ='" + event_date_from + "' " }
	}


	if (req.body.event_date_to != "") {
		var event_date_to1 = req.body.event_date_to;
		var event_date_to = convert(event_date_to1);
		//var event_date_to2 = new Date(event_date_to1).toISOString();
		//var event_date_to = event_date_to2.slice(0, 19).replace('T', ' ');
		if (set == "") { set += " event_date_to ='" + event_date_to + "' " } else { set += ", event_date_to ='" + event_date_to + "' " }
	}

	if (req.body.event_description != "") {
		var event_description = req.body.event_description;
		if (set == "") { set += " event_description ='" + event_description + "' " } else { set += ", event_description ='" + event_description + "' " }
	}

	if (req.body.is_guest_allowed != "") {
		var is_guest_allowed = req.body.is_guest_allowed;
		if (set == "") { set += " is_guest_allowed ='" + is_guest_allowed + "' " } else { set += ", is_guest_allowed ='" + is_guest_allowed + "' " }
	}

	if (req.body.venue != "") {
		var venue = req.body.venue;
		if (set == "") { set += " venue ='" + venue + "' " } else { set += ", venue ='" + venue + "' " }
	}

	if (req.body.event_status != "") {
		var event_status = req.body.event_status;
		if (set == "") { set += " event_status ='" + event_status + "' " } else { set += ", event_status ='" + event_status + "' " }
	}
	if (parentCat == 2) {
		if (req.body.is_guest_allowed != "" && req.body.is_guest_allowed == "Y") {
			if (req.body.total_guest_tickets != "") {
				var total_guest_tickets = req.body.total_guest_tickets;
				if (set == "") { set += " total_guest_tickets ='" + total_guest_tickets + "' " } else { set += ", total_guest_tickets ='" + total_guest_tickets + "' " }
			}

			if (req.body.ticket_price_per_guest != "") {
				var ticket_price_per_guest = req.body.ticket_price_per_guest;
				if (set == "") { set += " ticket_price_per_guest ='" + ticket_price_per_guest + "' " } else { set += ", ticket_price_per_guest ='" + ticket_price_per_guest + "' " }
			}

			if (req.body.ticket_per_member != "") {
				var ticket_per_member = req.body.ticket_per_member;
				if (set == "") { set += " ticket_per_member ='" + ticket_per_member + "' " } else { set += ", ticket_per_member ='" + ticket_per_member + "' " }
			}
		} else {
			if (set == "") { set += " ticket_per_member ='0', ticket_price_per_guest='0',  total_guest_tickets='0' " } else { set += ", ticket_per_member ='0', ticket_price_per_guest='0',  total_guest_tickets='0' " }
		}
		if (req.body.is_dependent_allowed != "") {
			var is_dependent_allowed = req.body.is_dependent_allowed;
			if (set == "") { set += " is_dependent_allowed ='" + is_dependent_allowed + "' " } else { set += ", is_dependent_allowed ='" + is_dependent_allowed + "' " }
		}
		if (req.body.is_member_charged != "") {
			var is_member_charged = req.body.is_member_charged;
			if (set == "") { set += " is_member_charged ='" + is_member_charged + "' " } else { set += ", is_member_charged ='" + is_member_charged + "' " }
		}
		if (req.body.is_member_charged != "" && req.body.is_member_charged == "Y") {
			if (req.body.price_for_member != "") {
				var price_for_member = req.body.price_for_member;
				if (set == "") { set += " price_for_member ='" + price_for_member + "' " } else { set += ", price_for_member ='" + price_for_member + "' " }
			}
		} else {
			if (set == "") { set += " price_for_member ='0' " } else { set += ", price_for_member ='0' " }
		}
		if (req.body.food_served != "") {
			var food_served = req.body.food_served;
			if (set == "") { set += " food_served ='" + food_served + "' " } else { set += ", food_served ='" + food_served + "' " }
		}
		if (req.body.food_served != "" && req.body.food_served == "Y") {
			if (req.body.buffet_total != "") {
				var buffet_total = req.body.buffet_total;
				if (set == "") { set += " buffet_total ='" + buffet_total + "' " } else { set += ", buffet_total ='" + buffet_total + "' " }
			}
			if (req.body.buffet_vprice != "") {
				var buffet_vprice = req.body.buffet_vprice;
				if (set == "") { set += " buffet_vprice ='" + buffet_vprice + "' " } else { set += ", buffet_vprice ='" + buffet_vprice + "' " }
			}
			if (req.body.buffet_nvprice) {
				var buffet_nvprice = req.body.buffet_nvprice;
				if (set == "") { set += " buffet_nvprice ='" + buffet_nvprice + "' " } else { set += ", buffet_nvprice ='" + buffet_nvprice + "' " }

			}
		} else {
			if (set == "") { set += " buffet_nvprice ='0', buffet_vprice ='0',  buffet_total ='0' " } else { set += ", buffet_nvprice ='0', buffet_vprice ='0',  buffet_total ='0' " }
		}
		if (req.body.is_dependent_charged != "") {
			var is_dependent_charged = req.body.is_dependent_charged;
			if (set == "") { set += " is_dependent_charged ='" + is_dependent_charged + "' " } else { set += ", is_dependent_charged ='" + is_dependent_charged + "' " }
		}
		if (req.body.is_dependent_charged != "" && req.body.is_dependent_charged == "Y") {
			if (req.body.price_for_dependent != "") {

				var price_for_dependent = req.body.price_for_dependent;
				if (set == "") { set += " price_for_dependent ='" + price_for_dependent + "' " } else { set += ", price_for_dependent ='" + price_for_dependent + "' " }
			}
		} else {
			if (set == "") { set += " price_for_dependent ='0' " } else { set += ", price_for_dependent ='0' " }
		}

	}
	if (parentCat == 1) {
		if (req.body.tournament_type != "") {
			var tournament_type = req.body.tournament_type;
			if (set == "") { set += " tournament_type ='" + tournament_type + "' " } else { set += ", tournament_type ='" + tournament_type + "' " }
		}
	}
	if (req.files.file) {
		var event_image = req.files.file[0].filename;
		if (set == "") { set += " event_image ='" + event_image + "' " } else { set += ", event_image ='" + event_image + "' " }
	}
	if (req.files.invitation_attachment_file) {
		var invitation_attachment_file = req.files.invitation_attachment_file[0].filename;
		if (set == "") { set += " invitation_attachment ='" + invitation_attachment_file + "' " } else { set += ", invitation_attachment ='" + invitation_attachment_file + "' " }

	}
	if (req.files.image1_file) {
		var image1_file = req.files.image1_file[0].filename;
		if (set == "") { set += " image1 ='" + image1_file + "' " } else { set += ", image1 ='" + image1_file + "' " }
	}
	if (req.files.image2_file) {
		var image2_file = req.files.image2_file[0].filename;
		if (set == "") { set += " image2 ='" + image2_file + "' " } else { set += ", image2 ='" + image2_file + "' " }
	}
	if (req.files.image3_file) {
		var image3_file = req.files.image3_file[0].filename;
		if (set == "") { set += " image3 ='" + image3_file + "' " } else { set += ", image3 ='" + image3_file + "' " }
	}
	if (req.files.image4_file) {
		var image4_file = req.files.image4_file[0].filename;
		if (set == "") { set += " image4 ='" + image4_file + "' " } else { set += ", image4 ='" + image4_file + "' " }
	}

	if (req.files.image5_file) {
		var image5_file = req.files.image5_file[0].filename;
		if (set == "") { set += " image5 ='" + image5_file + "' " } else { set += ", image5 ='" + image5_file + "' " }
	}

	if (req.files.image6_file) {
		var image6_file = req.files.image6_file[0].filename;
		if (set == "") { set += " image6 ='" + image6_file + "' " } else { set += ", image6 ='" + image6_file + "' " }
	}


	if (req.body.gvideopath) {
		var gvideopath = req.body.gvideopath;
		if (set == "") { set += " gvideopath ='" + gvideopath + "' " } else { set += ", gvideopath ='" + gvideopath + "' " }
	}

	if (req.body.highdesc) {
		var highdesc = req.body.highdesc;
		if (set == "") { set += " highdesc ='" + highdesc + "' " } else { set += ", highdesc ='" + highdesc + "' " }
	}

	var table_book_available = req.body.table_book_available;
	var is_seat_book_open = req.body.is_seat_book_open;
	var seat_2 = req.body.seat_2;
	var seat_4 = req.body.seat_4;
	var seat_6 = req.body.seat_6;
	var seat_8 = req.body.seat_8;

	if (parentCat == 2) {

		if (req.body.table_book_available) {

			if (set == "") { set += " table_book_available ='" + table_book_available + "' " } else { set += ", table_book_available ='" + table_book_available + "' " }
		}
		if (req.body.is_seat_book_open) {

			if (set == "") { set += " is_seat_book_open ='" + is_seat_book_open + "' " } else { set += ", is_seat_book_open ='" + is_seat_book_open + "' " }
		}
		if (req.body.seat_2) {

			if (set == "") { set += " seat_2 ='" + seat_2 + "' " } else { set += ", seat_2 ='" + seat_2 + "' " }
		}
		if (req.body.seat_4) {

			if (set == "") { set += " seat_4 ='" + seat_4 + "' " } else { set += ", seat_4 ='" + seat_4 + "' " }
		}

		if (req.body.seat_6) {

			if (set == "") { set += " seat_6 ='" + seat_6 + "' " } else { set += ", seat_6 ='" + seat_6 + "' " }
		}

		if (req.body.seat_8) {

			if (set == "") { set += " seat_8 ='" + seat_8 + "' " } else { set += ", seat_8 ='" + seat_8 + "' " }
		}


	} else {
		table_book_available = "";
		is_seat_book_open = "";
		seat_2 = "";
		seat_4 = "";
		seat_6 = "";
		seat_8 = "";
		if (set == "") { set += " table_book_available ='" + table_book_available + "' " } else { set += ", table_book_available ='" + table_book_available + "' " }
		if (set == "") { set += " is_seat_book_open ='" + is_seat_book_open + "' " } else { set += ", is_seat_book_open ='" + is_seat_book_open + "' " }
		if (set == "") { set += " seat_2 ='" + seat_2 + "' " } else { set += ", seat_2 ='" + seat_2 + "' " }
		if (set == "") { set += " seat_4 ='" + seat_4 + "' " } else { set += ", seat_4 ='" + seat_4 + "' " }
		if (set == "") { set += " seat_6 ='" + seat_6 + "' " } else { set += ", seat_6 ='" + seat_6 + "' " }
		if (set == "") { set += " seat_8 ='" + seat_8 + "' " } else { set += ", seat_8 ='" + seat_8 + "' " }
	}






	var id = req.body.id;
	var sql = " UPDATE events SET " + set + " WHERE id='" + id + "'";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		return res.status(200).json({ success: '1', response: result });
	});

});

router.route('/category_get').get(function (req, res) {

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
			where += "cat_name LIKE '%" + term + "%' OR cat_description  LIKE '%" + term + "%' OR cat_status  LIKE '%" + term + "%'";
		}
	}
	if (req.query.cat_status) {
		var cat_status = req.query.cat_status;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (cat_status != '') {
			where += " cat_status='" + cat_status + "'";
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
			sort += "ORDER BY " + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}
	var sqlTotal = "SELECT COUNT(id) as totalcount from event_category " + where + " " + sort + ";";

	var sql = "select * from event_category " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				var parentSql = "SELECT * from event_category  where parent_id=0;";
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize);
				db.query(parentSql, function (errp, parentResult) {
					return res.status(200).send({ success: 1, result: result, pageCount: totalpage, parentData: parentResult });
				});
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});

router.route('/category_add').post(function (req, res) {
	// console.log('request', req.body);
	// /////////////////////////////////////////// console.log("Request file ---", req.file);
	var item = req.body.item;
	var name = req.body.cat_name;
	var description = req.body.cat_description;
	var active = req.body.cat_status;
	var parent_id = req.body.parent_id;

	var sql = "INSERT INTO event_category ( cat_name,cat_description, cat_status, parent_id) VALUES   ('" + name + "', '" + description + "','" + active + "','" + parent_id + "');";



	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		console.log("1 record inserted");
		return res.status(200).json({ success: '1' });
	});


});


router.route('/category_update').post(function (req, res) {

	// var item = req.body.item;
	// console.log('request', req.body);
	var name = req.body.cat_name;
	var description = req.body.cat_description;
	var active = req.body.cat_status;
	var parent_id = req.body.parent_id;
	var id = req.body.id;

	var sql = "update event_category set  cat_name='" + name + "', cat_description='" + description + "', parent_id='" + parent_id + "', cat_status='" + active + "' where id='" + id + "'";

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record updated");
		return res.status(200).json({ success: '1', response: result });
	});



});



router.route('/category_delete').post(function (req, res) {
	var ids = req.body.ids;


	var sql = "delete from  event_category  where id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});



});

router.route('/add_event_rsvp').post(function (req, res) {

	var parentCat = req.body.parentCat;
	var created_by="";
	if(req.body.created_by)
	 created_by=req.body.created_by;
	var insertsql = '';
	var insertValues = '';

	if (parentCat == '2') {
		//entertainment rsvp comes here

		var who_is_coming = req.body.who_is_coming;
		var is_dependent_coming = req.body.is_dependent_coming;
		var is_guest_coming = req.body.is_guest_coming;
		var buffetWanted = req.body.buffetWanted;
		if (insertsql == '') {

			insertsql += " who_is_coming";
			insertValues += "'" + who_is_coming + "'";
		} else {
			insertsql += " ,who_is_coming";
			insertValues += " ,'" + who_is_coming + "'";
		}
		if (who_is_coming == 'b' || who_is_coming == 'ws') {
			var spouse_age = req.body.spouse_age;
			var spouse_name = req.body.spouse_name;
			if (insertsql == '') {

				insertsql += " spouse_name, spouse_age";
				insertValues += "'" + spouse_name + "', '" + spouse_age + "'";
			} else {
				insertsql += " ,spouse_name, spouse_age";
				insertValues += " ,'" + spouse_name + "', '" + spouse_age + "'";
			}
		}
		if (who_is_coming == 'b' || who_is_coming == 'me') {
			var member_code = req.body.member_code;
			var member_age = req.body.member_age;
			var member_name = req.body.member_name;
			if (insertsql == '') {

				insertsql += " member_code, member_age, member_name";
				insertValues += "'" + member_code + "', '" + member_age + "', '" + member_name + "'";
			} else {
				insertsql += " ,member_code, member_age, member_name";
				insertValues += " ,'" + member_code + "', '" + member_age + "', '" + member_name + "'";
			}
		}
		if (is_dependent_coming == 'Y') {
			var dependentMembers = req.body.dependentMembers;
			var totaldependents = dependentMembers.length;
			// if (insertsql == '') {
			// 	insertsql += " is_dependent_coming, totaldependents";
			// 	insertValues += "'" + is_dependent_coming + "', '" + totaldependents + "'";
			// } else {
			// 	insertsql += " ,is_dependent_coming, totaldependents";
			// 	insertValues += " ,'" + is_dependent_coming + "', '" + totaldependents + "'";
			// }

			if (insertsql == '') {
				insertsql += " is_dependent_coming, totaldependents,noofdependent";
				insertValues += "'" + is_dependent_coming + "', '" + totaldependents + "', '" + req.body.noofdependent + "'";
			} else {
				insertsql += " ,is_dependent_coming, totaldependents,noofdependent";
				insertValues += " ,'" + is_dependent_coming + "', '" + totaldependents + "', '" + req.body.noofdependent + "'";
			}
			dependentMembers.forEach((element, index, array) => {
				var dependentMemberName = element.dependent_name;
				var dependentMemberRelation = element.dependent_relation;
				var dependentMemberCode = element.dependent_code;
				var dependentMemberAge = element.dependent_age;
			});
		}

		if (is_guest_coming == 'Y') {
			var guests = req.body.guests;
			var totalguest = guests.length;
			// if (insertsql == '') {

			// 	insertsql += " is_guest_coming, totalguest";
			// 	insertValues += "'" + is_guest_coming + "', '" + totalguest + "'";
			// } else {
			// 	insertsql += " ,is_guest_coming, totalguest";
			// 	insertValues += " ,'" + is_guest_coming + "', '" + totalguest + "'";
			// }

			if (insertsql == '') {

				insertsql += " is_guest_coming, totalguest,noofguest";
				insertValues += "'" + is_guest_coming + "', '" + totalguest + "', '" + req.body.noofguest + "'";
			} else {
				insertsql += " ,is_guest_coming, totalguest,noofguest";
				insertValues += " ,'" + is_guest_coming + "', '" + totalguest + "', '" + req.body.noofguest + "'";
			}

			guests.forEach((element, index, array) => {
				var guestName = element.guest_name;
				var guestEmail = element.guest_email;
				var guestPhone = element.guest_phone;
				var guestAge = element.guest_age;
			});
		}
		if (buffetWanted == 'Y') {
			var nonVeg_buffet = req.body.nonVeg_buffet;
			var veg_buffet = req.body.veg_buffet;
			var totalbuffet = parseInt(nonVeg_buffet) + parseInt(veg_buffet);
			if (insertsql == '') {

				insertsql += " buffetWanted, nonVeg_buffet, veg_buffet, totalbuffet";
				insertValues += "'" + buffetWanted + "', '" + nonVeg_buffet + "', '" + veg_buffet + "', '" + totalbuffet + "'";
			} else {
				insertsql += " ,buffetWanted, nonVeg_buffet, veg_buffet, totalbuffet";
				insertValues += " ,'" + buffetWanted + "', '" + nonVeg_buffet + "', '" + veg_buffet + "', '" + totalbuffet + "'";
			}
		}



		var table_book_detail = req.body.table_book_detail;
		if (table_book_detail) {
			if (insertsql == '') {
				insertsql += " table_book_detail";
				insertValues += "'" + table_book_detail + "'";
			} else {
				insertsql += " ,table_book_detail";
				insertValues += " ,'" + table_book_detail + "'";
			}
		}


	} else if (parentCat == '1') {
		// sport rsvp comes here
		var are_you_coming = req.body.are_you_coming;
		var member_code = req.body.member_code;
		if (insertsql == '') {
			insertsql += " are_you_coming";
			insertValues += "'" + are_you_coming + "'";
		} else {
			insertsql += " ,are_you_coming";
			insertValues += " ,'" + are_you_coming + "'";
		}


		if (are_you_coming == 'Y') {

			var member_age = req.body.member_age;
			var member_name = req.body.member_name;
			var member_pair_name = req.body.member_pair_name;
			var member_pair_code = req.body.member_pair_code;
			var member_pair_age = req.body.member_pair_age;
			if (insertsql == '') {
				insertsql += " member_name, member_code, member_age, member_pair_name, member_pair_code, member_pair_age";
				insertValues += "'" + member_name + "','" + member_code + "','" + member_age + "', '" + member_pair_name + "','" + member_pair_code + "', '" + member_pair_age + "'";
			} else {
				insertsql += " ,member_name, member_code, member_age, member_pair_name, member_pair_code, member_pair_age";
				insertValues += " ,'" + member_name + "','" + member_code + "','" + member_age + "', '" + member_pair_name + "','" + member_pair_code + "', '" + member_pair_age + "'";
			}
		}
		var is_dependent_attending = req.body.is_dependent_attending;
		if (insertsql == '') {
			insertsql += " is_dependent_attending";
			insertValues += "'" + is_dependent_attending + "'";
		} else {
			insertsql += " ,is_dependent_attending";
			insertValues += " ,'" + is_dependent_attending + "'";
		}
		if (is_dependent_attending == 'Y') {
			var sportsDependentMembers = req.body.sportsDependentMembers;
			var totaldependents = sportsDependentMembers.length;
			var tournament_type = req.body.tournament_type;
			// if (insertsql == '') {
			// 	insertsql += " totaldependents, tournament_type";
			// 	insertValues += "'" + totaldependents + "', '" + tournament_type + "'";
			// } else {
			// 	insertsql += " ,totaldependents, tournament_type";
			// 	insertValues += " ,'" + totaldependents + "', '" + tournament_type + "'";
			// }

			if (insertsql == '') {
				insertsql += " totaldependents, tournament_type,noofdependent";
				insertValues += "'" + totaldependents + "', '" + tournament_type + "', '" + req.body.noofdependent + "'";
			} else {
				insertsql += " ,totaldependents, tournament_type,noofdependent";
				insertValues += " ,'" + totaldependents + "', '" + tournament_type + "', '" + req.body.noofdependent + "'";
			}
		}


	}

	var event_name = req.body.event_name;
	var event_id = req.body.event_id;
	var member_code = req.body.member_code;
	var guestPerMember = req.body.guestPerMember;
	// console.log('is_guest_coming', is_guest_coming);
	// console.log('req.body',req.body);

	var sql = "INSERT INTO event_rsvp ( member_code,parent_cat, rsvp_status, event_id,comments,created_by) VALUES ('" + member_code + "', '" + parentCat + "','0','" + event_id + "','"+req.body.comments+"','"+created_by+"');";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });

		if (result.insertId) {
			// console.log('result',result.insertId);
			var lastid = result.insertId;
			// event_sendwhatsapp(event_id, lastid, event_name, member_code, " ", "/dev/event/confirm");
			
			var path1 = "https://webapi.madrascricketclub.org/eventsimg/";

			// var sql = "SELECT * FROM `events` where id='" + event_id + "' ";
			var sql = "SELECT event_name,venue,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y %H:%i') as event_date,mobile_no,email,first_name FROM `events` e left join members m on member_code='" + member_code + "' where e.id='" + event_id + "' ";
	 db.query(sql, function (err, result) {

		var event_name = result[0].event_name;
		var event_image = result[0].event_image;
		var event_date = result[0].event_date;
		var number = result[0].mobile_no;
		var email = result[0].email;
		var member_name = result[0].first_name;
		var venue = result[0].venue;
				event_book(lastid,number,event_name,path1+event_image,member_code);
				// event_email(event_name, event_date, email,venue,member_code,member_name,venue,parentCat);
				
			});
			event_sendemail(event_id, lastid, member_code,parentCat);
			if (parentCat == '2') {
				if (insertsql == '') {
					insertsql += " rsvp_id";
					insertValues += "'" + lastid + "'";
				} else {
					insertsql += " ,rsvp_id";
					insertValues += " ,'" + lastid + "'";
				}
				var sqldynamic = "INSERT INTO event_rsvp_entertainment ( " + insertsql + " ) VALUES (" + insertValues + ");";
				// console.log('sqldynamic', sqldynamic);
				db.query(sqldynamic, function (err1, result1) {
					if (err1) return res.status(401).send({ error: err1.message });
					if (is_dependent_coming == 'Y') {

						var dependentMembers = req.body.dependentMembers;

						dependentMembers.forEach((element, index, array) => {
							var dependentMemberName = element.dependent_name;
							var dependentMemberRelation = element.dependent_relation;
							var dependentMemberCode = element.dependent_code;
							var dependentMemberAge = element.dependent_age;
							var dependentSql = "INSERT INTO event_rsvp_dependent_details(rsvp_id,dependent_name, dependent_relation, dependent_code, dependent_age  ) values('" + lastid + "', '" + dependentMemberName + "', '" + dependentMemberRelation + "', '" + dependentMemberCode + "', '" + dependentMemberAge + "');"
							console.log('dependentSql', dependentSql);
							db.query(dependentSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}

					if (is_guest_coming == 'Y') {
						var guests = req.body.guests;
						guests.forEach((element, index, array) => {
							var guestName = element.guest_name;
							var guestEmail = element.guest_email;
							var guestPhone = element.guest_phone;
							var guestAge = element.guest_age;
							var guestSql = "INSERT INTO event_rsvp_guests_details(rsvp_id,guest_name, guest_email, guest_phone, guest_age  ) values('" + lastid + "', '" + guestName + "', '" + guestEmail + "', '" + guestPhone + "', '" + guestAge + "');"
							db.query(guestSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}


				});
			} else if (parentCat == '1') {
				if (insertsql == '') {
					insertsql += " rsvp_id";
					insertValues += "'" + lastid + "'";
				} else {
					insertsql += " ,rsvp_id";
					insertValues += " ,'" + lastid + "'";
				}
				var sqldynamica = "INSERT INTO event_rsvp_sports ( " + insertsql + " ) VALUES (" + insertValues + ");";
				// console.log('sqldynamica', sqldynamica);
				db.query(sqldynamica, function (err1, result1) {
					if (is_dependent_attending == 'Y') {
						sportsDependentMembers
						sportsDependentMembers.forEach((element, index, array) => {
							var dependentMemberName = element.dependent_name;
							var dependentMemberRelation = element.dependent_relation;
							var dependentMemberCode = element.dependent_code;
							var dependentMemberAge = element.dependent_age;
							var dependentPairMemberName = element.dependent_pair_name;
							var dependentPairMemberCode = element.dependent_pair_code;
							var dependentPairMemberAge = element.dependent_pair_age;
							var dependentSql = "INSERT INTO event_rsvp_dependent_details(rsvp_id,dependent_name, dependent_relation, dependent_code, dependent_age, dependent_pair_name, dependent_pair_code, dependent_pair_age  ) values('" + lastid + "', '" + dependentMemberName + "', '" + dependentMemberRelation + "', '" + dependentMemberCode + "', '" + dependentMemberAge + "','" + dependentPairMemberName + "','" + dependentPairMemberCode + "','" + dependentPairMemberAge + "');"
							//console.log('dependentSql', dependentSql);
							db.query(dependentSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}
				});

			}
			// return res.status(200).json({ success: '1',event_id:event_id,bookid:lastid,event_name: event_name,member_code:member_code,parentCat:parentCat});

			
		} else {
			return res.status(401).json({ error: err.message });
		}

	});
	
	
	return res.status(200).json({ success: '1'});



});


router.route('/add_event_rsvp1').post(function (req, res) {

	var parentCat = req.body.parentCat;
	var insertsql = '';
	var insertValues = '';

	if (parentCat == '2') {
		//entertainment rsvp comes here

		var who_is_coming = req.body.who_is_coming;
		var is_dependent_coming = req.body.is_dependent_coming;
		var is_guest_coming = req.body.is_guest_coming;
		var buffetWanted = req.body.buffetWanted;
		if (insertsql == '') {

			insertsql += " who_is_coming";
			insertValues += "'" + who_is_coming + "'";
		} else {
			insertsql += " ,who_is_coming";
			insertValues += " ,'" + who_is_coming + "'";
		}
		if (who_is_coming == 'b' || who_is_coming == 'ws') {
			var spouse_age = req.body.spouse_age;
			var spouse_name = req.body.spouse_name;
			if (insertsql == '') {

				insertsql += " spouse_name, spouse_age";
				insertValues += "'" + spouse_name + "', '" + spouse_age + "'";
			} else {
				insertsql += " ,spouse_name, spouse_age";
				insertValues += " ,'" + spouse_name + "', '" + spouse_age + "'";
			}
		}
		if (who_is_coming == 'b' || who_is_coming == 'me') {
			var member_code = req.body.member_code;
			var member_age = req.body.member_age;
			var member_name = req.body.member_name;
			if (insertsql == '') {

				insertsql += " member_code, member_age, member_name";
				insertValues += "'" + member_code + "', '" + member_age + "', '" + member_name + "'";
			} else {
				insertsql += " ,member_code, member_age, member_name";
				insertValues += " ,'" + member_code + "', '" + member_age + "', '" + member_name + "'";
			}
		}
		if (is_dependent_coming == 'Y') {
			var dependentMembers = req.body.dependentMembers;
			var totaldependents = dependentMembers.length;
			if (insertsql == '') {
				insertsql += " is_dependent_coming, totaldependents";
				insertValues += "'" + is_dependent_coming + "', '" + totaldependents + "'";
			} else {
				insertsql += " ,is_dependent_coming, totaldependents";
				insertValues += " ,'" + is_dependent_coming + "', '" + totaldependents + "'";
			}
			dependentMembers.forEach((element, index, array) => {
				var dependentMemberName = element.dependent_name;
				var dependentMemberRelation = element.dependent_relation;
				var dependentMemberCode = element.dependent_code;
				var dependentMemberAge = element.dependent_age;
			});
		}

		if (is_guest_coming == 'Y') {
			var guests = req.body.guests;
			var totalguest = guests.length;
			if (insertsql == '') {

				insertsql += " is_guest_coming, totalguest";
				insertValues += "'" + is_guest_coming + "', '" + totalguest + "'";
			} else {
				insertsql += " ,is_guest_coming, totalguest";
				insertValues += " ,'" + is_guest_coming + "', '" + totalguest + "'";
			}

			guests.forEach((element, index, array) => {
				var guestName = element.guest_name;
				var guestEmail = element.guest_email;
				var guestPhone = element.guest_phone;
				var guestAge = element.guest_age;
			});
		}
		if (buffetWanted == 'Y') {
			var nonVeg_buffet = req.body.nonVeg_buffet;
			var veg_buffet = req.body.veg_buffet;
			var totalbuffet = parseInt(nonVeg_buffet) + parseInt(veg_buffet);
			if (insertsql == '') {

				insertsql += " buffetWanted, nonVeg_buffet, veg_buffet, totalbuffet";
				insertValues += "'" + buffetWanted + "', '" + nonVeg_buffet + "', '" + veg_buffet + "', '" + totalbuffet + "'";
			} else {
				insertsql += " ,buffetWanted, nonVeg_buffet, veg_buffet, totalbuffet";
				insertValues += " ,'" + buffetWanted + "', '" + nonVeg_buffet + "', '" + veg_buffet + "', '" + totalbuffet + "'";
			}
		}



		var table_book_detail = req.body.table_book_detail;
		if (table_book_detail) {
			if (insertsql == '') {
				insertsql += " table_book_detail";
				insertValues += "'" + table_book_detail + "'";
			} else {
				insertsql += " ,table_book_detail";
				insertValues += " ,'" + table_book_detail + "'";
			}
		}


	} else if (parentCat == '1') {
		// sport rsvp comes here
		var are_you_coming = req.body.are_you_coming;
		var member_code = req.body.member_code;
		if (insertsql == '') {
			insertsql += " are_you_coming";
			insertValues += "'" + are_you_coming + "'";
		} else {
			insertsql += " ,are_you_coming";
			insertValues += " ,'" + are_you_coming + "'";
		}


		if (are_you_coming == 'Y') {

			var member_age = req.body.member_age;
			var member_name = req.body.member_name;
			var member_pair_name = req.body.member_pair_name;
			var member_pair_code = req.body.member_pair_code;
			var member_pair_age = req.body.member_pair_age;
			if (insertsql == '') {
				insertsql += " member_name, member_code, member_age, member_pair_name, member_pair_code, member_pair_age";
				insertValues += "'" + member_name + "','" + member_code + "','" + member_age + "', '" + member_pair_name + "','" + member_pair_code + "', '" + member_pair_age + "'";
			} else {
				insertsql += " ,member_name, member_code, member_age, member_pair_name, member_pair_code, member_pair_age";
				insertValues += " ,'" + member_name + "','" + member_code + "','" + member_age + "', '" + member_pair_name + "','" + member_pair_code + "', '" + member_pair_age + "'";
			}
		}
		var is_dependent_attending = req.body.is_dependent_attending;
		if (insertsql == '') {
			insertsql += " is_dependent_attending";
			insertValues += "'" + is_dependent_attending + "'";
		} else {
			insertsql += " ,is_dependent_attending";
			insertValues += " ,'" + is_dependent_attending + "'";
		}
		if (is_dependent_attending == 'Y') {
			var sportsDependentMembers = req.body.sportsDependentMembers;
			var totaldependents = sportsDependentMembers.length;
			var tournament_type = req.body.tournament_type;
			if (insertsql == '') {
				insertsql += " totaldependents, tournament_type";
				insertValues += "'" + totaldependents + "', '" + tournament_type + "'";
			} else {
				insertsql += " ,totaldependents, tournament_type";
				insertValues += " ,'" + totaldependents + "', '" + tournament_type + "'";
			}
		}


	}

	var event_name = req.body.event_name;
	var event_id = req.body.event_id;
	var member_code = req.body.member_code;
	var guestPerMember = req.body.guestPerMember;
	// console.log('is_guest_coming', is_guest_coming);
	// console.log('req.body',req.body);

	var sql = "INSERT INTO event_rsvp ( member_code,parent_cat, rsvp_status, event_id,comments) VALUES ('" + member_code + "', '" + parentCat + "','0','" + event_id + "','"+req.body.comments+"');";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });

		if (result.insertId) {
			// console.log('result',result.insertId);
			var lastid = result.insertId;
			// event_sendwhatsapp(event_id, lastid, event_name, member_code, " ", "/dev/event/confirm");
			
			var path1 = "https://webapi.madrascricketclub.org/eventsimg/";

			// var sql = "SELECT * FROM `events` where id='" + event_id + "' ";
			var sql = "SELECT event_name,venue,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y %H:%i') as event_date,mobile_no,email,first_name FROM `events` e left join members m on member_code='" + member_code + "' where e.id='" + event_id + "' ";
	 db.query(sql, function (err, result) {

		var event_name = result[0].event_name;
		var event_image = result[0].event_image;
		var event_date = result[0].event_date;
		var number = result[0].mobile_no;
		var email = result[0].email;
		var member_name = result[0].first_name;
		var venue = result[0].venue;
				event_book(lastid,number,event_name,path1+event_image,member_code);
				// event_email(event_name, event_date, email,venue,member_code,member_name,venue,parentCat);
				
			});
			
			event_sendemail(event_id, lastid, member_code,parentCat);
			if (parentCat == '2') {
				if (insertsql == '') {
					insertsql += " rsvp_id";
					insertValues += "'" + lastid + "'";
				} else {
					insertsql += " ,rsvp_id";
					insertValues += " ,'" + lastid + "'";
				}
				var sqldynamic = "INSERT INTO event_rsvp_entertainment ( " + insertsql + " ) VALUES (" + insertValues + ");";
				// console.log('sqldynamic', sqldynamic);
				db.query(sqldynamic, function (err1, result1) {
					if (err1) return res.status(401).send({ error: err1.message });
					if (is_dependent_coming == 'Y') {

						var dependentMembers = req.body.dependentMembers;

						dependentMembers.forEach((element, index, array) => {
							var dependentMemberName = element.dependent_name;
							var dependentMemberRelation = element.dependent_relation;
							var dependentMemberCode = element.dependent_code;
							var dependentMemberAge = element.dependent_age;
							var dependentSql = "INSERT INTO event_rsvp_dependent_details(rsvp_id,dependent_name, dependent_relation, dependent_code, dependent_age  ) values('" + lastid + "', '" + dependentMemberName + "', '" + dependentMemberRelation + "', '" + dependentMemberCode + "', '" + dependentMemberAge + "');"
							console.log('dependentSql', dependentSql);
							db.query(dependentSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}

					if (is_guest_coming == 'Y') {
						var guests = req.body.guests;
						guests.forEach((element, index, array) => {
							var guestName = element.guest_name;
							var guestEmail = element.guest_email;
							var guestPhone = element.guest_phone;
							var guestAge = element.guest_age;
							var guestSql = "INSERT INTO event_rsvp_guests_details(rsvp_id,guest_name, guest_email, guest_phone, guest_age  ) values('" + lastid + "', '" + guestName + "', '" + guestEmail + "', '" + guestPhone + "', '" + guestAge + "');"
							db.query(guestSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}


				});
			} else if (parentCat == '1') {
				if (insertsql == '') {
					insertsql += " rsvp_id";
					insertValues += "'" + lastid + "'";
				} else {
					insertsql += " ,rsvp_id";
					insertValues += " ,'" + lastid + "'";
				}
				var sqldynamica = "INSERT INTO event_rsvp_sports ( " + insertsql + " ) VALUES (" + insertValues + ");";
				// console.log('sqldynamica', sqldynamica);
				db.query(sqldynamica, function (err1, result1) {
					if (is_dependent_attending == 'Y') {
						sportsDependentMembers
						sportsDependentMembers.forEach((element, index, array) => {
							var dependentMemberName = element.dependent_name;
							var dependentMemberRelation = element.dependent_relation;
							var dependentMemberCode = element.dependent_code;
							var dependentMemberAge = element.dependent_age;
							var dependentPairMemberName = element.dependent_pair_name;
							var dependentPairMemberCode = element.dependent_pair_code;
							var dependentPairMemberAge = element.dependent_pair_age;
							var dependentSql = "INSERT INTO event_rsvp_dependent_details(rsvp_id,dependent_name, dependent_relation, dependent_code, dependent_age, dependent_pair_name, dependent_pair_code, dependent_pair_age  ) values('" + lastid + "', '" + dependentMemberName + "', '" + dependentMemberRelation + "', '" + dependentMemberCode + "', '" + dependentMemberAge + "','" + dependentPairMemberName + "','" + dependentPairMemberCode + "','" + dependentPairMemberAge + "');"
							//console.log('dependentSql', dependentSql);
							db.query(dependentSql, function (err1, result1) {
								if (err1) return res.status(401).send({ error: err1.message });
							});
						});
					}
				});

			}
			return res.status(200).json({ success: '1',event_id:event_id,bookid:lastid,event_name: event_name,member_code:member_code,parentCat:parentCat});

			
		} else {
			return res.status(401).json({ error: err.message });
		}

	});
	
	
	// return res.status(200).json({ success: '1'});



});

async function event_book(bookid,number, name, imageurl, member_code) {
	

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
			"template_name": "event_confirm",
			"language": {
			  "policy": "deterministic",
			  "code": "en"
			},
			"rich_template_data": {
			  "header": {
				"type": "image",
				"media_url": imageurl,
			  },
			  "body": {
				"params": [
				  {
					"data": name
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
		//  console.log(response);
		
		
	  }).catch((err) => 
	  {      
	   
	  });  
  }

  async function event_email(event_name, event_date, email,venue,member_code,member_name,venue,parentCat) {


	
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
		var ccemail='events@madrascricketclub.org';
		if(parentCat=='1')
		ccemail='sports@madrascricketclub.org';
		
		mailOptions = {
			from: 'social@madrascricketclub.org',
			to: email,
			cc: ccemail,
			subject: 'MCC - Event Booking Info - '+event_name,
			// text: 'Your password is ',
			// html: '<h1>Welcome</h1><p>That was easy! your pin is : '+ result[0].pin+'</p>'
			html: '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt">       <tbody><tr><td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt">       <p class="MsoNormal">       <span style="color:black">       <img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear ' + member_name + '&nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><b>Event Booking Information : </b></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">' + member_code + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Booking Id: <span style="color:red">' + bookid + '</span></p></td></tr>' +
				'<tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Name: <span style="color:red">' + event_name + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Date: <span style="color:red">' + event_date + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Event Venue: <span style="color:red">' + venue + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table>'

		};

		await transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});


}

router.route('/support_event').post(function (req, res) {

	var event_name = req.body.event_name;
	var event_id = req.body.event_id;
	var member_code = req.body.member_code;
	var member_email = req.body.member_email;
	var member_name = req.body.member_name;
	var member_phone = req.body.member_phone;
	var support_cat = req.body.support_cat;
	var support_message = req.body.support_message;

	if (support_message != '') {
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
			subject: 'Support for Event ' + event_name,
			html: '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt"> <tbody><tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black"><img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear Admin &nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">A Member is required Support for event ' + event_name + '. Details are as Follows </p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Name: <span style="color:red">' + member_name + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">' + member_code + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Email: <span style="color:red">' + member_email + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Phone: <span style="color:red">' + member_phone + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Suport Request Message: <span style="color:red">' + support_message + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '

		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				//console.log(error);
				return res.status(401).send({ error: error });
			} else {
				return res.status(200).json({ success: '1' });
			}
		});

	} else {
		return res.status(401).send({ error: "Support Message is Required" });
	}




});
router.route('/feedback').post(function (req, res) {


	var event_name = req.body.event_name;
	var event_id = req.body.event_id;
	var member_code = req.body.member_code;
	var member_email = req.body.member_email;
	var member_name = req.body.member_name;
	var member_phone = req.body.member_phone;
	var feedback_cat = req.body.feedback_cat;
	var feedback_message = req.body.feedback_message;


	var sql = "INSERT INTO feedback ( member_code,feedback_category, ref_id, feedback_text) VALUES ('" + member_code + "', '" + feedback_cat + "', '" + event_id + "','" + feedback_message + "');";;
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
			subject: 'Feedback for Event ' + event_name,
			html: '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt"> <tbody><tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black"><img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear Admin &nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">A Member is Sent Feedback for event ' + event_name + '. Details are as Follows </p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Name: <span style="color:red">' + member_name + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">' + member_code + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Email: <span style="color:red">' + member_email + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Phone: <span style="color:red">' + member_phone + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Feedback: <span style="color:red">' + feedback_message + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '

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


router.route('/event_booking_report').get(function (req, res) {


	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';

	if (req.query.eventid) {

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (req.query.eventid != '') {
			where += " event_id = '" + req.query.eventid.trim() + "' ";
		}
	}
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += "( member_code LIKE '%" + term + "%' OR member_name LIKE '%" + term + "%' OR spouse_name LIKE '%" + term + "%' )";
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

	var sqlTotal = "SELECT COUNT(*) as totalcount from  event_rsvp a left join event_rsvp_entertainment b on a.rsvp_id=b.rsvp_id   " + where + " " + sort + ";";

	// var sql = "select (select event_name from events where id=a.event_id) as Event Name,a.rsvp_id as Booking Id,a.member_code as Member Code,parent_cat as Category,event_id as Event Id,created_date as Created Date,who_is_coming as Member/Spouse,is_dependent_coming as Dependent,is_guest_coming as Guest,buffetWanted as Buffet,member_name as Member Name,member_age as Member Age,spouse_name as Spouse Name,spouse_age as Spouse Age,totaldependents as Total Dependents,totalguest as Total Guest,nonVeg_buffet as Non-Veg,veg_buffet as Veg,totalbuffet as Total Buffet,table_book_detail as Table Book Detail,admin_tablebook_response as Admin Tablebook Response from event_rsvp a left join event_rsvp_entertainment b on a.rsvp_id=b.rsvp_id "+where+" "+sort+" "+limit+" ;";
	var sql = "select (select event_name from events where id=a.event_id) as Event_Name,a.rsvp_id as Booking_Id,a.member_code as Member_Code,parent_cat as Category,event_id as Event_Id,created_date as Created_Date,who_is_coming as MemberorSpouse,is_dependent_coming as Dependent,totaldependents as Total_Dependents,is_guest_coming as Guest,totalguest as Total_Guest,buffetWanted as Buffet,veg_buffet as Veg,nonVeg_buffet as NonVeg,totalbuffet as Total_Buffet,member_name as Member_Name,member_age as Member_Age,spouse_name as Spouse_Name,spouse_age as Spouse_Age,table_book_detail as Table_Book_Detail,admin_tablebook_response as Admin_Tablebook_Response from event_rsvp a left join event_rsvp_entertainment b on a.rsvp_id=b.rsvp_id " + where + " " + sort + " " + limit + " ;";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (errcount, sqlTotalResult) {
				// console.log('sqlTotalResult', sqlTotalResult[0]);
				const totalpage = Math.ceil(sqlTotalResult[0].totalcount / pageSize)
				return res.status(200).send({ success: 1, result: result, pageCount: totalpage, sql: sql, totalcount: sqlTotalResult[0].totalcount });
			});

			// 
		} else {
			return res.status(200).send({ success: 0, result: [], pageCount: 1 });
		}

	});


});

router.route('/rsvp_get').get(function (req, res) {
	var where = '';
	var orderby = '';
	var sort = '';
	var limit = '';
	if (req.query.CurrentUserId) {
		var CurrentUserId = req.query.CurrentUserId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (CurrentUserId != '') {
			where += " er1.member_code = '" + CurrentUserId + "' ";
		}
	}

	if (req.query.monthSelected) {
		var monthSelected = req.query.monthSelected;
		var arr = monthSelected.split("-");
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (monthSelected != '') {
			where += " YEAR(e.event_date_from) = '" + arr[1].trim() + "' AND MONTH(e.event_date_from) = '" + getMonthFromString(arr[0].trim()) + "' ";
		}
	}
	if (req.query.term) {
		var term = req.query.term;

		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (term != '') {
			where += " e.event_name LIKE '%" + term + "%' OR e.event_date_from  LIKE '%" + term + "%' OR e.event_date_to LIKE '%" + term + "%' OR er1.rsvp_status  LIKE '%" + term + "%' OR er1.member_code  LIKE '%" + term + "%'";
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
			sort += "ORDER BY er1." + sortByobj.id;
		}
		if (sortByobj.desc == true) {
			sort += " DESC";
		} else {
			sort += " ASC";
		}
	}
	var sqlTotal = "SELECT COUNT(er1.rsvp_id) as totalcount from event_rsvp er1  INNER JOIN events  e ON e.id = er1.event_id  " + where + " " + sort + ";";
	var sql = "SELECT er1.*, e.event_name from event_rsvp er1 INNER JOIN events  e ON e.id = er1.event_id " + where + " " + sort + " " + limit + " ;";
	// exit;
	// console.log('sqlTotal', sqlTotal);
	// return  res.status(200).send({ success:0, result:[],pageCount:1 });
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			db.query(sqlTotal, function (err, sqlTotalResult) {
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


router.route('/rsvp_detail').get(function (req, res) {
	var where = '';

	if (req.query.orderId) {
		var orderId = req.query.orderId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (orderId != '') {
			where += " er1.rsvp_id='" + orderId + "';";
		}

	}

	var sql = "select * from event_rsvp er1 " + where + " ;";


	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			var orderitemssql = "select event_name, (SELECT cat_name from event_category where id=event_category) as eventcategory, venue, event_date_from, event_date_to from events  WHERE id='" + result[0].event_id + "';";
			db.query(orderitemssql, function (erra, resulta) {
				if (erra) return res.status(401).send({ error: erra.message });
				if (resulta.length >= 0) {
					// console.log(result[0].member_code);
					var customer_detail = "select first_name, last_name, email, mobile_no from members where  member_code='" + result[0].member_code + "' ;";
					db.query(customer_detail, function (errb, resultb) {
						if (errb) return res.status(401).send({ error: errb.message });
						if (resultb.length >= 0) {
							return res.status(200).send({ success: 1, result: result, resulta: resulta, resultb: resultb });
						} else {
							return res.status(200).send({ success: 0, result: result, resulta: resulta, resultb: [], pageCount: 1 });
						}
					});
				} else {
					return res.status(200).send({ success: 0, result: [], resulta: [], resultb: [], pageCount: 1 });
				}
			});


			// 
		} else {
			return res.status(200).send({ success: 0, result: [], resulta: [], resultb: [], pageCount: 1 });
		}
	});


});

router.route('/rsvp_detail_data').get(function (req, res) {
	var where = '';

	if (req.query.orderId) {
		var orderId = req.query.orderId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (orderId != '') {
			where += " rsvp_id='" + orderId + "';";
		}

	}
	var parentCat = req.query.parentCat;

	if (parentCat == '2') {
		var sql = "select *  from event_rsvp_entertainment " + where + " ;";
	} else if (parentCat == '1') {
		var sql = "select *  from event_rsvp_sports " + where + " ;";

	}

	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		if (result.length >= 0) {
			return res.status(200).send({ success: 1, result: result });
		} else {
			return res.status(200).send({ success: 0, result: [] });
		}
	});

});
router.route('/rsvp_dependent_detail').get(function (req, res) {
	var where = '';

	if (req.query.orderId) {
		var orderId = req.query.orderId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (orderId != '') {
			where += " rsvp_id='" + orderId + "';";
		}

	}

	var sql = "select dependent_relation, dependent_name, dependent_code, dependent_age, dependent_pair_name, dependent_pair_code, dependent_pair_age from event_rsvp_dependent_details " + where + " ;";


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

router.route('/rsvp_guest_detail').get(function (req, res) {
	var where = '';

	if (req.query.orderId) {
		var orderId = req.query.orderId;
		if (where == '') {
			where += "WHERE ";
		} else {
			where += ' AND ';
		}
		if (orderId != '') {
			where += " rsvp_id='" + orderId + "';";
		}

	}

	var sql = "select guest_name, guest_email, guest_phone, guest_age from event_rsvp_guests_details " + where + " ;";


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

router.route('/rsvp_status_update').post(function (req, res) {
	var ids = req.body.ids;
	var orderstatus = req.body.orderstatus;

	var sql = "update event_rsvp set rsvp_status='" + orderstatus + "' where rsvp_id IN(" + ids + ")  OR parent_rsvp_id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		console.log("1 record updated");
		return res.status(200).json({ success: '1' });
	});

});


router.route('/rsvp_tablebook_status_update').post(function (req, res) {
	var id = req.body.id;
	var message = req.body.message;

	var sql = "update event_rsvp_entertainment set admin_tablebook_response='" + message + "' where rsvp_id ='" + id + "'";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		// console.log("1 record updated");
		// forgotpinWhatsup("Raghav","RL01","704985","7200011175");
		var sql1 = "SELECT member_code,event_id FROM `event_rsvp` WHERE rsvp_id ='" + id + "'";
		db.query(sql1, function (err1, result1) {
			if (err1) return res.status(401).send({ error: err.message });
			var member_code = result1[0].member_code;
			var event_id = result1[0].event_id;

			event_sendwhatsapp(event_id, id, " ", member_code, message, "/dev/event/table_confirm")

		});

		return res.status(200).json({ success: '1' });
	});

});

function forgotpinWhatsup(name, member_code, pin, number) {

	const data = JSON.stringify({
		'number': number,
		'name': name,
		'member_code': member_code,
		'pin': pin
	})

	const options = {
		hostname: '7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com',
		port: 443,
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


router.route('/rsvp_delete').post(function (req, res) {

	var ids = req.body.ids;
	var sql = "delete from  event_rsvp  where rsvp_id IN (" + ids + ") OR parent_rsvp_id IN (" + ids + ")";
	db.query(sql, function (err, result) {
		if (err) return res.status(401).send({ error: err.message });
		console.log("1 record deleted");
		return res.status(200).json({ success: '1' });
	});
});


router.route('/orderfeedback').post(function (req, res) {


	var eventOrder_name = req.body.eventOrder_name;
	var order_id = req.body.order_id;
	var member_code = req.body.member_code;
	var member_email = req.body.member_email;
	var member_name = req.body.member_name;
	var member_phone = req.body.member_phone;
	var feedback_cat = req.body.feedback_cat;
	var feedback_message = req.body.feedback_message;


	var sql = "INSERT INTO feedback ( member_code,feedback_category, ref_id, feedback_text) VALUES ('" + member_code + "', '" + feedback_cat + "', '" + order_id + "','" + feedback_message + "');";;
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
			subject: 'Feedback for Event ' + eventOrder_name,
			html: '<table border="1" cellspacing="0" cellpadding="0" width="800" style="width:600.0pt;border:solid #999999 1.0pt"> <tbody><tr> <td style="border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black"><img border="0" width="200" height="45" style="width:2.0833in;height:.4687in" id="m_-452513339896761974_x0000_i1025" src="https://ci3.googleusercontent.com/proxy/H7S-PZpQXfRzgLOaOSysE85OV2h4UMwhL7_3iKcNP8eo4fGNQNJGOffKe_9YwMbCxHkftfJrPv5stxwOOqeBNqNpKfnTnVIhje9z9-OU0QK2KpvMpBJdzOTLvQ=s0-d-e1-ft#https://www.madrascricketclub.org/portal/public_v1.0/images/mcc_logo.png" alt="Madras Cricket Club" class="CToWUd"></span></p></td><td width="488" style="width:366.0pt;border:none;border-bottom:solid #999999 1.0pt;background:#f6f6f6;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><span style="color:black">&nbsp;</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Dear Admin &nbsp;,</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">A Member is Sent Feedback for event ' + eventOrder_name + '. Details are as Follows </p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Name: <span style="color:red">' + member_name + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Code: <span style="color:red">' + member_code + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Email: <span style="color:red">' + member_email + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Member Phone: <span style="color:red">' + member_phone + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Feedback: <span style="color:red">' + feedback_message + '</span></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Have a nice day.</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal">Regards</p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><u>Madras Cricket Club Support.</u></p></td></tr><tr><td colspan="2" style="border:none;padding:3.75pt 3.75pt 3.75pt 3.75pt"><p class="MsoNormal"><a href="http://www.madrascricketclub.org" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://www.madrascricketclub.org&amp;source=gmail&amp;ust=1657802750140000&amp;usg=AOvVaw0EkVi-f9AxF_S-gXQ3Qo5l">www.madrascricketclub.org</a></p></td></tr></tbody></table> '

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

module.exports = router;