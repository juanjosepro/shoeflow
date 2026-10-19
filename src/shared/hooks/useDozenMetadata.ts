
import { useEffect, useState } from "react";
import {
  getDozenMetadata,
  type DozenMetadata,
} from "@/shared/services/metadata.service";

export function useDozenMetadata() {
  const [metadata, setMetadata] = useState<DozenMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;

    getDozenMetadata()
      .then((data) => {
        if (active) {
          setMetadata(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { metadata, loading, error };
}