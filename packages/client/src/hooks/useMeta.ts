import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

interface Meta {
  positions: string[];
  teams: string[];
  statuses: string[];
}

interface UseMetaResult extends Meta {
  error: string | null;
}

export function useMeta(): UseMetaResult {
  const [meta, setMeta] = useState<Meta>({ positions: [], teams: [], statuses: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/players/meta`)
      .then((r) => r.json())
      .then(setMeta)
      .catch((err) => {
        console.error('Failed to fetch player meta:', err);
        setError('Failed to load filter options');
      });
  }, []);

  return { ...meta, error };
}
