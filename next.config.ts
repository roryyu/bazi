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
      // /proxy 路由：将 /proxy/* 映射到 public 目录下的静态文件
      {
        // 带扩展名的文件（.css/.js/.png/.html 等）：去掉 /proxy 前缀，直接从 public 提供
        source: '/proxy/:path(.*\\.[a-zA-Z0-9]+$)',
        destination: '/:path',
      },
      {
        // 不带扩展名的路径：去掉 /proxy 前缀并自动追加 .html
        source: '/proxy/:path((?!.*\\.[a-zA-Z0-9]+$).*)',
        destination: '/:path.html',
      },
    ];
  },
};

export default nextConfig;
