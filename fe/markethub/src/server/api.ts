import axios from "axios";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:3002";

const serverApi = axios.create({
    baseURL: `${BACKEND_ORIGIN}/api/v1`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

export default serverApi;
