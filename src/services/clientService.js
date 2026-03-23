import axios from "axios";

const API = "http://localhost:5001";

// CREATE
export const addClient = (data) => axios.post(`${API}/add-client`, data);

// GET
export const getClients = () => axios.get(`${API}/clients`);

// UPDATE
export const updateClient = (id, data) =>
  axios.put(`${API}/update-client/${id}`, data);

// DELETE
export const deleteClientById = (id) =>
  axios.delete(`${API}/delete-client/${id}`);