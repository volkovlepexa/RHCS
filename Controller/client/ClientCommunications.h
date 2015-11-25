#ifndef ClientCommunications_h
#define ClientCommunications_h

#include <SPI.h>
#include <Ethernet.h>
#include "PubSubClient.h"
#include <string>

using namespace std;

class ClientCommunications {
  private:
  	Ethernet ethernet;
    byte mac[];
    IPAddress ip;
    IPAddress server;
    string room;
    int id;
    PubSubClient client;

  public:

    ClientCommunications(byte* mac, byte* ip, byte* server, string room, int id, string login, string password); 
    /**
    * Send error code to server 
	* @param errorId Error code
    */
    void sendError(String inTopic, String errorId); 

    /**
    * Send measurment from sensor to server
	* @param sensorId   
	* @param value Sensor measurment 
	* @param priority Proce
    */
    void sendMeasurment(int sensorId, String value, int priority); 

    /**
    * Connect/Reconnect to server
	* @param callback function | Processing function  
	* @param endPoint Controller's device id
	* @param value value for device  
    */
    void handShake((*callback)(int endPoint, string value));
};

#endif