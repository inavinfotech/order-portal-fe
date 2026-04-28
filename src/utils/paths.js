export const getPath = (path) => {
  const prefix = "/order";
  if (path === "/") return prefix;
  if (path.startsWith(prefix)) return path;
  return `${prefix}${path.startsWith("/") ? "" : "/"}${path}`;
};
