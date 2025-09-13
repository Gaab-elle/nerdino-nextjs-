export function getStackBlitzEmbedUrl(
  githubUrl: string,
  opts?: { file?: string; theme?: "dark" | "light"; hideNavigation?: boolean }
) {
  if (!githubUrl) return null;

  // tenta extrair owner e repo (suporta trailing slash e .git)
  const m = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:[\/#?]|$)/i);
  if (!m) return null;

  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");

  const params = new URLSearchParams();
  params.set("embed", "1");
  if (opts?.hideNavigation !== false) params.set("hideNavigation", "1");
  if (opts?.theme) params.set("theme", opts.theme);
  if (opts?.file) params.set("file", opts.file);

  return `https://stackblitz.com/github/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?${params.toString()}`;
}
