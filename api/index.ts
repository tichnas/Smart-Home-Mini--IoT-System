import api from "./helper";
import {
  CHANNEL_ID,
  WRITE_KEY,
  READ_KEY,
  TEMPERATURE_FIELD,
  HUMIDITY_FIELD,
  RESULTS,
  ALARM_FIELD,
} from "../constants/env";

export default {
  async getTemperature() {
    try {
      const res = await api.get(
        `/channels/${CHANNEL_ID}/fields/${TEMPERATURE_FIELD}.json?api_key=${READ_KEY}&results=${RESULTS}`
      );
      return res.data;
    } catch (err: any) {
      throw err.response.data;
    }
  },
  async getHumidity() {
    try {
      const res = await api.get(
        `/channels/${CHANNEL_ID}/fields/${HUMIDITY_FIELD}.json?api_key=${READ_KEY}&results=${RESULTS}`
      );
      return res.data;
    } catch (err: any) {
      throw err.response.data;
    }
  },
  async getAlarm() {
    try {
      const res = await api.get(
        `/channels/${CHANNEL_ID}/fields/${ALARM_FIELD}/last.json?api_key=${READ_KEY}`
      );
      return res.data;
    } catch (err: any) {
      throw err.response.data;
    }
  },
  async setAlarm(value: number) {
    try {
      const res = await api.get(
        `/update?api_key=${WRITE_KEY}&field${ALARM_FIELD}=${value}`
      );
      return res.data;
    } catch (err: any) {
      throw err.response.data;
    }
  },
};
