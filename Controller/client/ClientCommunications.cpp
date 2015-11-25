#include "ClientCommunications.h"

ClientCommunications::ClientCommunications(byte* mac, byte* ip, byte* server, string room, int id, string login, string password) {

} //Mikhail

/**
* Send error code to server 
* @param errorId Error code
*/
void ClientCommunications::sendError(int errorId) {

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
* @return true connection status is OK; false connection lost 
*/
bool ClientCommunications::isConnected() {

} // 

/**
* Connect/Reconnect to server
* @param callback function | Processing function  
* @param endPoint Controller's device id
* @param value value for device  
*/
void ClientCommunications::handShake((*callback)(int endPoint, string value)) {

} //Mikhail
