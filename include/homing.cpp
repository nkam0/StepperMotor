#include <AccelStepper.h>

#define HALFSTEP 8

#define motorPin1  19     // IN1 on ULN2003 ==> Blue   on 28BYJ-48
#define motorPin2  18     // IN2 on ULN2004 ==> Pink   on 28BYJ-48
#define motorPin3  5    // IN3 on ULN2003 ==> Yellow on 28BYJ-48
#define motorPin4  17    // IN4 on ULN2003 ==> Orange on 28BYJ-48

// NOTE: The sequence 1-3-2-4 is required for proper sequencing of 28BYJ-48
AccelStepper stepper1(HALFSTEP, motorPin1, motorPin3, motorPin2, motorPin4);

extern const int CAPACITIVE_TOUCH_INPUT_PIN; // GPIO pin 15
extern const int TOUCH_THRESHOLD; // turn on light if touchRead value < this threshold
extern int endPoint;     // Move this many steps; 1024 = approx 1/4 turn

volatile boolean stopNow = false;    // flag for Interrupt Service routine
boolean homed = false;               // flag to indicate when motor is homed

void IRAM_ATTR ISR() 
{
  stopNow = true; // Set flag to show Interrupt recognised and then stop the motor
};

bool homing(){
    // Set Stepper Motor Parameters
    stepper1.setMaxSpeed(1000);
    stepper1.setAcceleration(500);
    stepper1.setSpeed(1000);
    Serial.println("HOMING...");

    while(1){

        if (stopNow){
            // touchDetachInterrupt(CAPACITIVE_TOUCH_INPUT_PIN);                          // Interrupt not needed again (for the moment)
            // Serial.print("Interrupted at ");
            // Serial.println(stepper1.currentPosition());
            stepper1.stop();
            stepper1.setCurrentPosition(0);
            Serial.print("position established at home...");
            Serial.println(stepper1.currentPosition());
            stopNow = false;                            // Prevents repeated execution of the above code
            homed = true;
        }
        
        stepper1.runSpeed();
        if(homed){
            return 1;
        }
    }
};