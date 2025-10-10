import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3000/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});
