import { Capacitor } from "@capacitor/core";
import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile"
      ? "https://fomotracker.vercel.app"
      : "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (Capacitor.isNativePlatform()) {
    config.baseURL = "https://fomotracker.vercel.app";
  }
  return config;
});
