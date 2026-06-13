import { api } from "@/lib/api/client";

// Patient records and their saved analysis history. All endpoints are scoped
// server-side to the signed-in doctor.
export const patientsApi = {
  list: () => api.get("/patients"),
  create: ({ name, medications = [] }) =>
    api.post("/patients", { name, medications }),
  update: (id, patch) => api.patch(`/patients/${id}`, patch),
  remove: (id) => api.del(`/patients/${id}`),
  listHistory: (id) => api.get(`/patients/${id}/history`),
  addHistory: (id, entry) => api.post(`/patients/${id}/history`, entry),
  clearHistory: (id) => api.del(`/patients/${id}/history`),
};
