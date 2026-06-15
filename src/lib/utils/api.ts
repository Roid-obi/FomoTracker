import axios from "axios";
import { Capacitor } from "@capacitor/core";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile" ? "https://fomotracker.vercel.app" : "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (Capacitor.isNativePlatform()) {
    config.baseURL = "https://fomotracker.vercel.app";
  }
  return config;
});
