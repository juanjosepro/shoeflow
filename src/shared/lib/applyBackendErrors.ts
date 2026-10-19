import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "@/shared/lib/toast";

export function applyBackendErrors<T extends FieldValues>(
  e: any,
  setError: UseFormSetError<T>,
  fields: T,
  fieldMap: Record<string, string> = {}
): boolean {
  const data = e?.response?.data;
  if (e?.response?.status !== 400 || typeof data !== "object") return false;

  Object.entries(data).forEach(([key, value]) => {
    const message = [value].flat().join(" ");
    const field = fieldMap[key] ?? key;

    if (field in fields) setError(field as Path<T>, { type: "server", message });
    else toast.error(message); // non_field_errors, detail, etc.
  });

  return true;
}