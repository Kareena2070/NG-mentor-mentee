import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const submitMenteeForm = (data) => {
  return API.post("/mentee-form", data);
};

export const submitMentorForm = (data) => {
  return API.post("/mentor-form", data);
};