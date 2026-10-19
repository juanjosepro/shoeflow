import dayjs from "@/shared/lib/dayjs";

export const formatMoney = (value?: string | number | null) =>
  value == null ? "—" : `S/ ${Number(value).toFixed(2)}`;

export const formatDay = (value: string) => dayjs(value).format("D MMM YYYY");

// El backend responde { detail }, { amount_paid } o { non_field_errors }
export const getApiError = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.amount_paid === "string") return data.amount_paid;
  if (Array.isArray(data?.amount_paid)) return data.amount_paid.join(" ");
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors.join(" ");
  return fallback;
};