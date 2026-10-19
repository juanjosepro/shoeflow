// Saca un mensaje legible de lo que responde el backend:
// { detail: "..." } (por ejemplo "está en uso") o { name: ["... ya existe"] } (error de un campo)
export const getApiError = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;

  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
};