import API from "./api";

export const uploadDocument = async (formData) => {
  const res = await API.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const importYouTubeDocument = async ({ youtubeUrl, subjectId, customTitle }) => {
  const res = await API.post("/documents/import-youtube", {
    youtubeUrl,
    subjectId,
    customTitle
  });
  return res.data;
};

export const getDocuments = async (params = {}) => {
  const res = await API.get("/documents", { params });
  return res.data;
};

export const getDocumentById = async (id) => {
  const res = await API.get(`/documents/${id}`);
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await API.delete(`/documents/${id}`);
  return res.data;
};

export const updateReadingProgress = async (documentId, payload) => {
  const res = await API.put(`/progress/${documentId}`, payload);
  return res.data;
};

export const getReadingProgress = async (documentId) => {
  const res = await API.get(`/progress/${documentId}`);
  return res.data;
};
