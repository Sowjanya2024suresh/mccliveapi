const router = require('express').Router();
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto')
var db = require('./db');
var nodemailer = require('nodemailer');
var https = require('https');
var request = require('request');
const token = 'eyJraWQiOiJjdXN0b20tb2F1dGgta2V5aWQiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmcmVzaGNoYXQiLCJzdWIiOiI1MTkzYzRkOS00M2ExLTQ4NjUtOTM4Ny1mMzhkNmQxNjQ2OTIiLCJjbGllbnRJZCI6ImZjLWFmMDc5ZTBlLWQ5OTUtNGNhZS05NDdhLWRmNGRmZjliZjMyMSIsInNjb3BlIjoiYWdlbnQ6cmVhZCBhZ2VudDpjcmVhdGUgYWdlbnQ6dXBkYXRlIGFnZW50OmRlbGV0ZSBjb252ZXJzYXRpb246Y3JlYXRlIGNvbnZlcnNhdGlvbjpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgbWVzc2FnZTpnZXQgYmlsbGluZzp1cGRhdGUgcmVwb3J0czpmZXRjaCByZXBvcnRzOmV4dHJhY3QgcmVwb3J0czpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIGFjY291bnQ6cmVhZCBkYXNoYm9hcmQ6cmVhZCB1c2VyOnJlYWQgdXNlcjpjcmVhdGUgdXNlcjp1cGRhdGUgdXNlcjpkZWxldGUgb3V0Ym91bmRtZXNzYWdlOnNlbmQgb3V0Ym91bmRtZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6bWVzc2FnZTpzZW5kIG1lc3NhZ2luZy1jaGFubmVsczptZXNzYWdlOmdldCBtZXNzYWdpbmctY2hhbm5lbHM6dGVtcGxhdGU6Y3JlYXRlIG1lc3NhZ2luZy1jaGFubmVsczp0ZW1wbGF0ZTpnZXQgZmlsdGVyaW5ib3g6cmVhZCBmaWx0ZXJpbmJveDpjb3VudDpyZWFkIHJvbGU6cmVhZCBpbWFnZTp1cGxvYWQiLCJpc3MiOiJmcmVzaGNoYXQiLCJ0eXAiOiJCZWFyZXIiLCJleHAiOjE5NzY0NjE5MjIsImlhdCI6MTY2MDg0MjcyMiwianRpIjoiOTAyZjE2ZTUtMzM5Yy00OWEzLTg5ZmYtYTk4MzZjZDgyMDNlIn0.yJ1lkKoouewZF_ONSYInPQNL2iyzZUnAQ3cC1jQWS5c';
const axios = require('axios');

// get all events with pagination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/broadcast/')
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    // cb(null, file.originalname)
    cb(null, file.originalname.substring(0, file.originalname.lastIndexOf('.'))+Date.now()+path.extname(file.originalname))
    
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

router.route('/get_broadcast').get(function (req, res) {
  var where = 'where flag="1"';
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
      where += "message LIKE '%" + term + "%' OR group  LIKE '%" + term + "%' OR medium LIKE '%" + term + "%'"
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
  var sqlTotal = "SELECT COUNT(id) as totalcount from broadcast_detail " + where + " " + sort + ";";
  var sql = "SELECT id,adminCode,module,message_template,imagepath,filepath,message,groupid,medium,status,flag,eventid,DATE_FORMAT(broadcast_date,'%d-%b-%Y %H:%i') as broadcast_date FROM `broadcast_detail` " + where + " " + sort + " " + limit + " ;";
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


router.route('/create_broadcast').post(upload.fields([{
  name: 'imagepath_file', maxCount: 1
}, {
  name: 'filepath_file', maxCount: 1
}]), function (req, res) {
  // console.log('request', req.body);
  // console.log("Request file ---", req.files.file[0].filename);

  var message = req.body.message;
  var groupid = req.body.groupid;
  var medium = req.body.medium;

  var module = req.body.module;

  var message_template = req.body.message_template;
  var eventid = req.body.eventid;

  var sql = " INSERT INTO broadcast_detail (message,groupid,medium,status,flag,module,message_template,eventid) VALUES ('" + message + "','" + groupid + "','" + medium + "','1','1','" + module + "','" + message_template + "','" + eventid + "')";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    // console.log('insertId', result.insertId);
    if (result.insertId) {

      var lastid = result.insertId;
      if (req.files.imagepath_file) {
        var broadcast_image = req.files.imagepath_file[0].filename;
        var sql1 = "UPDATE broadcast_detail SET imagepath='" + broadcast_image + "' WHERE id='" + lastid + "'"
        db.query(sql1, function (err1, result1) {
          if (err1) return res.status(401).send({ error: err1.message });
        });
      }
      if (req.files.filepath_file) {
        var filepath_file = req.files.filepath_file[0].filename;
        var sql2 = "UPDATE broadcast_detail SET filepath='" + filepath_file + "' WHERE id='" + lastid + "'"
        db.query(sql2, function (err2, result2) {
          if (err2) return res.status(401).send({ error: err2.message });
        });
      }

      //  send_broadcast(lastid,'');

      // send_broadcastadmin(lastid);

      setTimeout(async() => {
        await send_broadcast(lastid, ' limit 0,800');
      }, 10000);

      if (groupid == "all") {
        setTimeout(async() => {
          await send_broadcast(lastid, ' limit  800,800');
        }, 10000);

        setTimeout(async() => {
         await send_broadcast(lastid, ' limit 1600,800');
        }, 10000);
      }


      setTimeout(() => {
        return res.status(200).json({ success: '1', id: lastid });
      }, 20000);


    } else {
      return res.status(401).json({ success: '0', error: 'Unbale to Add' });
    }
  });
});


router.route('/delete_broadcast').post(function (req, res) {
  var ids = req.body.ids;


  var sql = "delete from  broadcast_detail where id IN (" + ids + ")";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    // console.log("1 record deleted");
    return res.status(200).json({ success: '1' });
  });



});

router.route('/get_broadcast_module').get(function (req, res) {


  var sql = "SELECT module FROM `broadcast_module` group by module";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    // console.log("1 record deleted");
    return res.status(200).json({ success: '1', result: result });
  });



});

router.route('/get_broadcast_message_template').get(function (req, res) {

  var module = req.query.module;
  var sql = "SELECT * FROM `broadcast_module` where flag=1 and module='" + module + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    // console.log("1 record deleted");
    return res.status(200).json({ success: '1', result: result });
  });



});

router.route('/up_bc_status').get(async  function (req, res) {

  var id = req.query.id;
  
   await updatebroadcaststatus(id);
  setTimeout(() => {
    return res.status(200).json({ success: '1',msg:'broad cast status update'});

  }, 1000);
  
});
 async function updatebroadcaststatus(id)
{
    var sql = "SELECT * from log_broadcast where statusval='Success' and statusmessage='' and eid="+ id +"";
    db.query(sql, function (err, result) {

        result.forEach( async function (element) {
         
            try
            {
           await axios.get('https://api.in.freshchat.com/v2/outbound-messages?request_id=' + element.request_id, {
                // Name: 'Fred',
                // Age: '23' 
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json;charset=utf-8',
                }
              })
                .then(function (response1) {
                  try
                  {
                  console.log(response1.data.outbound_messages[0].status);
                  var statusmessage=response1.data.outbound_messages[0].status;
                  if(response1.data.outbound_messages[0].status=="FAILED")
                    statusmessage=statusmessage+" "+response1.data.outbound_messages[0].failure_reason;

                  statusmessage=statusmessage.replace(/'/g, "");

                  // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
                  var sql = "update log_broadcast set statusmessage='" + statusmessage + "' WHERE request_id='" + element.request_id + "'";
                  db.query(sql, function (err, result) {
      
                  });
                }
                catch(e)

                {}
                })
              }
                catch(e)

                {}
             
        });
        
      
      
    });
}

router.route('/update_broadcast').post(upload.fields([{
  name: 'imagepath_file', maxCount: 1
}, {
  name: 'filepath_file', maxCount: 1
}]), function (req, res) {

  var set = "";
  if (req.body.message != "") {
    var message = req.body.message;
    if (set == "") { set += " message ='" + message + "' " } else { set += ", message ='" + message + "' " }
  }

  if (req.body.groupid != "") {
    var groupid = req.body.groupid;
    if (set == "") { set += " groupid ='" + groupid + "' " } else { set += ", groupid ='" + groupid + "' " }
  }



  if (req.body.medium != "") {
    var medium = req.body.medium;
    if (set == "") { set += " medium ='" + medium + "' " } else { set += ", medium ='" + medium + "' " }
  }


  if (req.body.module) {
    var module = req.body.module;
    if (set == "") { set += " module ='" + module + "' " } else { set += ", module ='" + module + "' " }
  }

  if (req.body.message_template) {
    var message_template = req.body.message_template;
    if (set == "") { set += " message_template ='" + message_template + "' " } else { set += ", message_template ='" + message_template + "' " }
  }

  if (req.body.eventid) {
    var eventid = req.body.eventid;
    if (set == "") { set += " eventid ='" + eventid + "' " } else { set += ", eventid ='" + eventid + "' " }
  }

  if (req.files.imagepath_file) {
    var imagepath_file = req.files.imagepath_file[0].filename;
    if (set == "") { set += " imagepath ='" + imagepath_file + "' " } else { set += ", imagepath ='" + imagepath_file + "' " }
  }
  if (req.files.filepath_file) {
    var filepath_file = req.files.filepath_file[0].filename;
    if (set == "") { set += " filepath ='" + filepath_file + "' " } else { set += ", filepath ='" + filepath_file + "' " }

  }
  var id = req.body.id;
  var sql = " UPDATE broadcast_detail  SET " + set + " WHERE id='" + id + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    send_broadcast(id, '');
    return res.status(200).json({ success: '1', response: result, sql: sql });
  });

});


async function send_broadcast(broadcastid, limit) {
  // var path1=path.join(__dirname , "uploads","broadcast");

  var path1 = "https://webapi.madrascricketclub.org/broadcast/";

  var sql = "SELECT module,eventid,message_template,message,medium,groupid,imagepath,filepath,event_name,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y') as event_date FROM `broadcast_detail` b left join events e on b.eventid=e.id where b.id='" + broadcastid + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    var imagepath = result[0].imagepath;
    var filepath = result[0].filepath;
    var message = result[0].message;
    var groupid = result[0].groupid;
    var medium = result[0].medium;
    var module = result[0].module;
    var message_template = result[0].message_template;
    var eventid = result[0].eventid;
    var event_name = result[0].event_name;
    var event_image = result[0].event_image;
    var event_date = result[0].event_date;
    var condition = "";
    if (groupid) {

      if (groupid == "all") {
        // condition = condition + " where a.member_code not in('MIC@ADMIN2')";
        condition = condition + " ";
      }
      else if (groupid == "admin") {
        // condition = condition + "where a.member_code in ('MIC@ADMIN2','RL01','SAS2022','P074')";
        condition = condition + "where a.member_code in ('SAS2022','RL01')";
      }
      else
        condition = condition + " where " + groupid + "='1'";

      // if (medium == "WA") {

      //     if (module == 'Event' && message_template == 'Launch') {
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'MIC@ADMIN2', '9710744221', 'sysadmin@madrascricketclub.org', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'P074', '9840013027', 'prasad.shree@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'K069', '9790908607', 'mkmoorthy@yahoo.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'R184', '9791012253', 'rishikesh.karra@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');

      //     }

      //     else if (module == 'Event' && message_template == 'Open') {
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'MIC@ADMIN2', '9710744221', 'sysadmin@madrascricketclub.org', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'P074', '9840013027', 'prasad.shree@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'K069', '9790908607', 'mkmoorthy@yahoo.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'R184', '9791012253', 'rishikesh.karra@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');

      //     }

      //     else if (module == 'Event' && message_template == 'Highlights') {
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'MIC@ADMIN2', '9710744221', 'sysadmin@madrascricketclub.org', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'P074', '9840013027', 'prasad.shree@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'K069', '9790908607', 'mkmoorthy@yahoo.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
      //         broadcast_sendwhatsapp(broadcastid, event_name, 'R184', '9791012253', 'rishikesh.karra@gmail.com', message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
      //     }

      // }

      //  var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in ('RL01','SAS2023','SAS2023') order by a.member_code  "+limit;
      var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email,pin FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition + "  order by a.id  " + limit;
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code not in('P074','MIC@ADMIN2','K069','R184') order by a.member_code  "+limit;
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition +"";
      // var sql="SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in('MIC@ADMIN1','RL01','SAS2023','P074','MIC@ADMIN2')";
      db.query(sql, function (err, resultsports) {

        resultsports.forEach(function (element) {
          console.log(element)
          setTimeout(async() => {
            if (medium == "WA") {

              if (module == 'Event' && message_template == 'Launch')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
                event_launch(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);

              else if (module == 'Event' && message_template == 'Open')
                event_open_new(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
              else if (module == 'Event' && message_template == 'Highlights')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
                event_highlight(element.mobile_no, event_name, path1 + imagepath, element.member_code, event_date, broadcastid);
              // broadcast_sendwhatsapp(broadcastid,event_name,element.member_code,"9841200531","sowjanya@lokas.in",message,"https://webapistaging.madrascricketclub.org/eventsimg/"+event_image,event_image,path1+filepath,filepath,'/dev/event/highlights');
              else if (module == 'Event' && message_template == 'Info')
                event_info(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General')
                general_info(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-pdf')
                general_info_document(element.mobile_no, message, path1 + filepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-Nomessage')
                await general_info_nomessage(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General-Pin' && message_template == 'General-Pin')
                general_pin_info(element.mobile_no, element.pin, path1 + filepath, element.member_code, broadcastid);

            }
            else if (medium == "EM") {

              broadcast_sendemail(broadcastid, element.first_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath);
              // broadcast_sendemail(broadcastid,element.first_name,element.member_code,"9841200531","sowjanya@lokas.in",message,path1+imagepath,imagepath,path1+filepath,filepath);
            }
          }, 2000);


        });
      });




    }
    // return res.status(200).send({ success: 1, result: result });
  });
}


function send_broadcastadmin(broadcastid) {
  // var path1=path.join(__dirname , "uploads","broadcast");

  var path1 = "https://webapi.madrascricketclub.org/broadcast/";

  var sql = "SELECT module,eventid,message_template,message,medium,groupid,imagepath,filepath,event_name,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y') as event_date FROM `broadcast_detail` b left join events e on b.eventid=e.id where b.id='" + broadcastid + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    var imagepath = result[0].imagepath;
    var filepath = result[0].filepath;
    var message = result[0].message;
    var groupid = result[0].groupid;
    var medium = result[0].medium;
    var module = result[0].module;
    var message_template = result[0].message_template;
    var eventid = result[0].eventid;
    var event_name = result[0].event_name;
    var event_image = result[0].event_image;
    var event_date = result[0].event_date;
    var condition = "";
    var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email,pin FROM members a left join `member_sports` b on a.member_code=b.member_code where a.member_code in('RL01','MIC@ADMIN2')  order by a.id  ";
    // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code not in('P074','MIC@ADMIN2','K069','R184') order by a.member_code  "+limit;
    // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition +"";
    // var sql="SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in('MIC@ADMIN1','RL01','SAS2023','P074','MIC@ADMIN2')";
    db.query(sql, function (err, resultsports) {

      resultsports.forEach(function (element) {
        console.log(element)
        setTimeout(() => {
          if (medium == "WA") {

            if (module == 'Event' && message_template == 'Launch')
              // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
              event_launch(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);

            else if (module == 'Event' && message_template == 'Open')
              event_open_new(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
            // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
            else if (module == 'Event' && message_template == 'Highlights')
              // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
              event_highlight(element.mobile_no, event_name, path1 + imagepath, element.member_code, event_date, broadcastid);
            // broadcast_sendwhatsapp(broadcastid,event_name,element.member_code,"9841200531","sowjanya@lokas.in",message,"https://webapistaging.madrascricketclub.org/eventsimg/"+event_image,event_image,path1+filepath,filepath,'/dev/event/highlights');
            else if (module == 'Event' && message_template == 'Info')
              event_info(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
            else if (module == 'General' && message_template == 'General')
              general_info(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
            else if (module == 'General' && message_template == 'General-pdf')
              general_info_document(element.mobile_no, message, path1 + filepath, element.member_code, broadcastid);
            else if (module == 'General' && message_template == 'General-Nomessage')
              general_info_nomessage(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
            else if (module == 'General-Pin' && message_template == 'General-Pin')
              general_pin_info(element.mobile_no, element.pin, path1 + filepath, element.member_code, broadcastid);

          }
          else if (medium == "EM") {

            broadcast_sendemail(broadcastid, element.first_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath);
            // broadcast_sendemail(broadcastid,element.first_name,element.member_code,"9841200531","sowjanya@lokas.in",message,path1+imagepath,imagepath,path1+filepath,filepath);
          }
        }, 2000);


      });
    });
   
    // return res.status(200).send({ success: 1, result: result });
  });
}
router.route('/send_admin_broadcast').get(function (req, res) {

  var broadcastid = req.query.id;
  send_broadcastadmin(broadcastid);
  setTimeout(() => {
    return res.status(200).send({ success: 1 });
  }, 10000);

});

router.route('/send_fail_member_broadcast').get(function (req, res) {

  var broadcastid = req.query.id;
  send_fail_member(broadcastid);
  setTimeout(() => {
    return res.status(200).send({ success: 1 });
  }, 10000);

});

function send_fail_member(broadcastid) {
  var path1 = "https://webapi.madrascricketclub.org/broadcast/";

  var sql = "SELECT module,eventid,message_template,message,medium,groupid,imagepath,filepath,event_name,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y') as event_date FROM `broadcast_detail` b left join events e on b.eventid=e.id where b.id='" + broadcastid + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    var imagepath = result[0].imagepath;
    var filepath = result[0].filepath;
    var message = result[0].message;
    var groupid = result[0].groupid;
    var medium = result[0].medium;
    var module = result[0].module;
    var message_template = result[0].message_template;
    var eventid = result[0].eventid;
    var event_name = result[0].event_name;
    var event_image = result[0].event_image;
    var event_date = result[0].event_date;
    var condition = "";
    if (groupid) {

      if (groupid == "all") {
        condition = condition + "";
      }
      else if (groupid == "admin") {
        condition = condition + "where a.member_code in ('MIC@ADMIN2','RL01','SAS2022','P074')";
      }
      else
        condition = condition + " where " + groupid + "='1'";


      //  var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in ('RL01','SAS2023','SAS2023') order by a.member_code  "+limit;
      var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email,pin FROM members a left join `member_sports` b on a.member_code=b.member_code where a.member_code in(select source_id from log_broadcast where eid='" + broadcastid + "' and statusval='Failed')"
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code not in('P074','MIC@ADMIN2','K069','R184') order by a.member_code  "+limit;
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition +"";
      // var sql="SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in('MIC@ADMIN1','RL01','SAS2023','P074','MIC@ADMIN2')";
      db.query(sql, function (err, resultsports) {

        resultsports.forEach(function (element) {
          console.log(element)
          setTimeout(() => {
            if (medium == "WA") {

              if (module == 'Event' && message_template == 'Launch')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
                event_launch(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);

              else if (module == 'Event' && message_template == 'Open')
                event_open_new(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
              else if (module == 'Event' && message_template == 'Highlights')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
                event_highlight(element.mobile_no, event_name, path1 + imagepath, element.member_code, event_date, broadcastid);
              // broadcast_sendwhatsapp(broadcastid,event_name,element.member_code,"9841200531","sowjanya@lokas.in",message,"https://webapistaging.madrascricketclub.org/eventsimg/"+event_image,event_image,path1+filepath,filepath,'/dev/event/highlights');
              else if (module == 'Event' && message_template == 'Info')
                event_info(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General')
                general_info(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-pdf')
                general_info_document(element.mobile_no, message, path1 + filepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-Nomessage')
                general_info_nomessage(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General-Pin' && message_template == 'General-Pin')
                general_pin_info(element.mobile_no, element.pin, path1 + filepath, element.member_code, broadcastid);

            }
            else if (medium == "EM") {

              broadcast_sendemail(broadcastid, element.first_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath);
              // broadcast_sendemail(broadcastid,element.first_name,element.member_code,"9841200531","sowjanya@lokas.in",message,path1+imagepath,imagepath,path1+filepath,filepath);
            }
          }, 2000);


        });
      });




    }
    // return res.status(200).send({ success: 1, result: result });
  });


}

router.route('/send_relation_member_broadcast').get(function (req, res) {

  var broadcastid = req.query.id;
  send_relation_member(broadcastid);
  setTimeout(() => {
    return res.status(200).send({ success: 1 });
  }, 10000);

});

function send_relation_member(broadcastid) {
  var path1 = "https://webapi.madrascricketclub.org/broadcast/";

  var sql = "SELECT module,eventid,message_template,message,medium,groupid,imagepath,filepath,event_name,event_image,DATE_FORMAT(event_date_from,'%d-%b-%Y') as event_date FROM `broadcast_detail` b left join events e on b.eventid=e.id where b.id='" + broadcastid + "'";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    var imagepath = result[0].imagepath;
    var filepath = result[0].filepath;
    var message = result[0].message;
    var groupid = result[0].groupid;
    var medium = result[0].medium;
    var module = result[0].module;
    var message_template = result[0].message_template;
    var eventid = result[0].eventid;
    var event_name = result[0].event_name;
    var event_image = result[0].event_image;
    var event_date = result[0].event_date;
    var condition = "";
    

      if (groupid == "all") {
        condition = condition + "";
      }
      else if (groupid == "admin") {
        condition = condition + "where a.member_code in ('RL02')";
      }
      else
        condition = condition + " where " + groupid + "='1'";


      //  var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in ('RL01','SAS2023','SAS2023') order by a.member_code  "+limit;
      var sql = "SELECT a.member_code as member_code,first_name,relation_no as mobile_no,email,pin FROM members a left join `member_sports` b on a.member_code=b.member_code where a.relation_no<>''"
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code not in('P074','MIC@ADMIN2','K069','R184') order by a.member_code  "+limit;
      // var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition +"";
      // var sql="SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code  where a.member_code in('MIC@ADMIN1','RL01','SAS2023','P074','MIC@ADMIN2')";
      db.query(sql, function (err, resultsports) {

        resultsports.forEach(function (element) {
          console.log(element)
          setTimeout(() => {
            if (medium == "WA") {

              if (module == 'Event' && message_template == 'Launch')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
                event_launch(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);

              else if (module == 'Event' && message_template == 'Open')
                event_open_new(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/open', '');
              else if (module == 'Event' && message_template == 'Highlights')
                // broadcast_sendwhatsapp(broadcastid, event_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/highlights', event_date);
                event_highlight(element.mobile_no, event_name, path1 + imagepath, element.member_code, event_date, broadcastid);
              // broadcast_sendwhatsapp(broadcastid,event_name,element.member_code,"9841200531","sowjanya@lokas.in",message,"https://webapistaging.madrascricketclub.org/eventsimg/"+event_image,event_image,path1+filepath,filepath,'/dev/event/highlights');
              else if (module == 'Event' && message_template == 'Info')
                event_info(element.mobile_no, event_name, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General')
                general_info(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-pdf')
                general_info_document(element.mobile_no, message, path1 + filepath, element.member_code, broadcastid);
              else if (module == 'General' && message_template == 'General-Nomessage')
                general_info_nomessage(element.mobile_no, message, path1 + imagepath, element.member_code, broadcastid);
               else if (module == 'General-Pin' && message_template == 'General-Pin')
              general_pin_info(element.mobile_no, element.pin, path1 + filepath, element.member_code, broadcastid);

            }
            else if (medium == "EM") {

              broadcast_sendemail(broadcastid, element.first_name, element.member_code, element.mobile_no, element.email, message, path1 + imagepath, imagepath, path1 + filepath, filepath);
              // broadcast_sendemail(broadcastid,element.first_name,element.member_code,"9841200531","sowjanya@lokas.in",message,path1+imagepath,imagepath,path1+filepath,filepath);
            }
          }, 2000);


        });
      });




    
    // return res.status(200).send({ success: 1, result: result });
  });


}
router.route('/sent_broadcast_tomemeber').get(function (req, res) {


  var broadcastid = req.query.broadcastid;

  // var path1=path.join(__dirname , "uploads","broadcast");
  var path1 = "https://webapi.madrascricketclub.org/broadcast/";

  var sql = "SELECT * FROM broadcast_detail WHERE id='" + broadcastid + "' ";
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });
    var imagepath = result[0].imagepath;
    var filepath = result[0].filepath;
    var message = result[0].message;
    var groupid = result[0].groupid;
    var medium = result[0].medium;
    var condition = "";
    if (groupid) {

      if (groupid == "all") {
        condition = condition + "";
      }
      else if (groupid == "admin") {
        condition = condition + "where a.member_code in ('MIC@ADMIN2','RL01','SAS2022','P074')";
      }
      else
        condition = condition + " where " + groupid + "='1'";

      var sql = "SELECT a.member_code as member_code,first_name,mobile_no,email FROM members a left join `member_sports` b on a.member_code=b.member_code " + condition + " ";
      db.query(sql, function (err, resultsports) {

        resultsports.forEach(function (element) {
          console.log(element)
          if (medium == "WA") {
            broadcast_sendwhatsapp(broadcastid, element.first_name, element.member_code, "9841200531", "sowjanya@lokas.in", message, path1 + imagepath, imagepath, path1 + filepath, filepath, '/dev/event/launch', '');
          }
          else if (medium == "EM") {

            // broadcast_sendemail(broadcastid,element.first_name,element.member_code,element.mobile_no,element.email,element.message,element.imagepath,element.imagepath,element.filepath,element.filepath);
            broadcast_sendemail(broadcastid, element.first_name, element.member_code, "9841200531", "sowjanya@lokas.in", message, path1 + imagepath, imagepath, path1 + filepath, filepath);
          }

        });
      });

    }
    return res.status(200).send({ success: 1, result: result });
  });


});


function broadcast_sendemail(id, name, member_code, number, email, message, imageurl, imagename, fileurl, filename) {

  const data = JSON.stringify({
    'number': number,
    'name': name,
    'code': member_code,
    'id': id,
    'email': email,
    'message': message,
    'imageurl': imageurl,
    'imagename': imagename,
    'fileurl': fileurl,
    'filename': filename


  });

  const options = {
    url: 'https://7bh2kfhirc.execute-api.ap-northeast-1.amazonaws.com/dev/broadcast-email',
    json: true,
    body: {
      'number': number,
      'name': name,
      'code': member_code,
      'id': id,
      'email': email,
      'message': message,
      'imageurl': imageurl,
      'imagename': imagename,
      'fileurl': fileurl,
      'filename': filename
    }
  };

  request.post(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Status: ${res.statusCode}`);
    console.log(body);
  });


}
function broadcast_sendwhatsapp(id, name, member_code, number, email, message, imageurl, imagename, fileurl, filename, whattype, event_date) {

  const data = JSON.stringify({
    'number': '0',
    'name': name,
    'member_code': member_code,
    'id': id,
    'email': email,
    'message': message,
    'imageurl': imageurl,
    'imagename': imagename,
    'fileurl': fileurl,
    'filename': filename,
    'edate': event_date



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



}


async function event_launch(number, name, imageurl, member_code, eid) {


  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "event_launch",
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
                "data": "9710933360"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-event-launch','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-event-launch','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}

async function event_open(number, name, imageurl, member_code, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "event_open",
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
                "data": "9710933360"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-event-open','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-event-open','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}
async function event_open_new(number, name, imageurl, member_code, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "mcc_event_registernew",
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
                "data": "9710933360"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-event-open','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-event-open','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}
async function event_highlight(number, name, imageurl, member_code, edate, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "event_highlights",
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
                "data": edate
              },
              {
                "data": "9710933360"
              },
              {
                "data": member_code
              },

            ]
          }
        }
      }
    }
  };
  axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-event-highlight','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-event-highlight','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}
async function event_info(number, name, imageurl, member_code, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "mcc_event_onlyinfo",
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
                "data": "9710933360"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-event-info','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-event-info','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}

async function general_info(number, name, imageurl, member_code, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });


  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "mcc_general",
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
                "data": "9710744221"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-General','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-General','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}

async function general_pin_info(number, name, imageurl, member_code, eid) {
  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });
  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "general_pdf",
        "language": {
          "policy": "deterministic",
          "code": "en"
        },
        "rich_template_data": {
          "header": {
            "type": "document",
            "media_url": imageurl,
          },
          "body": {
            "params": [
              {
                "data": "Your PIN for use in Member Web Portal is "+name
              },
              {
                "data": "9710744221"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-General-Pin','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-General-Pin','MCC','" + member_code + "','FAILED','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}
async function general_info_document(number, name, imageurl, member_code, eid) {

  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "general_pdf",
        "language": {
          "policy": "deterministic",
          "code": "en"
        },
        "rich_template_data": {
          "header": {
            "type": "document",
            "media_url": imageurl,
          },
          "body": {
            "params": [
              {
                "data": name
              },
              {
                "data": "9710744221"
              },
              {
                "data": member_code
              },
            ]
          }
        }
      }
    }
  };
  await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {
      //  console.log(response);
      // loginsert(member_code,number,response.data.status,"whatsapp-event-launch-"+id,"Success","MCC");
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-General','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });

    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-General','MCC','" + member_code + "','Fail','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });
    });
}

async function general_info_nomessage(number, name, imageurl, member_code, eid) {
  var sqldel = "delete from log_broadcast  where eid='" + eid + "' and source_id='" + member_code + "'";
  db.query(sqldel, function (err, result) {

  });

  const params = {
    "from": {
      "phone_number": "+919966463000"
    },
    "to": [
      {
        "phone_number": "+91" + number
      }
    ],
    "data": {
      "message_template": {
        "storage": "conversation",
        "namespace": "99045416_49f0_43b3_818a_2ce210b1c526",
        "template_name": "mcc_general_member_update",
        "language": {
          "policy": "deterministic",
          "code": "en"
        },
        "rich_template_data": {
          "header": {
            "type": "image",
            "media_url": imageurl,
          }
        }
      }
    }
  };
  var response = await axios.post('https://api.in.freshchat.com/v2/outbound-messages/whatsapp', params, {
    // Name: 'Fred',
    // Age: '23' 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    }
  })
    .then(function (response) {

      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid,request_id) VALUES ('" + response.data.status + "','Whatsapp-General-Nomessage','MCC','" + member_code + "','Success','" + number + "','" + eid + "','" + response.data.request_id + "')";
      db.query(sql, function (err, result) {

      });



    }).catch((err) => {
      var sql = "INSERT INTO log_broadcast (message,modeval,sourceval,source_id,statusval,to_number,eid) VALUES ('" + err.message + "','Whatsapp-General-Nomessage','MCC','" + member_code + "','FAILED','" + number + "','" + eid + "')";
      db.query(sql, function (err, result) {

      });




    });
}

router.route('/select_member_sports').get(function (req, res) {


  var billiards = req.query.billiards;
  var badminton = req.query.badminton;

  var cricket = req.query.cricket;
  var hockey = req.query.hockey;

  var squash = req.query.squash;
  var tennis = req.query.tennis;

  var swimming = req.query.swimming;
  var condition = "";

  if (billiards == "1")
    condition = condition + " AND billiards='1'"

  if (badminton == "1")
    condition = condition + " AND badminton='1'"

  if (cricket == "1")
    condition = condition + " AND cricket='1'"
  if (hockey == "1")
    condition = condition + " AND hockey='1'"
  if (squash == "1")
    condition = condition + " AND squash='1'"
  if (tennis == "1")
    condition = condition + " AND tennis='1'"
  if (swimming == "1")
    condition = condition + " AND swimming='1'"



  var sql = "SELECT * FROM members a,`member_sports` b where a.member_code=b.member_code " + condition;
  db.query(sql, function (err, result) {
    if (err) return res.status(401).send({ error: err.message });

    return res.status(200).send({ success: 1, result: result });
  });


});

module.exports = router;