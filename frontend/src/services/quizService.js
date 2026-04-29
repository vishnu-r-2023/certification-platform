import api from "./api";

export const submitQuiz = async (payload) => {
  const { data } = await api.post("/api/quiz/submit", payload);
  return data;
};
