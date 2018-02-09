void sendReqGet() {
  client.println("GET /api/1 HTTP/1.1");
  client.println("Host: 192.168.1.101");
  client.println("Connection: close");
  client.println();
}

