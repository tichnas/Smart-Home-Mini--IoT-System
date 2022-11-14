#include <b64.h>
#include <HttpClient.h>
#include <WiFi.h>
#include <Wire.h>
#include "ThingSpeak.h"
#include "DHT.h"
#include "RTClib.h"
#include "secrets.h"
#include "constants.h"
#include <bits/stdc++.h>

WiFiClient client;
DHT sensor(DHT_PIN, DHT22);
RTC_DS3231 rtc;

struct AlarmTime
{
    int hour;
    int minute;
} alarmTime;
float temperature, humidity;
unsigned long lastSensorRead, lastThingSpeakFetch;
WADetail WADetails;
int RGBon = 0;

String getTime()
{
    DateTime now = rtc.now();

    String time = "";
    if (now.hour() < 10)
        time += "0";
    time += now.hour();
    time += ":";
    if (now.minute() < 10)
        time += "0";
    time += now.minute();
    time += ":";
    if (now.second() < 10)
        time += "0";
    time += now.second();

    return time;
}

void connectToWiFi()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.print("Connecting to WiFi");
        while (WiFi.status() != WL_CONNECTED)
        {
            WiFi.begin(SSID, PASS);
            Serial.print('.');
            delay(5000);
        }
        Serial.println("\nConnected to WiFi");
    }
}

void stopAlarm()
{
    alarmTime.hour = -1;
}

void readDHT()
{
    Serial.println(getTime());
    lastSensorRead = millis();

    humidity = sensor.readHumidity();
    temperature = sensor.readTemperature();
}

void uploadSensorData()
{
    ThingSpeak.setField(TEMPERATURE_FIELD, temperature);
    ThingSpeak.setField(HUMIDITY_FIELD, humidity);

    int status = ThingSpeak.writeFields(CHANNEL_ID, WRITE_KEY);
    Serial.print("Sensor Data Upload Status: ");
    Serial.println(status);
}

void blinkLED()
{
    digitalWrite(LED_PIN, HIGH);
    delay(2000);
    digitalWrite(LED_PIN, LOW);
    delay(2000);
}

void checkAlarm()
{
    DateTime now = rtc.now();
    int current = now.hour() * 60 + now.minute();
    int alarm = alarmTime.hour * 60 + alarmTime.minute;
    Serial.print(current);
    Serial.print(' ');
    Serial.println(alarm);
    if (abs(current - alarm) <= 1)
        digitalWrite(BUZZER_PIN, HIGH);
    else
        digitalWrite(BUZZER_PIN, LOW);
}

void WAMessage()
{
    HttpClient http(client);

    const char *hostName = "api.callmebot.com";
    String url = "/whatsapp.php?phone=+91";
    url += WADetails.phone;
    url += "&text=";
    url += getTime();
    url += "%0ATemperature%20%3D%20";
    url += temperature;
    url += "%0AHumidity%20%3D%20";
    url += humidity;
    url += "&apikey=";
    url += WADetails.key;

    Serial.println(url);
    int status = http.get(hostName, url.c_str(), NULL);
    Serial.print("WA Message Status: ");
    Serial.println(status);
}

void fetchThingSpeak()
{
    Serial.println(getTime());
    lastThingSpeakFetch = millis();
    int status;
    Serial.println("Fetching from ThingSpeak");

    int tAlarmTime = ThingSpeak.readIntField(CHANNEL_ID, ALARM_FIELD, READ_KEY);
    status = ThingSpeak.getLastReadStatus();
    if (status == 200)
    {
        Serial.print("Raw Alarm Time: ");
        Serial.println(tAlarmTime);

        if (tAlarmTime < 0)
            alarmTime.hour = -1;
        else
        {

            alarmTime.hour = tAlarmTime / 100;
            alarmTime.minute = tAlarmTime % 100;
        }

        Serial.print("AlarmTime: ");
        Serial.print(alarmTime.hour);
        Serial.print(" ");
        Serial.println(alarmTime.minute);
    }
    else
    {
        Serial.print(status);
        Serial.println(": Error in Alarm Time");
    }

    String tPhone = ThingSpeak.readStringField(CHANNEL_ID, PHONE_FIELD, READ_KEY);
    status = ThingSpeak.getLastReadStatus();
    if (status == 200)
    {
        Serial.print("Phone: ");
        Serial.println(tPhone);

        if (tPhone == "0")
            WADetails = {"", ""};
        else
        {
            for (auto detail : WA_DETAILS)
                if (detail.phone == tPhone)
                {
                    WADetails.phone = detail.phone;
                    WADetails.key = detail.key;
                }
        }
    }
    else
    {
        Serial.print(status);
        Serial.println(": Error in Phone");
    }
}

void setup()
{
    Serial.begin(115200);
    delay(2000);

    temperature = humidity = 0;
    lastSensorRead = -2 * SENSOR_DELAY;
    lastThingSpeakFetch = -2 * THINGSPEAK_FETCH_DELAY;
    WADetails = {"", ""};
    stopAlarm();

    ThingSpeak.begin(client);

    sensor.begin();

    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);
    pinMode(LED_RGB_R_PIN, OUTPUT);
    pinMode(LED_RGB_G_PIN, OUTPUT);
    pinMode(LED_RGB_B_PIN, OUTPUT);

    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(LED_RGB_R_PIN, HIGH);
    digitalWrite(LED_RGB_G_PIN, HIGH);
    digitalWrite(LED_RGB_B_PIN, HIGH);

    touchAttachInterrupt(TOUCH_PIN, stopAlarm, 40);

    rtc.begin();
    rtc.adjust(DateTime(__DATE__, __TIME__));

    // digitalWrite(BUZZER_PIN, HIGH);
}

void loop()
{
    delay(2000);
    Serial.println(getTime());
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(LED_PIN, LOW);

    if (temperature > PERFECT_TEMPERATURE + 0.5 && RGBon != LED_RGB_R_PIN)
    {
        if (RGBon)
            digitalWrite(RGBon, HIGH);
        digitalWrite(LED_RGB_R_PIN, LOW);
        RGBon = LED_RGB_R_PIN;
    }
    else if (temperature < PERFECT_TEMPERATURE - 0.5 && RGBon != LED_RGB_B_PIN)
    {
        if (RGBon)
            digitalWrite(RGBon, HIGH);
        digitalWrite(LED_RGB_B_PIN, LOW);
        RGBon = LED_RGB_B_PIN;
    }
    else if (PERFECT_TEMPERATURE - 0.5 <= temperature && temperature <= PERFECT_TEMPERATURE + 0.5 && RGBon != LED_RGB_G_PIN)
    {
        if (RGBon)
            digitalWrite(RGBon, HIGH);
        digitalWrite(LED_RGB_G_PIN, LOW);
        RGBon = LED_RGB_G_PIN;
    }

    connectToWiFi();

    checkAlarm();

    if (millis() - lastThingSpeakFetch > THINGSPEAK_FETCH_DELAY)
    {
        digitalWrite(LED_PIN, HIGH);
        fetchThingSpeak();
    }

    if (millis() - lastSensorRead > SENSOR_DELAY)
    {
        digitalWrite(LED_RED_PIN, LOW);
        readDHT();
        uploadSensorData();

        if (WADetails.phone && WADetails.phone.length() == 10)
            WAMessage();
    }
}
