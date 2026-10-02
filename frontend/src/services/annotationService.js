import API from "./api";

// Bookmarks
export const getBookmarks = async (docId) => {
  const res = await API.get(`/annotations/bookmarks/${docId}`);
  return res.data;
};

export const createBookmark = async (payload) => {
  const res = await API.post("/annotations/bookmarks", payload);
  return res.data;
};

export const deleteBookmark = async (id) => {
  const res = await API.delete(`/annotations/bookmarks/${id}`);
  return res.data;
};

// Highlights
export const getHighlights = async (docId) => {
  const res = await API.get(`/annotations/highlights/${docId}`);
  return res.data;
};

export const createHighlight = async (payload) => {
  const res = await API.post("/annotations/highlights", payload);
  return res.data;
};

export const updateHighlight = async (id, payload) => {
  const res = await API.put(`/annotations/highlights/${id}`, payload);
  return res.data;
};

export const deleteHighlight = async (id) => {
  const res = await API.delete(`/annotations/highlights/${id}`);
  return res.data;
};

// Notes
export const getNotes = async (docId) => {
  const res = await API.get(`/annotations/notes/${docId}`);
  return res.data;
};

export const createNote = async (payload) => {
  const res = await API.post("/annotations/notes", payload);
  return res.data;
};

export const updateNote = async (id, payload) => {
  const res = await API.put(`/annotations/notes/${id}`, payload);
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await API.delete(`/annotations/notes/${id}`);
  return res.data;
};
