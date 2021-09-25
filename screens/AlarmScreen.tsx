import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import api from "../api";

import { Text, View, TextInput, Button } from "../components/Themed";
import { ALARM_FIELD } from "../constants/env";

export default function AlarmScreen() {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(3);
  const [alarmSet, setAlarmSet] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const getData = async () => {
    setLoading(true);
    try {
      const alarmData = await api.getAlarm();
      const rawAlarmTime = Number(alarmData[`field${ALARM_FIELD}`]);

      if (rawAlarmTime < 0) {
        setAlarmSet(false);
        setHour(12);
        setMinute(3);
      } else {
        setAlarmSet(true);
        setHour(Math.floor(rawAlarmTime / 100));
        setMinute(rawAlarmTime % 100);
      }
    } catch (err: any) {
      console.log(err.message);
    }
    setLoading(false);
  };

  const setAlarm = async (turnOff = false) => {
    setLoading(true);
    try {
      await api.setAlarm(turnOff ? -1 : 100 * hour + minute);

      if (turnOff) {
        setAlarmSet(false);
        setHour(12);
        setMinute(3);
      } else setAlarmSet(true);
    } catch (err: any) {
      console.log(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {alarmSet ? (
        <Button title="Turn Off Alarm" onPress={() => setAlarm(true)} />
      ) : (
        <Text style={styles.warning}>Alarm is turned OFF!</Text>
      )}

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
      <Button title="Save" onPress={() => setAlarm()} />
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
