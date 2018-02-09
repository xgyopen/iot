//继电器（低电平触发）
void relayOn() {
  digitalWrite(RELAYPIN, LOW);//低电平触发
}

void relayOff() {
  digitalWrite(RELAYPIN, HIGH);
}

