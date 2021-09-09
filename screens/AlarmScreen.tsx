import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { Text, View, TextInput, Button } from "../components/Themed";

export default function AlarmScreen() {
  const [hour, setHour] = useState(1);
  const [minute, setMinute] = useState(1);

  const onChangeHour = (hourString: string) => {
    let hourNum = Number(hourString);
    if (hourNum < 0) hourNum = 0;
    if (hourNum > 23) hourNum = 23;
    setHour(hourNum);
  };

  const onChangeMinute = (minuteString: string) => {
    let minuteNum = Number(minuteString);
    if (minuteNum < 0) minuteNum = 0;
    if (minuteNum > 59) minuteNum = 59;
    setMinute(minuteNum);
  };

  const save = () => console.log("Save");

  return (
    <View style={styles.container}>
      <Text style={styles.warning}>Alarm is turned off!</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View style={styles.time}>
        <TextInput
          onChangeText={onChangeHour}
          value={String(hour)}
          keyboardType="numeric"
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          onChangeText={onChangeMinute}
          value={String(minute)}
          keyboardType="numeric"
        />
      </View>
      <Button title="Save" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  warning: {
    color: "red",
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  time: {
    flexDirection: "row",
    marginBottom: 50,
  },
  colon: {
    marginHorizontal: 10,
  },
});
