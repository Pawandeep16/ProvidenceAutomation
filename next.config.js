/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  env: {
    GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    PROVIDENCE_USERNAME: process.env.PROVIDENCE_USERNAME,
    PROVIDENCE_PASSWORD: process.env.PROVIDENCE_PASSWORD,
  },
  // Add the webpack config to handle serverless environments
  webpack: (config, { isServer }) => {
    // Only apply this configuration on the server-side
    if (isServer) {
      // This part tells Next.js not to bundle these packages, as they are
      // required at runtime in the serverless function.
      config.externals.push({
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
        'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
      });
    }

    return config;
  },
};

export default nextConfig;
