/** Separate build output allows verification without disrupting a running dev server. */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/data/**",
          "**/.data/**",
        ],
      };
    }

    return config;
  },
};

export default nextConfig;
