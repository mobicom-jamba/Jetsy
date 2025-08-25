const nextConfig = {
  env: {
    API_URL: process.env.API_URL || "http://localhost:5000/api",
  },
  images: {
    domains: ["graph.facebook.com", "scontent.xx.fbcdn.net"],
  },
};

module.exports = nextConfig;
