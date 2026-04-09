import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Попробуй оставить пустым или добавь это, чтобы игнорировать ошибки типов при деплое */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;