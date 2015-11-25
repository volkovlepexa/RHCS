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
void ClientCommunications::sendMeasurment(int sensorId, string value, int priority) {

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
