import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Meta {
  positions: string[];
  teams: string[];
  statuses: string[];
}

export function useMeta(): Meta {
  const [meta, setMeta] = useState<Meta>({ positions: [], teams: [], statuses: [] });

  useEffect(() => {
    fetch(`${API_URL}/api/players/meta`)
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => {});
  }, []);

  return meta;
}
