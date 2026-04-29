import { useState, useEffect, useRef } from 'react';
import type { Player, PlayerQueryParams } from '@shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UsePlayersResult {
  players: Player[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function usePlayers(params: PlayerQueryParams): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = params.q !== undefined ? 300 : 0;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.sort) query.set('sort', params.sort);
      if (params.order) query.set('order', params.order);
      if (params.position) query.set('position', params.position);
      if (params.team) query.set('team', params.team);
      if (params.status) query.set('status', params.status);
      if (params.q) query.set('q', params.q);

      try {
        const res = await fetch(`${API_URL}/api/players?${query}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setPlayers(data.data);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load players');
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params.page, params.limit, params.sort, params.order, params.position, params.team, params.status, params.q]);

  return { players, total, loading, error };
}
