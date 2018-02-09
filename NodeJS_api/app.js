//**********关于网站和接口**********
var express = require("express");
var bodyParser = require('body-parser');
var selectData = require("./db.js").selectData;
var insertData = require("./db.js").insertData;

var app = express();

//设备类型对应表
var DEVICE_ID = {
    temp1: 1,    //温度
    humi1: 2,    //湿度
    relay1: 3    //继电器
};
//触发器配置
var triggerBundle = {
    triggerMax: 50,
    triggerMin: 10
};

//静态化public文件夹下的网页
app.use(express.static("./public"));

app.get("/:datanum/:deviceid", function (req, res) {
    var data_num = req.params.datanum;
    var device_id = req.params.deviceid;
    // console.log(data_num + " " + device_id);
    //sql相关的变量
    var sql = "";
    var sqlDataNum;
    var sqlDeviceName;
    var sqlTableName;
    //**********操作DB**********
    //单个数据：http://127.0.0.1:3000/1data/1
    if ("1data" === data_num) {
        sqlDataNum = 1;
    }
    //多个数据：http://127.0.0.1:3000/ndata/1
    else if ("ndata" === data_num) {
        sqlDataNum = 10;
    }
    switch (parseInt(device_id)) {
        case DEVICE_ID.temp1:
            // console.log("TEMP");
            sqlDeviceName = "temp1";
            sqlTableName = "sensor";
            break;
        case DEVICE_ID.humi1:
            // console.log("HUMI");
            sqlDeviceName = "humi1";
            sqlTableName = "sensor";
            break;
        case DEVICE_ID.relay1:
            // console.log("RELAY");
            sqlDeviceName = "relay1";
            sqlTableName = "actuator";
            break;
    }
    //*****拼接SQL*****
    sql = "SELECT createtime,dvalue FROM " + sqlTableName + " WHERE dname = '" + sqlDeviceName + "' ORDER BY createtime DESC LIMIT " + sqlDataNum;
    // console.log(sql);//SELECT * FROM sensor WHERE dname = 'temp1' ORDER BY createtime DESC LIMIT 1
    //*****执行SQL*****
    selectData(sql, function (err, data) {
        console.log("selectData OK " + sqlDataNum);
        // console.log(data[0].createtime.toLocaleString());
        res.end(JSON.stringify(data));
        // console.log(JSON.stringify(data));
    });
});

app.post('/1data/:deviceid', bodyParser(), function (req, res) {
    var device_id = req.params.deviceid;
    // console.log(JSON.stringify(req.params) + " " + JSON.stringify(req.body));
    //sql相关的变量
    var sql = "";
    var sqlDeviceName;
    var sqlDeviceValue;
    var sqlTableName;
    var sqlCreateTime = new Date().toLocaleString();
    //**********操作DB**********
    //Postman调试用
    if (req.body.value) {
        sqlDeviceValue = req.body.value;
    }
    //下位机上传数据
    else {
        //不知道为什么，下位机传上来的数据是{ '{"value":66}': '' }，目前处理的方法是截取字符串再转回Json
        //DData → DStr → DJson
        // { '{"value":66}': '' } → {\"value\":66} → { value: 66 }
        DData = req.body;
        DStr = JSON.stringify(DData).substring(2, 16);
        DJson = JSON.parse(DStr.replace("\\", "").replace("\\", ""));
        console.log(">>>" + DData + " " + DStr + " " + DJson);
        sqlDeviceValue = DJson.value;
    }
    switch (parseInt(device_id)) {
        case DEVICE_ID.temp1:
            // console.log("TEMP");
            sqlDeviceName = "temp1";
            sqlTableName = "sensor";
            break;
        case DEVICE_ID.humi1:
            // console.log("HUMI");
            sqlDeviceName = "humi1";
            sqlTableName = "sensor";
            break;
        case DEVICE_ID.relay1:
            // console.log("RELAY");
            sqlDeviceName = "relay1";
            sqlTableName = "actuator";
            break;
    }
    //传感器与执行器表结构不一样，故需分开来写
    //传感器
    if ("sensor" === sqlTableName) {
        sqlPara = { dname: sqlDeviceName, dvalue: sqlDeviceValue, createtime: sqlCreateTime };
        sql = "INSERT INTO " + sqlTableName + " SET ?";
        // console.log(sql);
        // console.log(sqlPara);
        //*****执行SQL*****
        insertData(sql, sqlPara, function (err, data) {
            console.log("insertData OK 1");
            // console.log(data);
            res.send("OKK");
        });
    }
    //执行器
    else if ("actuator" === sqlTableName) {
        sqlPara = { dname: sqlDeviceName, dvalue: sqlDeviceValue, createtime: sqlCreateTime, triggermode: "1" };
        //triggermode 1：前台按钮触发；2：触发器根据阈值触发
        sql = "INSERT INTO " + sqlTableName + " SET ?";
        // console.log(sql);
        // console.log(sqlPara);
        //*****执行SQL*****
        insertData(sql, sqlPara, function (err, data) {
            console.log("insertData OK 1");
            // console.log(data);
            res.send("OKK");
        });
    }
});

app.post('/postTrigger', bodyParser(), function (req, res) {
    // console.log(req.body);
    triggerBundle.triggerMax = req.body.maxNum;
    triggerBundle.triggerMin = req.body.minNum;
    console.log(">>>postTrigger:" + triggerBundle.triggerMax + ';' + triggerBundle.triggerMin);
    res.send(triggerBundle.triggerMax + ';' + triggerBundle.triggerMin);
    //查询当前湿度
    var sql = "SELECT * FROM sensor WHERE dname = 'humi1' ORDER BY createtime DESC LIMIT 1";
    var sqlPara = {};
    selectData(sql, function (err, data) {
        console.log("selectData humi Trigger");
        var curHumi = data[0].dvalue;
        console.log("curHumi=" + curHumi);
        //湿度高于triggerMax，继电器关闭
        if (parseInt(curHumi) > parseInt(triggerBundle.triggerMax)) {
            //先查询当前继电器状态，若与欲插入的数据相同，则不插入
            sql = "SELECT * FROM actuator WHERE dname = 'relay1' ORDER BY createtime DESC LIMIT 1";
            selectData(sql, function (err, data) {
                console.log("selectData relay Trigger");
                var curRelay = data[0].dvalue;
                console.log("curRelay=" + curRelay);
                // 若与欲插入的数据不同，则插入
                if (curRelay != "0") {
                    sqlPara = { dname: "relay1", dvalue: 0, createtime: new Date().toLocaleString(), triggermode: "2" };
                    sql = "INSERT INTO actuator SET ?";
                    insertData(sql, sqlPara, function (err, data) {
                        console.log("insertData Trigger 0");
                        console.log(data);
                    });
                }
            });
        }
        //湿度低于triggerMin，继电器打开
        else if (parseInt(curHumi) < parseInt(triggerBundle.triggerMin)) {
            //先查询当前继电器状态，若与欲插入的数据相同，则不插入
            sql = "SELECT * FROM actuator WHERE dname = 'relay1' ORDER BY createtime DESC LIMIT 1";
            selectData(sql, function (err, data) {
                console.log("selectData relay Trigger");
                var curRelay = data[0].dvalue;
                console.log("curRelay=" + curRelay);
                // 若与欲插入的数据不同，则插入
                if (curRelay != "1") {
                    sqlPara = { dname: "relay1", dvalue: 1, createtime: new Date().toLocaleString(), triggermode: "2" };
                    //triggermode 1：前台按钮触发；2：触发器根据阈值触发
                    sql = "INSERT INTO actuator SET ?";
                    insertData(sql, sqlPara, function (err, data) {
                        console.log("insertData Trigger 1");
                        console.log(data);
                    });
                }
            });
        }
    });
});

app.listen(3000, function () {
    console.log("应用实例，访问地址为 http://127.0.0.1:3000/");
});

