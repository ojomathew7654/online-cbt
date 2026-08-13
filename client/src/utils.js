/* eslint-disable react/prop-types */

export const apiUrl =
  import.meta.env.MODE == "development"
    ? "http://localhost:5000"
    : "https://cbt-api.ascodeelevate.com";

export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};
