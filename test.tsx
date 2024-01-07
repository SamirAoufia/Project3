import Paho from "paho-mqtt";
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';

const client = new Paho.Client(
  "192.168.0.8",
  Number(9001),
  mqtt-async-test-${parseInt(Math.random() * 100)}
);

export default function MQTT() {

  const [value, setValue] = useState(0);

  function onMessage(message: Paho.Message) {
    if (message.destinationName === "mqtt-async-test/value")
      setValue(parseInt(message.payloadString || "0", 10));
  }

  useEffect(() => {
    client.connect({
      onSuccess: () => {
        console.log("Connected!");
        client.subscribe("mqtt-async-test/value");
        client.onMessageArrived = onMessage;
      },
      onFailure: () => {
        console.log("Failed to connect!");
      }
    });
  }, [])

  function changeValue(c: Paho.Client) {
    const message = new Paho.Message((value + 1).toString());
    message.destinationName = "mqtt-async-test/value";
    c.send(message);
  }

  return (
    <View>
      <Text>Value is: {value}</Text>
      <Button onPress={() => { changeValue(client);} } title="Press Me"/>
      <StatusBar style="auto" />
    </View>
  );
}