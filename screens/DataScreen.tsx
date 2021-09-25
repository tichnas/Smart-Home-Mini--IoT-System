import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { Button, Text, View } from "../components/Themed";
import api from "../api";
import { HUMIDITY_FIELD, TEMPERATURE_FIELD } from "../constants/env";

const chartConfig = {
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: true, // optional
  decimalPlaces: 1,
};

const Chart = ({
  color,
  labels,
  values,
}: {
  color: string;
  labels: string[];
  values: number[];
}) => {
  const screenWidth = Dimensions.get("window").width;
  const pointsHide = [1];

  for (let i = 2; i < values.length; i++) if (i % 4) pointsHide.push(i);

  return (
    <LineChart
      chartConfig={chartConfig}
      width={screenWidth}
      height={250}
      hidePointsAtIndex={pointsHide}
      yAxisInterval={2}
      data={{
        labels,
        datasets: [{ data: values, color: () => color }],
      }}
    />
  );
};

export default function DataScreen() {
  const [values, setValues] = useState<{
    temperature: number[];
    humidity: number[];
  }>();

  const [labels, setLabels] = useState<string[]>();

  const [shift, setShift] = useState(0);

  const padZero = (num: number) => (num < 10 ? "0" : "") + String(num);

  const paginate = (arr: any[]) =>
    (shift ? [...arr].slice(0, -shift) : [...arr]).slice(-25);

  const move = (num: number) => {
    const newShift = shift + 4 * num;
    if (newShift >= 0 && newShift <= labels.length) setShift(newShift);
  };

  const getData = async () => {
    try {
      const [temperatureData, humidityData] = await Promise.all([
        api.getTemperature(),
        api.getHumidity(),
      ]);

      const temperatureValues = [];
      const humidityValues = [];
      const labelValues = [];

      for (let i = 0; i < temperatureData.feeds.length; i++) {
        const temperature =
          temperatureData.feeds[i][`field${TEMPERATURE_FIELD}`];
        const humidity = humidityData.feeds[i][`field${HUMIDITY_FIELD}`];

        if (isNaN(temperature) || isNaN(humidity)) continue;
        if (Number(temperature) <= 0 || Number(humidity) <= 0) continue;

        temperatureValues.push(Number(temperature));
        humidityValues.push(Number(humidity));

        const date = new Date(temperatureData.feeds[i].created_at);
        labelValues.push(
          `${padZero(date.getHours())}:${padZero(date.getMinutes())}`
        );
      }

      setValues({ temperature: temperatureValues, humidity: humidityValues });
      setLabels(labelValues);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (!labels || !values)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={{ color: "blue" }}>Temperature</Text>
      <Chart
        color="blue"
        values={paginate(values.temperature)}
        labels={paginate(labels)}
      />

      <View style={styles.buttonContainer}>
        <Button title="<" onPress={() => move(1)} />
        <Button title=">" onPress={() => move(-1)} />
      </View>

      <Chart
        color="red"
        values={paginate(values.humidity)}
        labels={paginate(labels)}
      />
      <Text style={{ color: "red" }}>Humidity</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
});
