var mysql = require('mysql');
// var conn = mysql.createConnection({
//   host: 'localhost', // assign your host name
//   user: 'root',      //  assign your database username
//   password: 'igiver@2021',      // assign your database password
//   database: 'ngoapp',// assign database Name
//   port:'2222'
// }); Ha=7QJ1=sbg+
// 

//UAT Connection

// var conn = mysql.createConnection({
//   host: '13.235.39.247', // assign your host name
//   user: 'root',      //  assign your database username
//   password: 'Mcc@2021',      // assign your database password
//   database: 'admin_portal',// assign database Name  
//   port:3306
// }); 

/* var conn = mysql.createConnection({
  host: '204.11.59.195', // assign your host name
  user: 'lokashxg_mccuser',      //  assign your database username
  password: 'mccpassword',      // assign your database password
  database: 'lokashxg_mcc',// assign database Name  
  port:3306,
  dateStrings: true
});  */

var conn = mysql.createConnection({
  host: 'localhost', // assign your host name
  user: 'root',      //  assign your database username
  password: 'Mcc@2022',      // assign your database password
  database: 'mccnewportal',// assign database Name  
  port:3306,
  dateStrings: true
});
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;