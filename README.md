# iot
详见本人博客[Arduino+Node.js实现物联网](https://xgyopen.github.io/2018/02/10/2018-02-10-project-iot/)。

代码说明：
/Arduino_api

    单片机端代码（感知层），包含读取温湿度数据、上传数据至服务器、驱动继电器开关等。

/NodeJS_api

    服务器端代码（应用层），包含接收单片机数据并保存至数据库、接收前台请求并向单片机端发送命令、提供RESTful API等。

IOT_YD.apk

    安卓客户端，本质上是嵌入了IP地址的Web浏览器。

/demo

	用于单元测试的最小系统，包含单片机端和服务器端。