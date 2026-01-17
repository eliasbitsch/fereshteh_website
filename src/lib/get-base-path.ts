export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/fereshteh_website' : '';
}

export function withBasePath(path: string) {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}
