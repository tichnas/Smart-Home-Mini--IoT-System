import React, { useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { Text, View } from "../components/Themed";

export default function DataScreen() {
  const [values, setValues] = useState([23, 25, 27]);
  const [values2, setValues2] = useState([27, 22, 31]);

  const [labels, setLabels] = useState(["10:23", "10:24", "10:25"]);

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // optional
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "blue" }}>Temperature</Text>
      <Text style={{ color: "red" }}>Humidity</Text>
      <View style={styles.separator} />
      <LineChart
        chartConfig={chartConfig}
        width={screenWidth}
        height={500}
        data={{
          labels,
          datasets: [
            { data: values, color: () => "blue" },
            { data: values2, color: () => "red" },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
