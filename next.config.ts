/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "dsebtrmrf0wr2.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;