//**********关于网站和接口**********
var express = require("express");
var bodyParser = require('body-parser');

var app = express();

//静态化public文件夹下的网页
app.use(express.static("./public"));

app.get("/api/:id", function (req, res) {
    var API_ID = req.params.id;
    console.log(API_ID);
    res.send("{a:open}");
});

//**********关于前台post数据**********
//接收 由前台“确认”按钮，通过ajax提交的触发器配置信息
app.post('/api/1', bodyParser(), function (req, res) {
    //不知道为什么，下位机传上来的数据是{ '{"value":66}': '' }，目前处理的方法是截取字符串再转回Json
    //DData → DStr → DJson
    // { '{"value":66}': '' } → {\"value\":66} → { value: 66 }
    DData = req.body;
    DStr = JSON.stringify(DData).substring(2, 16);
    DJson = JSON.parse(DStr.replace("\\", "").replace("\\", ""));
    console.log(DJson.value);
    res.send("OKK");
});

app.listen(3000, function () {
    console.log("应用实例，访问地址为 http://127.0.0.1:3000/");
});

