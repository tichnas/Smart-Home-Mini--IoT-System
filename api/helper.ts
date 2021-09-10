import axios from "axios";

export default {
  get(url: string) {
    return axios.get("https://api.thingspeak.com" + url);
  },
};
