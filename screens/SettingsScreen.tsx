import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { Button, Text, TextInput, View } from "../components/Themed";

export default function SettingsScreen() {
  const [phone, setPhone] = useState("0123456789");
  const [key, setKey] = useState("abcd");

  const toggleWAUpdate = () => console.log("toggle");

  const update = () => console.log("update");

  return (
    <View style={styles.container}>
      <Button
        title={"Turn Off WhatsApp Notifications"}
        onPress={toggleWAUpdate}
      />

      <View>
        <Text>Phone Number</Text>
        <TextInput
          onChangeText={setPhone}
          value={phone}
          maxLength={10}
          keyboardType="numeric"
        />
      </View>

      <View>
        <Text>WhatsApp API Key</Text>
        <TextInput onChangeText={setKey} value={key} />
      </View>

      <Button title="Update" onPress={update} />
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
