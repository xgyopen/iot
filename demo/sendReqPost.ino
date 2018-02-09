void sendReqPost(int _deviceId, int _deviceData) {
  client.print("POST /api/");
  client.print(_deviceId);
  client.println(" HTTP/1.1");
  client.println("Host: 192.168.1.101");
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

