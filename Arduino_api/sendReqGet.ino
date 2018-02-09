void sendReqGet(int _deviceId) {
  //如果连接成功
  if (client.connect(serverIp, serverPort)) {
    Serial.println("connected");
    //发送HTTP GET请求
    client.print("GET /1data/");
    client.print(_deviceId);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(serverIp);
    client.println("Connection: close");
    client.println();
  }
  //如果发起连接失败
  else {
    Serial.println("connection failed");
    client.stop();
  }
  //记录（尝试/成功）发起连接的时间
  lastConnectionTime = millis();
}

