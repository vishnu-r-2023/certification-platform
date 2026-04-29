import api from "./api";

export const getCourses = async () => {
  const { data } = await api.get("/api/courses");
  return data;
};

export const getCourseById = async (courseId) => {
  const { data } = await api.get(`/api/courses/${courseId}`);
  return data;
};

export const createCourse = async (payload) => {
  const { data } = await api.post("/api/courses", payload);
  return data;
};

export const updateCourse = async (courseId, payload) => {
  const { data } = await api.put(`/api/courses/${courseId}`, payload);
  return data;
};

export const deleteCourse = async (courseId) => {
  const { data } = await api.delete(`/api/courses/${courseId}`);
  return data;
};
