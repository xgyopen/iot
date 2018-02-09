//计算传感器读取数据的长度（每个ASCII代表1 byte，故实际上计算的是比特数）
int getLength(int someValue) {
  // 至少1 byte
  int digits = 1;
  //持续以10分割变量，直至0
  int dividend = someValue / 10;
  while (dividend > 0) {
    dividend = dividend / 10;
    digits++;
  }

  return digits;
}
