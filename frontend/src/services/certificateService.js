import api from "./api";

export const getCertificateByCourse = async (courseId) => {
  const { data } = await api.get(`/api/certificate/${courseId}`);
  return data;
};
