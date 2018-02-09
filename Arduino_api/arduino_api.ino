#include <SPI.h>
#include <Ethernet.h>
#include <dht11.h>

#define DHT11PIN  6   //DHT11 out引脚
#define RELAYPIN  5   //继电器 控制引脚

//设备类型对应表
struct DEVICE_ID {
  int temp = 1;
  int humi = 2;
  int relay = 3;
};

DEVICE_ID deviceId;
dht11 DHT11;

//设置Arduino的Mac地址
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED
  //  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0x3D
};

//家里局域网电脑为主机：192.168.31.242、虚拟机：192.168.100.134（没成功）、扬大公网：58.192.138.25
char serverIp[] = "58.192.138.25";    // 服务器的IP
int serverPort = 80;

//家里局域网：192.168.31.200、扬大校内局域网：192.168.63.2
IPAddress ip(192, 168, 63, 2); //动态分配IP失败时使用的静态IP

EthernetClient client;


unsigned long lastConnectionTime;              // 上次连接上服务器的时间
boolean lastConnected = false;                 // 上次的连接状态
const int timeInterval = 250;   //实测，若间隔时间过短（如100），温湿度数据会不稳
String returnValue = "";
boolean ResponseBegin = false;
int flag = 1; //用于协调POST、POST、GET的顺序

void setup() {
  //DHT11、继电器相关
  pinMode(RELAYPIN, OUTPUT);
  relayOff(); //初始化继电器关闭

  //网络相关
  Serial.begin(9600);
  Serial.println("Begin to init...");

//  if (Ethernet.begin(mac) == 0) {
//    Serial.println("Failed to configure Ethernet using DHCP");
    Ethernet.begin(mac, ip);
//  }

  delay(1000);
  Serial.println("connecting...");
  Serial.print("IP addresss is:"); Serial.println(Ethernet.localIP());
  Serial.println("Init OK");
  lastConnectionTime = millis();
}



void loop() {
  //发送HTTP请求（POST、POST、GET）
  if (!client.connected()) {
    //*****读取温湿度值*****
    int chk = DHT11.read(DHT11PIN);
//        debugDht11(chk);

    //发送温度数据
    if (flag == 1 && (millis() - lastConnectionTime > timeInterval * 5)) {
      //滤除无效数据
      if (DHT11.temperature >= -10 && DHT11.temperature <= 50) {
        sendReqPost(deviceId.temp, DHT11.temperature);
      }
      flag = 2;
      //      client.stop();  //为了加快循环一次（温度、湿度、继电器）的速度，发送后立即关闭连接
    }
    //发送湿度数据
    if (flag == 2 && (millis() - lastConnectionTime > timeInterval * 5)) {
      //滤除无效数据
      if (DHT11.humidity >= 0 && DHT11.humidity <= 100) {
        sendReqPost(deviceId.humi, DHT11.humidity);
      }
      flag = 3;
      //      client.stop();  //为了加快循环一次（温度、湿度、继电器）的速度，发送后立即关闭连接
    }
    //获取继电器数据
    if (flag == 3 && (millis() - lastConnectionTime > timeInterval * 5)) {
      sendReqGet(deviceId.relay);
      flag = 1;
      //此处不能立即关闭连接，否则无法接收到服务器响应GET的数据
    }
  }

  //如果有从服务器请求过来的数据，直接读取并显示
  if (client.available()) {
    char c = client.read();
    //    Serial.print(c);
    if (c == '{')
      ResponseBegin = true;
    else if (c == '}')
      ResponseBegin = false;

    if (ResponseBegin)
      returnValue += c;
  }

  //读取服务器对GET请求的响应
  if (returnValue.length() != 0 && (ResponseBegin == false))
  {
    Serial.print(">>>returnValue: ");    Serial.println(returnValue);

    //**********实际控制执行器部分**********
    //{"createtime":"2017-05-28T17:18:55.000Z","dvalue":"0"
    if (returnValue.charAt(returnValue.length() - 2) == '1') {
      Serial.println("turn on the Relay");
      relayOn();  //继电器打开
    }
    else if (returnValue.charAt(returnValue.length() - 2) == '0') {
      Serial.println("turn off the Relay");
      relayOff();  //继电器关闭
    }
    returnValue = "";
  }

  //如果从服务器断开，停止客户端
  if (!client.connected() && lastConnected) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }

  // 更新最近的网络连接状态
  lastConnected = client.connected();
}
