//与本地Node.js的接口（本文件夹中的app.js）配合
//最小的能跑通的demo
#include <SPI.h>
#include <Ethernet.h>

struct DEVICE_ID {
  int temp = 1;
  int humi = 2;
  int relay = 3;
};

DEVICE_ID deviceId;

//设置Arduino的Mac地址
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED
  //  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0x3D
};
char server[] = "192.168.1.101";    // 服务器的IP

IPAddress ip(192, 168, 1, 200); //动态分配IP失败时使用的静态IP

EthernetClient client;

void setup() {
  Serial.begin(9600);

  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    Ethernet.begin(mac, ip);
  }

  delay(1000);
  Serial.println("connecting...");

  if (client.connect(server, 3000)) {
    Serial.println("connected");
    // 创建HTTP请求
    //    sendReqGet();
    sendReqPost(deviceId.temp, 66);

  } else {
    Serial.println("connection failed");
  }

  Serial.print("IP addresss is:"); Serial.println(Ethernet.localIP());
  Serial.println("Init OK");
}

void loop() {
  //如果有从服务器请求过来的数据，直接读取并显示
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  //如果从服务器断开，停止客户端
  if (!client.connected()) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();

    // 死循环
    Serial.println("end...");
    while (true);
  }
}

