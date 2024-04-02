#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "SPIFFS.h"
#include <AccelStepper.h>
#include "../include/homing.cpp"
#include "../include/initializations.cpp"

const int CAPACITIVE_TOUCH_INPUT_PIN = T3; // GPIO pin 15
const int TOUCH_THRESHOLD = 40; // turn on light if touchRead value < this threshold
int endPoint = 1024;     // Move this many steps; 1024 = approx 1/4 turn

// Replace with your network credentials
const char* ssid = "Microbonds";
const char* password = "M1cr0be!";


//Variables to save values from HTML form
String message = "";
String direction ="STOP";
String steps;

bool newRequest = false;



void setup()
{
  touchAttachInterrupt(CAPACITIVE_TOUCH_INPUT_PIN, ISR, TOUCH_THRESHOLD);           // Enable interrupt 0, switch pulled low

  Serial.begin(115200);

  initWiFi();
  initWebSocket();
  initSPIFFS();

  // Web Server Root URL
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", "text/html");
  });

  server.serveStatic("/", SPIFFS, "/");

  server.begin();

  if (homing() == 1){
    Serial.println("Stepper Zeroed");
  }
  else{
    Serial.println("Zero Failed");
  }

}

void loop()
{
  if (newRequest){
    if (direction == "CW"){
      stepper1.setMaxSpeed(4000.0);
      stepper1.setAcceleration(500.0);
      stepper1.setSpeed(200);
      stepper1.moveTo(steps.toInt());
      Serial.println(steps.toInt());
      Serial.println(stepper1.currentPosition());
      Serial.print("Starting: CW");
    }
    else if (direction == "CCW"){
      stepper1.setMaxSpeed(4000.0);
      stepper1.setAcceleration(500.0);
      stepper1.setSpeed(-200);
      // stepper1.setSpeed(-1000);
      stepper1.moveTo(steps.toInt());
      Serial.println(steps.toInt());
      Serial.println(stepper1.currentPosition());
      Serial.println("Starting: CCW");
    }
    
    while(true){
      stepper1.run();

      // stepper1.runSpeed();
      // Serial.println(stepper1.distanceToGo());
      if (stepper1.distanceToGo()==0){
        break;
      }
    }
    Serial.print("DONE");

    newRequest = false;
    notifyClients("stop");
  }
  ws.cleanupClients();

}
