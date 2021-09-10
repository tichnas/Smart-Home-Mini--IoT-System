import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import api from "../api";

import { Button, Text, View } from "../components/Themed";
import { PHONE_FIELD, PHONE_NUMBERS } from "../constants/env";

export default function WAScreen() {
  const [phone, setPhone] = useState(0);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    setLoading(true);
    try {
      const phoneData = await api.getPhone();
      setPhone(Number(phoneData[`field${PHONE_FIELD}`]));
    } catch (err: any) {
      console.log(err.message);
    }
    setLoading(false);
  };

  const updatePhone = async (value: number) => {
    setLoading(true);
    try {
      await api.setPhone(value);
      setPhone(value);
      getData();
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
      <Button
        title="Turn Off WhatsApp Notifications"
        onPress={() => updatePhone(0)}
        color={phone === 0 ? undefined : "lightblue"}
      />

      {PHONE_NUMBERS.map((num) => (
        <Button
          key={num}
          title={String(num)}
          onPress={() => updatePhone(num)}
          color={phone === num ? undefined : "lightblue"}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
