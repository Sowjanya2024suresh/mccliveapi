const sql = require('mssql')  
const config = {  
// user: 'Dwadmin',  
// password: 'MCC_dw@2023',  
// server: "192.168.1.75",  
// database: "mcc_warehouse"  ,
// options: {
//     instanceName: 'MSSQLSERvER'
// }

server: '115.97.253.88', // assign your host name
	user: 'Dwadmin',      //  assign your database username
	password: 'MCC_dw@2023',      // assign your database password
	database: 'mcc_warehouse',
	port: 1433,
	trustServerCertificate: true
// server: 'localhost', // assign your host name
// user: 'sa',      //  assign your database username
// password: 'sowjanya',      // assign your database password
// database: 'Test',
// port: 1433,
// trustServerCertificate: true
}  
// const poolPromise = new sql.ConnectionPool(config)  
// .connect()  
// .then(pool => {  
// console.log('Connected to MSSQL')  
// return pool  
// })  
// .catch(err => console.log('Database Connection Failed! Bad Config: ', err))  
// module.exports = {  
// sql, poolPromise  
// }  

sql.connect(config, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("{ db_Connected! }");
        new sql.Request().query("INSERT INTO rest_order (order_id, member_code,delivery_address,order_status,order_time,total_items, final_price, price) VALUES   ('1','RL01','','1','','2','500','500')").then ( function (err, result) {
            // ...
            if (err)
            console.log(err);
          });

        new sql.Request().query("SELECT * FROM rest_order").then(function (recordset) {
            console.log(recordset);
            sql.close();
        })
       
        module.exports = sql;
    }    
    // Write queries here  

});

module.exports = sql;