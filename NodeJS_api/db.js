//封装操作Mysql的函数
var mysql = require('mysql');
var auth = {
    host: 'localhost',  //主机名
    user: 'root',       //用户
    password: 'root',   //密码
    database: 'iotyd',    //数据库名
    port: '3306'        //端口号
};

//**********查询 Select**********
// SELECT * from users
selectData = function (sql, cb) {
    var connection = mysql.createConnection(auth);
    connection.connect();   //建立连接
    connection.query(sql, function (err, rows, fields) {
        if (err) throw err;
        connection.end();   //关闭连接
        // console.log(rows); //rows[0].svalue
        cb(err, rows);      //起到return的作用
    });
}

//**********插入 Insert**********
// INSERT INTO sensor(sname, svalue, createtime) VALUES('temp1', 66.66, NOW());
insertData = function (sql, sqlPara, cb) {
    var connection = mysql.createConnection(auth);
    connection.connect();
    connection.query(sql, sqlPara, function (err, result) {
        if (err) throw err;
        connection.end();
        // console.log(result);
        cb(err, result);
    });
};


exports.selectData = selectData;
exports.insertData = insertData;