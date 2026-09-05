/** Separate build output allows verification without disrupting a running dev server. */
export default { distDir: process.env.NEXT_DIST_DIR || ".next" };
