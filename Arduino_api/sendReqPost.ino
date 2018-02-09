void sendReqPost(int _deviceId, int _deviceData) {
  //如果连接成功
  if (client.connect(serverIp, serverPort)) {
    Serial.println("connected");
    //发送HTTP POST请求
    client.print("POST /1data/");
    client.print(_deviceId);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(serverIp);
    client.print("Content-Length: ");
    //计算以byte记的传感器数据：{"value":} 占用10bytes，还需加上数据的长度
    int thisLength = 10 + getLength(_deviceData);
    client.println(thisLength);

    client.println("Content-Type: application/x-www-form-urlencoded");
    client.println("Connection: close");
    client.println();

    //实际POST请求的内容
    client.print("{\"value\":");
    client.print(_deviceData);
    client.println("}");
  }
  //如果发起连接失败
  else {
    Serial.println("connection failed");
    client.stop();
  }
  //记录（尝试/成功）发起连接的时间
  lastConnectionTime = millis();
}

