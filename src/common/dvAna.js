import axios from "axios";
const qs = require("querystring");

export default function dvAna(record) {
  const token = process.env.REACT_APP_MAP_API;
  axios({
    method: "post",
    url: `https://dvana.ellieben.com:2046/records/`,
    data: qs.stringify(record),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: token,
    },
  })
    .then((response) => {
      return null;
    })
    .catch((err) => {
      return null;
    });
}
