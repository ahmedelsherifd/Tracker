import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  update,
} from "firebase/database";
import * as Location from "expo-location";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Button, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

let foregroundSubscription = null;

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyAxyTuikz4IEJcffveXUQsmESruSKk9UhE",
    //authDomain: "your-auth-domain",
    databaseURL:
      "https://realtime-location-tracki-4bf80-default-rtdb.firebaseio.com",
    projectId: "realtime-location-tracki-4bf80",
    storageBucket: "realtime-location-tracki-4bf80.appspot.com",
    //messagingSenderId: "your-sender-id",
    appId: "1:375394092135:android:23f377cabbf4f7e686c0c2",
  };

  initializeApp(firebaseConfig);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [counter, setCounter] = useState(1);
  const [postID, setPostID] = useState();

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(postID);
  };

  const getUserLocation = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (!foreground.granted) {
      setLocationErrorMsg("Permission to access location was denied");
    }
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      setLocationErrorMsg("Location tracking denied!");
      return;
    }
    foregroundSubscription?.remove();

    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
      },
      (location) => {
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setCounter((counter) => counter + 1);
      }
    );
  };

  const saveLocation2 = async () => {
    const db = getDatabase();
    const referenceFuel = ref(db, "places/");
    const newPostRef = push(referenceFuel);
    setPostID(newPostRef.key);
    update(newPostRef, {
      lat: location.latitude,
      lng: location.longitude,
    });
  };

  useInterval(() => {
    // Your custom logic here
    if (postID) {
      const db = getDatabase();
      const referenceFuel = ref(db, "places/" + postID + "/");
      update(referenceFuel, {
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }, 1000);

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Latitude: {location?.latitude}</Text>
      <Text>Longitude: {location?.longitude}</Text>

      {errorMsg ? <Text>{errorMsg}</Text> : null}
      <Button title="Share Location" onPress={saveLocation2} />
      <Text>ID: {postID}</Text>
      {postID && <Button title="Copy " onPress={copyToClipboard} />}

      {/* <Text>counter: {counter}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
