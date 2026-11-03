import API from "./api";

/**
 * Fetch all user interview sets
 */
export const getInterviewSets = async () => {
  const response = await API.get("/interviews");
  return response.data;
};

/**
 * Fetch a single interview set by ID (with all Q&A and history)
 */
export const getInterviewSetById = async (id) => {
  const response = await API.get(`/interviews/${id}`);
  return response.data;
};

/**
 * Create an interview set from pasted/raw text
 */
export const createInterviewFromText = async ({ title, topic, rawText }) => {
  const response = await API.post("/interviews/create-text", {
    title,
    topic,
    rawText
  });
  return response.data;
};

/**
 * Create an interview set from uploaded file (PDF, Word, MD, TXT)
 */
export const createInterviewFromFile = async (formData) => {
  const response = await API.post("/interviews/create-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

/**
 * Create an interview set from existing document in library
 */
export const createInterviewFromDocument = async ({ documentId, title, topic }) => {
  const response = await API.post("/interviews/create-from-document", {
    documentId,
    title,
    topic
  });
  return response.data;
};

/**
 * Update an existing interview set (title, topic, questions)
 */
export const updateInterviewSet = async (id, data) => {
  const response = await API.put(`/interviews/${id}`, data);
  return response.data;
};

/**
 * Delete an interview set
 */
export const deleteInterviewSet = async (id) => {
  const response = await API.delete(`/interviews/${id}`);
  return response.data;
};

/**
 * Save user attempt result after finishing mock interview session
 */
export const saveInterviewAttempt = async (id, attemptData) => {
  const response = await API.post(`/interviews/${id}/attempt`, attemptData);
  return response.data;
};

/**
 * Evaluate spoken answer in real time using backend AI / heuristic
 */
export const evaluateSpokenAnswer = async ({ question, idealAnswer, userAnswer, keywords }) => {
  const response = await API.post("/interviews/evaluate", {
    question,
    idealAnswer,
    userAnswer,
    keywords
  });
  return response.data;
};

