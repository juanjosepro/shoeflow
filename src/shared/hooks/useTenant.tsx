export function useTenant() {
  const hostname = window.location.hostname;

  const parts = hostname.split(".");

  const slug = hostname.endsWith(".localhost")
    ? parts[0]
    : parts.length >= 3
      ? parts[0]
      : null;

  const name = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

  return {
    slug,
    name,
  };
}
