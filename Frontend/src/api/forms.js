
import API from "./axios";

export const submitMenteeForm = (data) => {
  return API.post("/mentee-forms", data);
};

export const getMenteeMentors = () => {
  return API.get("/mentee-forms/mentors");
};

export const submitMentorForm = (data) => {
  return API.post("/mentor-forms", data);
};

export const getMentorMentees = () => {
  return API.get("/mentor-forms/mentees");
};