import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // 카카오 콘솔에 등록된 Web 도메인(localhost:5174)과 맞춘다
  server: { port: 5174, strictPort: true },
});
