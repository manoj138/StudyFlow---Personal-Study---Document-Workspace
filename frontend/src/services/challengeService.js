import API from "./api";

/**
 * Fetch all challenges for logged in user
 */
export const getChallenges = async () => {
  const response = await API.get("/challenges");
  return response.data;
};

/**
 * Fetch single challenge by ID
 */
export const getChallengeById = async (id) => {
  const response = await API.get(`/challenges/${id}`);
  return response.data;
};

/**
 * Create challenge from prompt / text
 */
export const createChallengeFromPrompt = async ({ prompt, durationDays, dailyHours, targetGoal }) => {
  const response = await API.post("/challenges/create-prompt", {
    prompt,
    durationDays,
    dailyHours,
    targetGoal
  });
  return response.data;
};

/**
 * Create challenge from uploaded file (.pdf, .md, .txt, .docx)
 */
export const createChallengeFromFile = async (formData) => {
  const response = await API.post("/challenges/create-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

/**
 * Seed the exact 30-Day Developer Roadmap from the user's uploaded image
 */
export const seedDemoRoadmap = async () => {
  const response = await API.post("/challenges/seed-demo");
  return response.data;
};

/**
 * Toggle completion of a subtask within a day
 */
export const toggleSubTask = async ({ challengeId, dayNumber, taskId, completed }) => {
  const response = await API.patch(`/challenges/${challengeId}/task-toggle`, {
    dayNumber,
    taskId,
    completed
  });
  return response.data;
};

/**
 * Delete a challenge
 */
export const deleteChallenge = async (id) => {
  const response = await API.delete(`/challenges/${id}`);
  return response.data;
};
