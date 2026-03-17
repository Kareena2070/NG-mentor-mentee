
import API from "./axios";

export const submitMenteeForm = (data) => {
  return API.post("/mentee-forms", data);
};

export const submitMentorForm = (data) => {
  return API.post("/mentor-forms", data);
};