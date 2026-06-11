import axios from "axios";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

export const api = axios.create({
  baseURL: isMobile ? "https://fomotracker.vercel.app" : "",
  withCredentials: true,
});
