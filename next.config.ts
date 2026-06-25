import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/llm',
        destination: '/llm/index.html',
      },
      {
        source: '/llm/',
        destination: '/llm/index.html',
      },
      {
        // 匹配目录路径（不以 .html 结尾），自动添加 index.html
        source: '/llm/:path((?!.*\\.html$).*)',
        destination: '/llm/:path/index.html',
      },
      {
        source: '/llm/:path*',
        destination: '/llm/:path*',
      },
    ];
  },
};

export default nextConfig;
