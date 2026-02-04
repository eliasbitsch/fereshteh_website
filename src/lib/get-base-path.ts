export function getBasePath() {
  // Only use base path for static export (GitHub Pages)
  // Self-hosted deployments don't need it
  // Check both vars: NEXT_PUBLIC_ for client-side, STATIC_EXPORT for server-side
  const isStatic =
    process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
    process.env.STATIC_EXPORT === "true";
  return isStatic ? "/fereshteh_website" : "";
}

export function withBasePath(path: string) {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}
