import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { SafeAreaView, TextInput, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Paho from 'paho-mqtt';
import { useEffect, useState } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer une instance client MQTT
const client = new Paho.Client('192.168.7.45', Number(9001), 'mqtt-async-test-${Math.random()*100}'); //IP de mon pc pour mqtt

export default function App() {
  const [value, setValue] = useState(0);
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(0);
  const [v3, setV3] = useState(0);
  const [v0, setV0] = useState(0);
  const [temp, onChangeText] = React.useState('');
  const [connected, setConnected] = useState(false);
  const clearHistoricalData = async () => {
    try {
      await AsyncStorage.removeItem('historicalData');
      console.log('Historical data cleared.');
    } catch (error) {
      console.error('Error clearing historical data:', error);
    }
  };

  function subscribeToValue() {
    client.subscribe('value');
    client.onMessageArrived = onMessage;
  }

  function onMessage(message: Paho.Message) {
    if (message.destinationName === 'value') {
      setValue(parseInt(message.payloadString || '0', 10));
    }
  }

  function publishTOnOff1() {
    const v1 = 1;
    const topic = 'OnOff';

    if (client.isConnected()) {
      const mqttMessage = new Paho.Message(v1.toString());
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(`Message sent to topic ${topic}: ${v1}`);
      setV1(v1); // Met à jour la valeur localement
    } else {
      console.log('Not connected to MQTT. Cannot send message.');
    }
  }

  function publishTOnOff2() {
    const v2 = 2;
    const topic = 'OnOff';

    if (client.isConnected()) {
      const mqttMessage = new Paho.Message(v2.toString());
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(`Message sent to topic ${topic}: ${v2}`);
      setV2(v2); // Met à jour la valeur localement
    } else {
      console.log('Not connected to MQTT. Cannot send message.');
    }
  }

  function publishTOnOff3() {
    const v3 = 3;
    const topic = 'OnOff';

    if (client.isConnected()) {
      const mqttMessage = new Paho.Message(v3.toString());
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(`Message sent to topic ${topic}: ${v3}`);
      setV3(v3); // Met à jour la valeur localement
    } else {
      console.log('Not connected to MQTT. Cannot send message.');
    }
  }


  function publishTOnOff0() {
    const v0 = 0;
    const topic = 'OnOff';

    if (client.isConnected()) {
      const mqttMessage = new Paho.Message(v0.toString());
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
      console.log(`Message sent to topic ${topic}: ${v0}`);
      setV0(v0); // Met à jour la valeur localement
    } else {
      console.log('Not connected to MQTT. Cannot send message.');
    }
  }



  const storeData = async (data: string[]) => {
    try {
      await AsyncStorage.setItem('historicalData', JSON.stringify(data));
    } catch (error) {
      console.error('Error storing historical data:', error);
    }
  };

  useEffect(() => {
    function connectToMqtt() {
      if (!connected) {
        client.connect({
          onSuccess: () => {
            console.log('Connected to MQTT!');
            setConnected(true);
            subscribeToValue();
          },
          onFailure: () => {
            console.log('Failed to connect to MQTT!');
          },
        });
      }
    }

    connectToMqtt();

    // Clean up function for disconnecting when the component unmounts
    return () => {
      if (connected) {
        client.disconnect();
        setConnected(false);
      }
    };
  }, [connected]);

  function Valeurs({ navigation }) {
    const [temp, onChangeText] = React.useState('');
    const [historicalData, setHistoricalData] = useState([]);

    function publishToTemperature() {
      const val = temp;
      const topic = 'Temperature';
  
      if (client.isConnected()) {
        const mqttMessage = new Paho.Message(val.toString());
        mqttMessage.destinationName = topic;
        client.send(mqttMessage);
        console.log(`Message sent to topic ${topic}: ${val}`);
  
        // Mise à jour de l'historique local avec la nouvelle valeur et le temps actuel
        const currentTime = new Date();
        setHistoricalData((prevData) => [...prevData, { value: val, time: currentTime }]);
  
        // Stockage de l'historique dans AsyncStorage
        storeHistoricalData((prevData) => [...prevData, { value: val, time: currentTime }]);
      } else {
        console.log('Not connected to MQTT. Cannot send message.');
      }
    }

    // Fonction pour stocker les données historiques dans AsyncStorage
    const storeHistoricalData = async (dataUpdateFunction) => {
      try {
        // Récupérer les données historiques actuelles depuis AsyncStorage
        const currentData = await AsyncStorage.getItem('historicalData');
        const currentDataArray = currentData ? JSON.parse(currentData) : [];
    
        // Utiliser dataUpdateFunction s'il est défini, sinon utiliser une fonction d'identité
        const updatedDataArray = dataUpdateFunction ? dataUpdateFunction(currentDataArray) : currentDataArray;
    
        // Stocker les données historiques mises à jour dans AsyncStorage
        await AsyncStorage.setItem('historicalData', JSON.stringify(updatedDataArray));
      } catch (error) {
        console.error('Error storing historical data:', error);
      }
    };
    

    return (
      <View style={styles.homescreen}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Welcome to the Value</Text>

        <SafeAreaView style={{ marginTop: 20 }}>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={temp}
            placeholder='20°C'
          />
          <Button title="Send" onPress={() => publishToTemperature()} />
        </SafeAreaView>

        <Text style={{ fontSize: 20, marginTop: 20 }}>Temperature: {value}</Text>

        <View style={{ marginBottom: 20, marginTop: 20 }}>
          <Button title="OFF peltier / ON ventilator" onPress={publishTOnOff1} />

        </View>
        <View style={{ marginBottom: 20 }}>
          <Button title="On peltier / Off ventilator" onPress={publishTOnOff2} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Button title="ALL OFF" onPress={publishTOnOff3} />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Button title="Normal" onPress={publishTOnOff0} />
        </View>
      </View>
    );
  }


  function Projet({ navigation }) {
    return (

      <View style={styles.homescreen}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Welcome to the Project.</Text>
        <Text style={styles.justifiedText}>This year, as part of a multidisciplinary project 3, I have started a project on temperature control. The principle of this project is the integration of hardware and software components to create an efficient and autonomous system.</Text>
        <View style={{ marginBottom: 20, marginTop: 20 }}>
        </View>
      </View>

    )

  }


  function Historique({ navigation }) {
    const [historicalData, setHistoricalData] = useState([]);

    // Utilisez useEffect pour charger les données historiques depuis AsyncStorage
    useEffect(() => {
      const retrieveData = async () => {
        try {
          const data = await AsyncStorage.getItem('historicalData');
          if (data) {
            setHistoricalData(JSON.parse(data));
          }
        } catch (error) {
          console.error('Error fetching historical data:', error);
        }
      };

      retrieveData();
    }, []);

   const handleClearHistoricalData = () => {
    clearHistoricalData();
    setHistoricalData([]); // Mettez à jour l'état local pour refléter le changement dans l'interface utilisateur
  };

  return (
    <View style={styles.homescreen}>
      <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Welcome to the History.</Text>
      <View style={{ marginBottom: 20, marginTop: 20 }}>
        {historicalData.map((entry, index) => (
          <Text key={index}>{`Temperature: ${entry.value}, Time: ${entry.time ? formatTimePlusOneHour(entry.time) : 'N/A'}`}</Text>
        ))}
      </View>
      <Button title="Clear Historical Data" onPress={handleClearHistoricalData} />
    </View>
  );
  }


// Fonction pour formater le temps sous forme d'heure (HH:mm:ss) avec +1 heure
const formatTimePlusOneHour = (time) => {
  const newTime = new Date(time);  // Créer une nouvelle instance pour éviter de modifier l'original
  newTime.setHours(newTime.getHours() + 1);  // Ajouter une heure
  const hours = newTime.getUTCHours().toString().padStart(2, '0');
  const minutes = newTime.getUTCMinutes().toString().padStart(2, '0');
  const seconds = newTime.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};





  function HomeScreen({ navigation }) {
    const [text, onChangeText] = React.useState('');
    const [text2, onChangeText2] = React.useState('');

    function test() {

      if (text == "Admin" && text2 == "Admin") {
        navigation.navigate('Log')
      } else {
        alert("Mauvais identifiants")
      }

    }

    return (
      <View style={styles.homescreen}>


        <SafeAreaView>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder='Name'
          />
          <TextInput
            style={styles.input}
            onChangeText={onChangeText2}
            value={text2}
            placeholder="Password"
          />
        </SafeAreaView>


        <Button title="Login" onPress={() => test()} />
      </View>
    )

  }

  function Log({ navigation }) {
    return (
      <View style={styles.homescreen}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Welcome to my</Text>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Multidisciplinary Project 3</Text>
        <View style={{ marginBottom: 20, marginTop: 20 }}>
          <Button title="Project" onPress={() => navigation.navigate('Project')} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Button title="Value" onPress={() => navigation.navigate('Value')} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Button title="History" onPress={() => navigation.navigate('History')} />
        </View>
      </View>
    )

  }



  const stack = createNativeStackNavigator()


  return (
    <NavigationContainer >
      <stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#2d76c4' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center'
      }}
        initialRouteName="Home">
        <stack.Screen name="Home" component={HomeScreen} />
        <stack.Screen name="Log" component={Log} />
        <stack.Screen name="Value" component={Valeurs} />
        <stack.Screen name="Project" component={Projet} />
        <stack.Screen name="History" component={Historique} />
      </stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homescreen: {
    flex: 1,
    backgroundColor: '#bcccf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 2,
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  justifiedText: {
    textAlign: 'justify',
    lineHeight: 24,
    fontSize: 20,
    marginTop: 20,
    marginRight: 5,
    marginLeft: 5,
  },

  
});

