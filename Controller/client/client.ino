#include <SPI.h>
#include <Ethernet.h>
#include "PubSubClient.h"
#include <string>

const char[] IDENTIFER="ID0"; 	// used for identify type of device
const char[] room="ID0"; 		// room identifer used like topic 


byte mac[]    = {  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
IPAddress ip(192, 168, 1, 153);
IPAddress server(192, 168, 1, 101);//server ip

/* payload format
adress reciver \n
action \n
value \n
*/

void callback(char* topic, byte* payload, unsigned int length) {
  int i = 0;
  char[10] id;
  while(payload[i] != '\n'){
      id[i] = payload[i];
      i++;
  }
  i++;
  if(String.)
  
}

EthernetClient ethClient;
PubSubClient client(ethClient);

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("arduinoClient")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish(room, IDENTIFER);
      // ... and resubscribe
      client.subscribe("inTopic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(57600);

  client.setServer(server, 1883);
  client.setCallback(callback);

  Ethernet.begin(mac, ip);
  // Allow the hardware to sort itself out
  delay(1500);
}

void loop()
{
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  std::string message = "server\n";
  message+="read";
  message+= 
  client.publish(room, );
}