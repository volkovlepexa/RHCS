#include "ClientCommunications.h"

ClientCommunications::ClientCommunications(byte* mac, byte* ip, byte* server, string room, int id, string login, string password) {

} //Mikhail

/**
* Send error code to server 
* @param errorId Error code
*/
void ClientCommunications::sendError(String inTopic, String errorId) {
  if ( !(client.connected()) ) {
    client.connect(clientId);
  }
  else {
    char buffer[256];
    String errorMessage = "{errorCode: \""+ errorId + "\"}";
    errorMessage.toCharArray(buffer, strlen(errorMessage) + 1);
    client.publish(inTopic, buffer);
  }

} // Alexey

/**
* Send measurment from sensor to server
* @param sensorId   
* @param value Sensor measurment 
* @param priority Proce
*/
void ClientCommunications::sendMeasurment(int sensorId, String value, int priority) {
  if (!client.connected()){
    client.connect("someID");
  }
  
  String msg = "{sensor:\"" + String(sensorId) + "\",";
  msg += "value:\"" + value + "\",";
  msg += "priority:" + String(priority) + "}";
  
  char temp[128];
 
  msg.toCharArray( temp, msg.length() + 1 );
 
  client.publish("MyTopic", temp);
} // Dmitrii

/**
* Connect/Reconnect to server
* @param callback function | Processing function  
* @param endPoint Controller's device id
* @param value value for device  
*/
void ClientCommunications::handShake((*callback)(int endPoint, string value)) {

} //Mikhail
