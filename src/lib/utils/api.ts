import axios from "axios";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

export const api = axios.create({
  baseURL: isMobile ? "https://fomo-tracker.vercel.app" : "",
  withCredentials: true,
});
