#include <SPI.h>
#include <SoftwareSerial.h>
#include <DHT.h>
#include <MD_Parola.h>
#include <MD_MAX72xx.h>

SoftwareSerial mySerial(3, 4); // RX, TX - Kết nối với ESP8266

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES 4
#define CLK_PIN 13
#define DATA_PIN 11
#define CS_PIN 10

MD_Parola P = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);
char message[32] = "";

void setup()
{
    Serial.begin(9600);
    mySerial.begin(9600); // Serial giữa Arduino và ESP8266
    dht.begin();
    P.begin();
    P.displayClear();  // Xóa nội dung hiển thị trước đó
    P.setIntensity(5); // Điều chỉnh độ sáng
    P.displayClear();
    P.displayReset();
    Serial.println("Arduino is ready"); // Thông báo khởi động
}

void loop()
{
    String cmd = mySerial.readStringUntil('\n');
    cmd.trim(); // Xóa các ký tự không mong muốn như \r \n

    if (cmd == "getData")
    {
        sendData(); // Gọi hàm senData() khi nhận được lệnh "getData"
    }
    else if (cmd.startsWith("manual:"))
    {
        cmd.replace("manual:", "");                                                  // Loại bỏ phần "manual:"
        cmd.toCharArray(message, 32);                                                // Chuyển sang char array
        P.displayText(message, PA_CENTER, 50, 1000, PA_SCROLL_LEFT, PA_SCROLL_LEFT); // Hiển thị văn bản trên LED
    }

    if (P.displayAnimate())
    {
        P.displayReset();
    }
}

void sendData()
{
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    String csvData = String(temp, 1) + "," + String(hum, 1);
    mySerial.println(csvData); // Gửi dữ liệu CSV về ESP8266
    String sensorData = String(temp) + "C" + String(hum) + "%";
    ;
    // Hiển thị dữ liệu cuộn
    P.displayClear(); // Xóa nội dung hiện tại trước khi hiển thị mới
    P.displayScroll(sensorData.c_str(), PA_LEFT, PA_SCROLL_LEFT, 5);
    P.displayAnimate(); // Bắt đầu hiển thị chữ cuộn
}
