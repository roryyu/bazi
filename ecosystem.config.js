module.exports = {
  apps: [
    {
      name: "bazi",
      cwd: "/workspace",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
