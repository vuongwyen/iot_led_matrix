#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <SoftwareSerial.h>

const char *ssid = "Su Kem";
const char *password = "tienvaonhieu";
// const char *ssid = "FIT_IoT";
// const char *password = "fitforiot";
// const char *ssid = "KAFACAFE";
// const char *password = "capheduongpho";
WebSocketsServer webSocket(3000);
SoftwareSerial mySerial(5, 4); // RX, TX - Kết nối với Arduino
String mode = "";
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
    if (type == WStype_TEXT)
    {
        String message = String((char *)payload);
        Serial.println("Message received from WebSocket: " + message);

        if (message == "auto")
        {
            mode = "auto";
            Serial.println(mode);
        }
        else if (message.startsWith("manual:"))
        { // Nhận lệnh manual
            mode = "manual";
            String textToDisplay = message.substring(7); // Lấy phần văn bản sau 'manual:'
            Serial.println("Manual mode, text: " + textToDisplay);
            mySerial.println("manual:" + textToDisplay); // Gửi lệnh và văn bản tới Arduino
        }

        if (mode == "auto" && message == "getData")
        {
            mySerial.println("getData"); // Gửi lệnh getData đến Arduino
            delay(500);                  // Đợi dữ liệu từ Arduino
            if (mySerial.available())
            {
                String sensorData = mySerial.readStringUntil('\n'); // Đọc dữ liệu từ Arduino
                Serial.println("Data received from Arduino: " + sensorData);
                webSocket.sendTXT(num, sensorData); // Gửi dữ liệu lên WebSocket
            }
            else
            {
                Serial.println("No data received from Arduino");
            }
        }
        if (mode == "manual")
        {
        }
    }
}

void setup()
{
    Serial.begin(9600);
    mySerial.begin(9600); // Serial giữa ESP8266 và Arduino
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("Connected to WiFi");
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
    Serial.println("WebSocket server started");
    Serial.println(WiFi.localIP());
}

void loop()
{
    webSocket.loop();
}
